"""
MELI Laptops Dataset Collector V2 - ENFOCADO
==============================================
Solo recolecta de MLA1652 (Notebooks) y filtra
productos que realmente sean laptops.
"""

import requests
import json
import time
import os
from datetime import datetime
from pathlib import Path


ACCESS_TOKEN = os.environ.get("MELI_ACCESS_TOKEN",
    "APP_USR-3709463098260571-041315-ca70b26489280680c8162394e035e549-369195231")
BASE_URL = "https://api.mercadolibre.com"
HEADERS = {"Authorization": f"Bearer {ACCESS_TOKEN}", "Content-Type": "application/json"}
OUTPUT_DIR = Path("dataset_laptops_v2")
OUTPUT_DIR.mkdir(exist_ok=True)


def api_get(endpoint, params=None):
    url = f"{BASE_URL}{endpoint}"
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 429:
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
# PASO 1: Solo categorías de notebooks reales
# ============================================================
def get_notebook_categories():
    print("\n" + "="*60)
    print("PASO 1: Categorías de notebooks")
    print("="*60)

    # Las categorías que nos interesan
    TARGET_CATS = [
        "MLA1652",   # Notebooks (la principal — 16 products en highlights)
        "MLA430687", # Notebooks y Accesorios (padre — 18 products, algunos son notebooks)
    ]

    categories = []
    for cat_id in TARGET_CATS:
        data = api_get(f"/categories/{cat_id}")
        if data:
            total = data.get("total_items_in_this_category", 0)
            print(f"  💻 {cat_id}: {data['name']} ({total:,} items)")
            categories.append({
                "id": cat_id,
                "name": data["name"],
                "total_items": total
            })
        time.sleep(0.3)

    save_json(categories, "01_categories.json")
    return categories


# ============================================================
# PASO 2: Highlights + filtrar solo notebooks
# ============================================================
def get_notebook_highlights(categories):
    print("\n" + "="*60)
    print("PASO 2: Highlights (solo notebooks)")
    print("="*60)

    product_ids = set()
    all_highlights = []

    for cat in categories:
        print(f"\n🏆 {cat['id']}: {cat['name']}...")
        data = api_get(f"/highlights/MLA/category/{cat['id']}")
        if data and "content" in data:
            for entry in data["content"]:
                if entry.get("type") == "PRODUCT":
                    product_ids.add(entry["id"])
                    all_highlights.append({
                        "id": entry["id"],
                        "position": entry.get("position"),
                        "category_id": cat["id"],
                        "category_name": cat["name"],
                    })
            print(f"  ✅ {len([e for e in data['content'] if e.get('type') == 'PRODUCT'])} products")

        time.sleep(0.4)

    print(f"\n📊 Product IDs pre-filtro: {len(product_ids)}")
    save_json(list(product_ids), "02_product_ids_raw.json")
    return list(product_ids), all_highlights


