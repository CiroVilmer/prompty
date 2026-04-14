"""
MELI Laptops Dataset Collector
================================
Hackathon Anthropic/Kaszek - Listing Optimizer con DSPy

Recolecta datos de laptops/notebooks desde la API de MercadoLibre.
Laptops tienen muchos atributos técnicos (RAM, CPU, GPU, pantalla,
almacenamiento) → ideal para demostrar el valor del optimizer.
"""

import requests
import json
import time
import os
from datetime import datetime
from pathlib import Path


# ============================================================
# CONFIG
# ============================================================
ACCESS_TOKEN = os.environ.get("MELI_ACCESS_TOKEN",
    "APP_USR-3709463098260571-041315-ca70b26489280680c8162394e035e549-369195231")
BASE_URL = "https://api.mercadolibre.com"
HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

OUTPUT_DIR = Path("dataset_laptops")
OUTPUT_DIR.mkdir(exist_ok=True)


def api_get(endpoint, params=None):
    url = f"{BASE_URL}{endpoint}"
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 429:
            print(f"  ⏳ Rate limited, esperando 5s...")
            time.sleep(5)
            return api_get(endpoint, params)
        else:
            print(f"  ⚠️ {resp.status_code} en {endpoint}")
            return None
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None


def save_json(data, filename):
    path = OUTPUT_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  💾 {path}")


# ============================================================
# PASO 1: Encontrar categorías de laptops/notebooks
# ============================================================
def find_laptop_categories():
    print("\n" + "="*60)
    print("PASO 1: Buscando categorías de laptops/notebooks")
    print("="*60)

    categories = []

    # Computación (MLA1648) es la raíz
    print("\n💻 Explorando Computación (MLA1648)...")
    comp = api_get("/categories/MLA1648")
    if comp and "children_categories" in comp:
        for child in comp["children_categories"]:
            print(f"  📁 {child['id']}: {child['name']}")
            if any(kw in child["name"].lower() for kw in
                   ["laptop", "notebook", "portátil", "portatil"]):
                categories.append({
                    "id": child["id"], "name": child["name"], "source": "Computación"
                })
                # Explorar subcategorías
                sub = api_get(f"/categories/{child['id']}")
                if sub and "children_categories" in sub:
                    for sc in sub["children_categories"]:
                        print(f"    └── {sc['id']}: {sc['name']}")
                        categories.append({
                            "id": sc["id"], "name": sc["name"], "source": "Computación"
                        })
                        # Un nivel más
                        subsub = api_get(f"/categories/{sc['id']}")
                        if subsub and "children_categories" in subsub:
                            for ssc in subsub["children_categories"]:
                                print(f"      └── {ssc['id']}: {ssc['name']}")
                                categories.append({
                                    "id": ssc["id"], "name": ssc["name"], "source": "Computación"
                                })
                        time.sleep(0.2)
                time.sleep(0.3)

    # También buscar en Electrónica (MLA1000)
    print("\n🔌 Explorando Electrónica (MLA1000)...")
    elec = api_get("/categories/MLA1000")
    if elec and "children_categories" in elec:
        for child in elec["children_categories"]:
            if any(kw in child["name"].lower() for kw in
                   ["laptop", "notebook", "computad"]):
                print(f"  📁 {child['id']}: {child['name']}")
                categories.append({
                    "id": child["id"], "name": child["name"], "source": "Electrónica"
                })

    # Probar categorías conocidas directamente
    known_laptop_cats = [
        "MLA1652",   # Laptops y Notebooks (conocida)
        "MLA430687", # Notebooks
    ]
    for cat_id in known_laptop_cats:
        data = api_get(f"/categories/{cat_id}")
        if data:
            print(f"\n  💻 Directa: {data['id']} - {data.get('name', '?')}")
            existing_ids = {c["id"] for c in categories}
            if data["id"] not in existing_ids:
                categories.append({
                    "id": data["id"],
                    "name": data.get("name", ""),
                    "source": "directa"
                })
            if "children_categories" in data:
                for child in data["children_categories"]:
                    print(f"    └── {child['id']}: {child['name']}")
                    if child["id"] not in existing_ids:
                        categories.append({
                            "id": child["id"], "name": child["name"], "source": "directa"
                        })
        time.sleep(0.3)

    # Dedup
    seen = set()
    unique = []
    for c in categories:
        if c["id"] not in seen:
            seen.add(c["id"])
            unique.append(c)

    print(f"\n✅ {len(unique)} categorías de laptops encontradas")
    save_json(unique, "01_categories.json")
    return unique