# ============================================================
# PASO 3: Obtener detalles y FILTRAR solo laptops reales
# ============================================================
def get_laptop_products(product_ids):
    print("\n" + "="*60)
    print(f"PASO 3: Detalle de {len(product_ids)} productos (filtrando solo laptops)")
    print("="*60)

    # Dominios que son laptops reales
    LAPTOP_DOMAINS = [
        "MLA-LAPTOPS",
        "MLA-NOTEBOOKS",
        "MLA-LAPTOP_COMPUTERS",
        "MLA-GAMING_LAPTOPS",
    ]

    # Keywords en nombre que indican laptop
    LAPTOP_KEYWORDS = [
        "notebook", "laptop", "macbook", "chromebook",
        "ideapad", "thinkpad", "inspiron", "pavilion",
        "vivobook", "zenbook", "swift", "aspire",
        "latitude", "elitebook", "probook", "legión",
        "legion", "nitro", "predator", "rog",
        "victus", "omen", "galaxy book", "surface",
    ]

    laptops = []
    skipped = []

    for i, pid in enumerate(product_ids):
        print(f"  📦 [{i+1}/{len(product_ids)}] {pid}...", end=" ")
        data = api_get(f"/products/{pid}")
        if not data:
            print("❌")
            continue

        name = (data.get("name") or "").lower()
        domain = (data.get("domain_id") or "").upper()

        # Filtro: es una laptop?
        is_laptop = False

        # Check 1: domain_id
        if any(d in domain for d in ["LAPTOP", "NOTEBOOK"]):
            is_laptop = True

        # Check 2: nombre del producto
        if not is_laptop:
            if any(kw in name for kw in LAPTOP_KEYWORDS):
                is_laptop = True

        # Check 3: tiene atributos de laptop (procesador + RAM)
        if not is_laptop:
            attrs = {a["id"]: a.get("value_name", "") for a in data.get("attributes", [])}
            has_cpu = bool(attrs.get("PROCESSOR_MODEL") or attrs.get("PROCESSOR_BRAND"))
            has_ram = bool(attrs.get("RAM_MEMORY"))
            has_screen = bool(attrs.get("SCREEN_SIZE"))
            if has_cpu and has_ram and has_screen:
                is_laptop = True

        if not is_laptop:
            skipped.append({"id": pid, "name": data.get("name", ""), "domain": domain})
            print(f"⏭️ NO ES LAPTOP: {data.get('name', '')[:40]}")
            continue

        # Es laptop — extraer datos
        attrs = {a["id"]: a.get("value_name", "") for a in data.get("attributes", [])}

        product = {
            "source_type": "CATALOG_PRODUCT",
            "id": pid,
            "name": data.get("name", ""),
            "domain_id": data.get("domain_id", ""),
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
            "keyboard_language": attrs.get("KEYBOARD_LANGUAGE", ""),
            "usb_ports": attrs.get("USB_PORTS_QUANTITY", ""),
            "hdmi_ports": attrs.get("HDMI_PORTS_QUANTITY", ""),
            "webcam": attrs.get("HAS_WEBCAM", ""),
            "touchscreen": attrs.get("IS_TOUCHSCREEN", ""),
            "all_attributes": {a["id"]: a.get("value_name", "")
                               for a in data.get("attributes", [])
                               if a.get("value_name")},
            "num_pictures": len(data.get("pictures", [])),
            "picture_urls": [p.get("url", "") for p in data.get("pictures", [])],
            "short_description": data.get("short_description", ""),
        }

        cpu = f"{product['processor_brand']} {product['processor_model']}".strip() or "?"
        laptops.append(product)
        print(f"✅ {product['brand']} {product['model']} | {cpu} | "
              f"{product['ram_memory']} RAM | {product['screen_size']} | "
              f"{product['storage_capacity']}")

        time.sleep(0.4)

    print(f"\n📊 Laptops encontradas: {len(laptops)} / {len(product_ids)}")
    print(f"⏭️ Descartados: {len(skipped)}")

    if skipped:
        print(f"\n📋 Algunos descartados:")
        for s in skipped[:10]:
            print(f"   ❌ {s['name'][:50]} (domain: {s['domain']})")

    save_json(laptops, "03_laptops.json")
    save_json(skipped, "03_skipped.json")
    return laptops


# ============================================================
# PASO 4: Trends de notebooks
# ============================================================
def get_trends():
    print("\n" + "="*60)
    print("PASO 4: Trends de notebooks")
    print("="*60)

    all_trends = {}
    for cat_id, name in [("MLA1652", "Notebooks"), ("MLA430687", "Notebooks y Accesorios")]:
        data = api_get(f"/trends/MLA/{cat_id}")
        if data and isinstance(data, list):
            keywords = [t.get("keyword", "") for t in data]
            all_trends[cat_id] = {"name": name, "keywords": keywords}
            print(f"  🔥 {cat_id} ({name}): {len(keywords)} keywords")
            for k in keywords[:8]:
                print(f"     🔑 {k}")
        time.sleep(0.3)

    save_json(all_trends, "04_trends.json")
    return all_trends


# ============================================================
# PASO 5: Atributos de la categoría Notebooks
# ============================================================
def get_attributes():
    print("\n" + "="*60)
    print("PASO 5: Atributos de Notebooks (MLA1652)")
    print("="*60)

    data = api_get("/categories/MLA1652/attributes")
    if data and isinstance(data, list):
        required = [a for a in data
                    if a.get("tags", {}).get("required")
                    and not a.get("tags", {}).get("hidden")]
        optional_important = [a for a in data
                              if not a.get("tags", {}).get("hidden")
                              and not a.get("tags", {}).get("required")
                              and a["id"] in [
                                  "PROCESSOR_BRAND", "PROCESSOR_MODEL", "RAM_MEMORY",
                                  "STORAGE_CAPACITY", "SCREEN_SIZE", "GPU_MODEL",
                                  "OPERATING_SYSTEM", "BATTERY_LIFE", "WEIGHT",
                                  "DISPLAY_RESOLUTION", "RAM_MEMORY_TYPE",
                                  "HARD_DRIVE_TYPE", "PROCESSOR_LINE",
                              ]]

        attrs = {
            "total": len(data),
            "required_count": len(required),
            "required": [{"id": a["id"], "name": a["name"]} for a in required],
            "important_optional": [{"id": a["id"], "name": a["name"]} for a in optional_important],
            "all_visible": [
                {"id": a["id"], "name": a["name"],
                 "required": a.get("tags", {}).get("required", False)}
                for a in data if not a.get("tags", {}).get("hidden")
            ]
        }
        print(f"  📋 {len(data)} attrs total, {len(required)} required")
        print(f"  📋 {len(optional_important)} important optional (técnicos)")
        print(f"\n  Requeridos:")
        for a in required:
            print(f"    ✅ {a['id']}: {a['name']}")
        print(f"\n  Opcionales importantes:")
        for a in optional_important:
            print(f"    📝 {a['id']}: {a['name']}")

        save_json(attrs, "05_attributes.json")
        return attrs
    return {}