# ============================================================
# PASO 2: Highlights por categoría
# ============================================================
def get_highlights(categories):
    print("\n" + "="*60)
    print("PASO 2: Obteniendo highlights (best sellers)")
    print("="*60)

    product_ids = set()
    item_ids = set()
    all_highlights = []

    for cat in categories:
        print(f"\n🏆 {cat['id']}: {cat['name']}...")
        data = api_get(f"/highlights/MLA/category/{cat['id']}")

        if data and "content" in data:
            for entry in data["content"]:
                etype = entry.get("type", "")
                eid = entry.get("id", "")
                all_highlights.append({
                    "type": etype, "id": eid,
                    "position": entry.get("position"),
                    "category_id": cat["id"],
                    "category_name": cat["name"],
                })
                if etype == "PRODUCT":
                    product_ids.add(eid)
                elif etype == "ITEM":
                    item_ids.add(eid)

            prods = sum(1 for h in data["content"] if h.get("type") == "PRODUCT")
            items = sum(1 for h in data["content"] if h.get("type") == "ITEM")
            print(f"  ✅ {prods} products, {items} items")
        else:
            print(f"  ⚠️ Sin highlights")
        time.sleep(0.4)

    print(f"\n📊 Product IDs: {len(product_ids)} | Item IDs: {len(item_ids)}")
    save_json(all_highlights, "02_highlights.json")
    save_json(list(product_ids), "02_product_ids.json")
    save_json(list(item_ids), "02_item_ids.json")
    return list(product_ids), list(item_ids), all_highlights


# ============================================================
# PASO 3: Detalle de productos del catálogo
# ============================================================
def get_product_details(product_ids):
    print("\n" + "="*60)
    print(f"PASO 3: Detalle de {len(product_ids)} productos")
    print("="*60)

    products = []
    for i, pid in enumerate(product_ids):
        print(f"  📦 [{i+1}/{len(product_ids)}] {pid}...", end=" ")
        data = api_get(f"/products/{pid}")
        if data:
            attrs = {a["id"]: a.get("value_name", "")
                     for a in data.get("attributes", [])}
            product = {
                "source_type": "CATALOG_PRODUCT",
                "id": pid,
                "name": data.get("name", ""),
                "domain_id": data.get("domain_id", ""),
                # Atributos técnicos clave de laptops
                "brand": attrs.get("BRAND", ""),
                "model": attrs.get("MODEL", ""),
                "line": attrs.get("LINE", ""),
                "processor_brand": attrs.get("PROCESSOR_BRAND", ""),
                "processor_model": attrs.get("PROCESSOR_MODEL", ""),
                "processor_line": attrs.get("PROCESSOR_LINE", ""),
                "ram_memory": attrs.get("RAM_MEMORY", ""),
                "ram_type": attrs.get("RAM_MEMORY_TYPE", ""),
                "storage_capacity": attrs.get("STORAGE_CAPACITY", ""),
                "storage_type": attrs.get("HARD_DRIVE_TYPE", ""),
                "screen_size": attrs.get("SCREEN_SIZE", ""),
                "screen_resolution": attrs.get("DISPLAY_RESOLUTION", ""),
                "gpu_brand": attrs.get("GPU_BRAND", ""),
                "gpu_model": attrs.get("GPU_MODEL", ""),
                "os": attrs.get("OPERATING_SYSTEM", ""),
                "os_version": attrs.get("OPERATING_SYSTEM_VERSION", ""),
                "battery_life": attrs.get("BATTERY_LIFE", ""),
                "weight": attrs.get("WEIGHT", ""),
                "color": attrs.get("COLOR", ""),
                "condition": attrs.get("ITEM_CONDITION", ""),
                # Todos los atributos
                "all_attributes": {a["id"]: a.get("value_name", "")
                                   for a in data.get("attributes", [])
                                   if a.get("value_name")},
                "num_pictures": len(data.get("pictures", [])),
                "picture_urls": [p.get("url", "") for p in data.get("pictures", [])],
                "short_description": data.get("short_description", ""),
            }
            products.append(product)
            cpu = f"{product['processor_brand']} {product['processor_model']}".strip()
            print(f"✅ {product['brand']} {product['model']} | {cpu} | {product['ram_memory']} RAM")
        else:
            print("❌")
        time.sleep(0.4)

    save_json(products, "03_products.json")
    return products


# ============================================================
# PASO 4: Trends
# ============================================================
def get_trends(categories):
    print("\n" + "="*60)
    print("PASO 4: Trends por categoría")
    print("="*60)

    all_trends = {}
    seen = set()
    for cat in categories:
        cid = cat["id"]
        if cid in seen:
            continue
        seen.add(cid)
        data = api_get(f"/trends/MLA/{cid}")
        if data and isinstance(data, list) and len(data) > 0:
            keywords = [t.get("keyword", "") for t in data]
            all_trends[cid] = {"name": cat["name"], "keywords": keywords}
            print(f"  🔥 {cid} ({cat['name']}): {len(keywords)} keywords")
            for k in keywords[:5]:
                print(f"     🔑 {k}")
        time.sleep(0.3)

    save_json(all_trends, "04_trends.json")
    return all_trends


# ============================================================
# PASO 5: Atributos requeridos
# ============================================================
def get_attributes(categories):
    print("\n" + "="*60)
    print("PASO 5: Atributos por categoría")
    print("="*60)

    all_attrs = {}
    seen = set()
    for cat in categories:
        cid = cat["id"]
        if cid in seen:
            continue
        seen.add(cid)
        data = api_get(f"/categories/{cid}/attributes")
        if data and isinstance(data, list):
            required = [a for a in data
                        if a.get("tags", {}).get("required")
                        and not a.get("tags", {}).get("hidden")]
            all_attrs[cid] = {
                "name": cat["name"],
                "total": len(data),
                "required_count": len(required),
                "required_attrs": [
                    {"id": a["id"], "name": a["name"],
                     "value_type": a.get("value_type", "")}
                    for a in required
                ],
            }
            print(f"  📋 {cid}: {len(data)} attrs ({len(required)} required)")
        time.sleep(0.3)

    save_json(all_attrs, "05_attributes.json")
    return all_attrs