# ============================================================
# PASO 6: Dataset final
# ============================================================
def build_dataset(laptops, trends, attributes):
    print("\n" + "="*60)
    print("PASO 6: Construyendo dataset de laptops")
    print("="*60)

    dataset = []
    all_trend_kws = []
    for cat_data in trends.values():
        all_trend_kws.extend(cat_data.get("keywords", []))
    all_trend_kws = list(set(all_trend_kws))

    for p in laptops:
        filled = sum(1 for v in p["all_attributes"].values() if v)
        total = len(p["all_attributes"])
        completeness = filled / max(total, 1)

        # Tech score: atributos técnicos clave para laptops
        tech_fields = {
            "processor_brand": 1.0,
            "processor_model": 1.0,
            "ram_memory": 1.0,
            "storage_capacity": 1.0,
            "screen_size": 0.8,
            "os": 0.7,
            "gpu_model": 0.6,
            "screen_resolution": 0.5,
            "storage_type": 0.5,
            "ram_type": 0.4,
            "battery_life": 0.3,
            "weight": 0.3,
        }
        tech_score_num = sum(w for f, w in tech_fields.items() if p.get(f))
        tech_score_den = sum(tech_fields.values())
        tech_score = tech_score_num / tech_score_den

        quality = (
            completeness * 0.20 +
            tech_score * 0.35 +
            (min(p["num_pictures"], 8) / 8) * 0.20 +
            (1.0 if p["brand"] else 0) * 0.10 +
            (1.0 if p["model"] else 0) * 0.10 +
            (1.0 if p.get("short_description") else 0) * 0.05
        )

        cpu = f"{p['processor_brand']} {p['processor_model']}".strip()
        gpu = f"{p['gpu_brand']} {p['gpu_model']}".strip()

        dataset.append({
            "id": p["id"],
            "source_type": "CATALOG_PRODUCT",
            "input": {
                "product_name": p["name"],
                "brand": p["brand"],
                "model": p["model"],
                "line": p["line"],
                "processor": cpu,
                "processor_line": p["processor_line"],
                "ram": p["ram_memory"],
                "ram_type": p["ram_type"],
                "storage": p["storage_capacity"],
                "storage_type": p["storage_type"],
                "screen_size": p["screen_size"],
                "screen_resolution": p["screen_resolution"],
                "gpu": gpu,
                "os": f"{p['os']} {p['os_version']}".strip(),
                "battery": p["battery_life"],
                "weight": p["weight"],
                "color": p["color"],
                "num_photos": p["num_pictures"],
                "photo_urls": p["picture_urls"][:3],
                "all_attributes": p["all_attributes"],
                "trending_keywords": all_trend_kws[:15],
            },
            "output": {
                "title": p["name"],
                "short_description": p.get("short_description", ""),
                "quality_score": round(quality, 3),
                "tech_score": round(tech_score, 3),
                "attributes_filled": filled,
                "attributes_total": total,
            }
        })

    dataset.sort(key=lambda x: x["output"]["quality_score"], reverse=True)

    # Stats
    print(f"\n📊 Dataset: {len(dataset)} laptops")
    if dataset:
        scores = [d["output"]["quality_score"] for d in dataset]
        tech = [d["output"]["tech_score"] for d in dataset]
        print(f"   Quality: {min(scores):.3f} - {max(scores):.3f} (avg {sum(scores)/len(scores):.3f})")
        print(f"   Tech:    {min(tech):.3f} - {max(tech):.3f} (avg {sum(tech)/len(tech):.3f})")

    brands = {}
    for d in dataset:
        b = d["input"].get("brand", "?") or "?"
        brands[b] = brands.get(b, 0) + 1
    print(f"\n🏷️ Marcas ({len(brands)}):")
    for b, c in sorted(brands.items(), key=lambda x: -x[1]):
        print(f"   {b}: {c}")

    cpus = {}
    for d in dataset:
        cpu = d["input"].get("processor", "?") or "?"
        cpus[cpu] = cpus.get(cpu, 0) + 1
    print(f"\n🧠 Procesadores ({len(cpus)}):")
    for cpu, c in sorted(cpus.items(), key=lambda x: -x[1]):
        print(f"   {cpu}: {c}")

    save_json(dataset, "06_dataset_final.json")

    quick = [{
        "name": d["input"]["product_name"],
        "brand": d["input"]["brand"],
        "model": d["input"]["model"],
        "processor": d["input"]["processor"],
        "ram": d["input"]["ram"],
        "storage": d["input"]["storage"],
        "screen": d["input"]["screen_size"],
        "gpu": d["input"]["gpu"],
        "os": d["input"]["os"],
        "photos": d["input"]["num_photos"],
        "quality": d["output"]["quality_score"],
        "tech": d["output"]["tech_score"],
    } for d in dataset]
    save_json(quick, "06_dataset_quick.json")

    return dataset


# ============================================================
# MAIN
# ============================================================
def main():
    print("🚀 MELI Laptops Dataset Collector V2 (ENFOCADO)")
    print("=" * 60)
    start = time.time()

    categories = get_notebook_categories()
    product_ids, highlights = get_notebook_highlights(categories)
    laptops = get_laptop_products(product_ids)
    trends = get_trends()
    attributes = get_attributes()
    dataset = build_dataset(laptops, trends, attributes)

    print(f"\n{'='*60}")
    print(f"✅ COMPLETADO en {time.time()-start:.0f}s")
    print(f"📁 {OUTPUT_DIR.absolute()}")


if __name__ == "__main__":
    main()