# ============================================================
# PASO 6: Dataset final
# ============================================================
def build_dataset(products, highlights, trends, attributes):
    print("\n" + "="*60)
    print("PASO 6: Construyendo dataset")
    print("="*60)

    highlight_map = {h["id"]: h for h in highlights}
    dataset = []

    for p in products:
        pid = p["id"]
        h_info = highlight_map.get(pid, {})
        cat_id = h_info.get("category_id", "")

        filled = sum(1 for v in p["all_attributes"].values() if v)
        total = len(p["all_attributes"])
        completeness = filled / max(total, 1)

        # Laptop-specific quality: atributos técnicos clave
        tech_fields = ["processor_brand", "processor_model", "ram_memory",
                       "storage_capacity", "screen_size", "os", "gpu_model"]
        tech_filled = sum(1 for f in tech_fields if p.get(f))
        tech_score = tech_filled / len(tech_fields)

        quality = (
            completeness * 0.25 +
            tech_score * 0.30 +
            (min(p["num_pictures"], 8) / 8) * 0.20 +
            (1.0 if p["brand"] else 0) * 0.10 +
            (1.0 if p["model"] else 0) * 0.10 +
            (1.0 if p.get("short_description") else 0) * 0.05
        )

        trend_kws = trends.get(cat_id, {}).get("keywords", [])

        dataset.append({
            "id": pid,
            "source_type": p["source_type"],
            "input": {
                "product_name": p["name"],
                "brand": p["brand"],
                "model": p["model"],
                "line": p["line"],
                "processor": f"{p['processor_brand']} {p['processor_model']}".strip(),
                "processor_line": p["processor_line"],
                "ram": p["ram_memory"],
                "ram_type": p["ram_type"],
                "storage": p["storage_capacity"],
                "storage_type": p["storage_type"],
                "screen_size": p["screen_size"],
                "screen_resolution": p["screen_resolution"],
                "gpu": f"{p['gpu_brand']} {p['gpu_model']}".strip(),
                "os": f"{p['os']} {p['os_version']}".strip(),
                "battery": p["battery_life"],
                "weight": p["weight"],
                "color": p["color"],
                "category_id": cat_id,
                "category_name": h_info.get("category_name", ""),
                "num_photos": p["num_pictures"],
                "photo_urls": p["picture_urls"][:3],
                "all_attributes": p["all_attributes"],
                "trending_keywords": trend_kws[:10],
            },
            "output": {
                "title": p["name"],
                "short_description": p.get("short_description", ""),
                "quality_score": round(quality, 3),
                "tech_score": round(tech_score, 3),
                "attributes_filled": filled,
                "attributes_total": total,
                "highlight_position": h_info.get("position"),
            }
        })

    dataset.sort(key=lambda x: x["output"]["quality_score"], reverse=True)

    print(f"\n📊 Dataset: {len(dataset)} productos")
    if dataset:
        scores = [d["output"]["quality_score"] for d in dataset]
        tech_scores = [d["output"]["tech_score"] for d in dataset]
        print(f"   Quality score: {min(scores):.3f} - {max(scores):.3f} (avg {sum(scores)/len(scores):.3f})")
        print(f"   Tech score:    {min(tech_scores):.3f} - {max(tech_scores):.3f} (avg {sum(tech_scores)/len(tech_scores):.3f})")

    # Brands breakdown
    brands = {}
    for d in dataset:
        b = d["input"].get("brand", "?") or "?"
        brands[b] = brands.get(b, 0) + 1
    print(f"\n🏷️ Marcas ({len(brands)}):")
    for b, c in sorted(brands.items(), key=lambda x: -x[1])[:15]:
        print(f"   {b}: {c}")

    # Processors breakdown
    cpus = {}
    for d in dataset:
        cpu = d["input"].get("processor", "?") or "?"
        cpus[cpu] = cpus.get(cpu, 0) + 1
    print(f"\n🧠 Procesadores ({len(cpus)}):")
    for cpu, c in sorted(cpus.items(), key=lambda x: -x[1])[:10]:
        print(f"   {cpu}: {c}")

    save_json(dataset, "06_dataset_final.json")

    # Quick version
    quick = [{
        "id": d["id"],
        "name": d["input"]["product_name"],
        "brand": d["input"]["brand"],
        "model": d["input"]["model"],
        "processor": d["input"]["processor"],
        "ram": d["input"]["ram"],
        "storage": d["input"]["storage"],
        "screen": d["input"]["screen_size"],
        "gpu": d["input"]["gpu"],
        "os": d["input"]["os"],
        "num_photos": d["input"]["num_photos"],
        "quality_score": d["output"]["quality_score"],
        "tech_score": d["output"]["tech_score"],
    } for d in dataset]
    save_json(quick, "06_dataset_quick.json")

    return dataset


# ============================================================
# MAIN
# ============================================================
def main():
    print("🚀 MELI Laptops Dataset Collector")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}")

    start = time.time()

    categories = find_laptop_categories()
    product_ids, item_ids, highlights = get_highlights(categories)
    products = get_product_details(product_ids[:100])  # Max 100
    trends = get_trends(categories)
    attributes = get_attributes(categories)
    dataset = build_dataset(products, highlights, trends, attributes)

    elapsed = time.time() - start
    print(f"\n{'='*60}")
    print(f"✅ COMPLETADO en {elapsed:.0f}s")
    print(f"📁 {OUTPUT_DIR.absolute()}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()