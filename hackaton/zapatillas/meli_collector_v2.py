"""
MELI Sneakers Dataset Collector V2
====================================
Hackathon Anthropic/Kaszek - Listing Optimizer con DSPy

Mejoras sobre v1:
- Explora más categorías: Ropa Deportiva, Deportes y Fitness
- Usa highlights de tipo ITEM además de PRODUCT
- Busca items individuales con /items/{id} alternativo (público, sin auth)
- Extrae más datos por producto
- Genera dataset más diverso (más marcas)
"""

import requests
import json
import time
import os
from datetime import datetime
from pathlib import Path


# ============================================================
# CONFIGURACIÓN
# ============================================================
ACCESS_TOKEN = os.environ.get("MELI_ACCESS_TOKEN",
    "APP_USR-3709463098260571-041221-c6d61a8f3006d6f135b8242c4b857742-369195231")
BASE_URL = "https://api.mercadolibre.com"
HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

OUTPUT_DIR = Path("dataset_zapatillas_v2")
OUTPUT_DIR.mkdir(exist_ok=True)


# ============================================================
# HELPERS
# ============================================================
def api_get(endpoint, params=None, use_auth=True):
    """GET con rate limiting y retry."""
    url = f"{BASE_URL}{endpoint}"
    headers = HEADERS if use_auth else {"Content-Type": "application/json"}
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=15)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 429:
            print(f"  ⏳ Rate limited, esperando 5s...")
            time.sleep(5)
            return api_get(endpoint, params, use_auth)
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
    return path


# ============================================================
# PASO 1: Explorar TODAS las categorías relevantes
# ============================================================
def find_all_sneaker_categories():
    """
    Busca categorías de zapatillas/calzado deportivo en:
    1. Calzado → Zapatillas (MLA109027) [ya lo teníamos]
    2. Ropa Deportiva (MLA6839) → subcategorías de calzado
    3. Deportes y Fitness (MLA1276) → subcategorías de calzado
    """
    print("\n" + "="*60)
    print("PASO 1: Buscando TODAS las categorías relevantes")
    print("="*60)

    categories_to_scan = []

    # --- A) La que ya teníamos ---
    categories_to_scan.append({
        "id": "MLA109027", "name": "Zapatillas", "source": "Calzado"
    })

    # --- B) Ropa Deportiva ---
    print("\n🏃 Explorando Ropa Deportiva (MLA6839)...")
    ropa_dep = api_get("/categories/MLA6839")
    if ropa_dep and "children_categories" in ropa_dep:
        for child in ropa_dep["children_categories"]:
            print(f"  📁 {child['id']}: {child['name']}")
            # Buscar calzado deportivo
            if any(kw in child["name"].lower() for kw in
                   ["calzado", "zapatilla", "zapato", "botines", "ojotas"]):
                categories_to_scan.append({
                    "id": child["id"], "name": child["name"], "source": "Ropa Deportiva"
                })
                # Explorar un nivel más
                sub = api_get(f"/categories/{child['id']}")
                if sub and "children_categories" in sub:
                    for sc in sub["children_categories"]:
                        print(f"    └── {sc['id']}: {sc['name']}")
                        categories_to_scan.append({
                            "id": sc["id"], "name": sc["name"], "source": "Ropa Deportiva"
                        })
                time.sleep(0.3)

    # --- C) Deportes y Fitness ---
    print("\n⚽ Explorando Deportes y Fitness (MLA1276)...")
    deportes = api_get("/categories/MLA1276")
    if deportes and "children_categories" in deportes:
        # Buscar subdivisiones deportivas que tengan calzado
        sport_subcats = []
        for child in deportes["children_categories"]:
            print(f"  📁 {child['id']}: {child['name']}")
            # Deportes que tienen calzado específico
            if any(kw in child["name"].lower() for kw in
                   ["fútbol", "futbol", "running", "tenis", "básquet", "basquet",
                    "basketball", "fitness", "gym", "training", "ciclismo",
                    "hockey", "voley", "handball", "paddle", "padel"]):
                sport_subcats.append(child)

        # Para cada deporte, buscar subcategoría de calzado
        for sport in sport_subcats[:10]:  # Limitar a 10 deportes
            sub = api_get(f"/categories/{sport['id']}")
            if sub and "children_categories" in sub:
                for sc in sub["children_categories"]:
                    if any(kw in sc["name"].lower() for kw in
                           ["calzado", "zapatilla", "zapato", "botín", "botin"]):
                        print(f"    👟 {sc['id']}: {sc['name']} (en {sport['name']})")
                        categories_to_scan.append({
                            "id": sc["id"],
                            "name": f"{sc['name']} ({sport['name']})",
                            "source": f"Deportes/{sport['name']}"
                        })
                        # Un nivel más
                        subsub = api_get(f"/categories/{sc['id']}")
                        if subsub and "children_categories" in subsub:
                            for ssc in subsub["children_categories"]:
                                print(f"      └── {ssc['id']}: {ssc['name']}")
                                categories_to_scan.append({
                                    "id": ssc["id"],
                                    "name": f"{ssc['name']} ({sport['name']})",
                                    "source": f"Deportes/{sport['name']}"
                                })
                        time.sleep(0.2)
            time.sleep(0.3)

    # --- D) También las otras categorías de calzado que tenían items ---
    other_calzado = [
        {"id": "MLA416005", "name": "Sandalias y Ojotas", "source": "Calzado"},
        {"id": "MLA414251", "name": "Botas y Botinetas", "source": "Calzado"},
        {"id": "MLA414674", "name": "Mocasines y Oxfords", "source": "Calzado"},
        {"id": "MLA414673", "name": "Alpargatas", "source": "Calzado"},
    ]
    categories_to_scan.extend(other_calzado)

    # Dedup
    seen = set()
    unique = []
    for cat in categories_to_scan:
        if cat["id"] not in seen:
            seen.add(cat["id"])
            unique.append(cat)

    print(f"\n✅ {len(unique)} categorías encontradas para escanear")
    save_json(unique, "01_all_categories.json")
    return unique


# ============================================================
# PASO 2: Obtener highlights de TODAS las categorías
# ============================================================
def get_all_highlights(categories):
    """
    Obtiene highlights de cada categoría.
    Recolecta tanto PRODUCT como ITEM IDs.
    """
    print("\n" + "="*60)
    print("PASO 2: Obteniendo highlights de todas las categorías")
    print("="*60)

    product_ids = set()
    item_ids = set()
    all_highlights = []

    for cat in categories:
        print(f"\n🏆 {cat['id']}: {cat['name']}...")
        data = api_get(f"/highlights/MLA/category/{cat['id']}")

        if data and "content" in data:
            for entry in data["content"]:
                etype = entry.get("type", "UNKNOWN")
                eid = entry.get("id", "")
                highlight = {
                    "type": etype,
                    "id": eid,
                    "position": entry.get("position"),
                    "category_id": cat["id"],
                    "category_name": cat["name"],
                    "source": cat["source"]
                }
                all_highlights.append(highlight)

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

    print(f"\n📊 Product IDs únicos: {len(product_ids)}")
    print(f"📊 Item IDs únicos: {len(item_ids)}")

    save_json(all_highlights, "02_all_highlights.json")
    save_json(list(product_ids), "02_product_ids.json")
    save_json(list(item_ids), "02_item_ids.json")

    return list(product_ids), list(item_ids), all_highlights


# ============================================================
# PASO 3: Obtener detalle de PRODUCTs (catálogo MELI)
# ============================================================
def get_product_details(product_ids):
    """Detalle de cada producto del catálogo via /products/{id}."""
    print("\n" + "="*60)
    print(f"PASO 3: Detalle de {len(product_ids)} productos del catálogo")
    print("="*60)

    products = []
    for i, pid in enumerate(product_ids):
        print(f"  📦 [{i+1}/{len(product_ids)}] {pid}...", end=" ")
        data = api_get(f"/products/{pid}")
        if data:
            attrs_map = {a["id"]: a.get("value_name", "")
                         for a in data.get("attributes", [])}
            product = {
                "source_type": "PRODUCT",
                "id": pid,
                "name": data.get("name", ""),
                "domain_id": data.get("domain_id", ""),
                "brand": attrs_map.get("BRAND", ""),
                "model": attrs_map.get("MODEL", ""),
                "line": attrs_map.get("LINE", ""),
                "color": attrs_map.get("COLOR", ""),
                "gender": attrs_map.get("GENDER", ""),
                "shoe_type": attrs_map.get("SHOE_TYPE", ""),
                "sole_type": attrs_map.get("SOLE_TYPE", ""),
                "age_group": attrs_map.get("AGE_GROUP", ""),
                "material": attrs_map.get("MAIN_MATERIAL", ""),
                "closure_type": attrs_map.get("CLOSURE_TYPE", ""),
                "all_attributes": {a["id"]: a.get("value_name", "")
                                   for a in data.get("attributes", [])
                                   if a.get("value_name")},
                "num_pictures": len(data.get("pictures", [])),
                "picture_urls": [p.get("url", "") for p in data.get("pictures", [])],
                "short_description": data.get("short_description", ""),
            }
            products.append(product)
            print(f"✅ {product['brand']} {product['model']}")
        else:
            print("❌")
        time.sleep(0.4)

    save_json(products, "03_products.json")
    return products


# ============================================================
# PASO 4: Obtener detalle de ITEMs (listings individuales)
# ============================================================
def get_item_details(item_ids):
    """
    Detalle de cada item via /items/{id}.
    Estos son listings reales de sellers — tienen título,
    precio, fotos, atributos, y nos sirven como ejemplos
    de "listings del mundo real".
    """
    print("\n" + "="*60)
    print(f"PASO 4: Detalle de {len(item_ids)} items (listings reales)")
    print("="*60)

    items = []
    for i, iid in enumerate(item_ids):
        print(f"  🏷️ [{i+1}/{len(item_ids)}] {iid}...", end=" ")
        data = api_get(f"/items/{iid}")
        if data:
            attrs_map = {a["id"]: a.get("value_name", "")
                         for a in data.get("attributes", [])}
            item = {
                "source_type": "ITEM",
                "id": iid,
                "title": data.get("title", ""),
                "price": data.get("price"),
                "currency_id": data.get("currency_id", ""),
                "condition": data.get("condition", ""),
                "category_id": data.get("category_id", ""),
                "listing_type_id": data.get("listing_type_id", ""),
                "permalink": data.get("permalink", ""),
                "brand": attrs_map.get("BRAND", ""),
                "model": attrs_map.get("MODEL", ""),
                "line": attrs_map.get("LINE", ""),
                "color": attrs_map.get("COLOR", ""),
                "gender": attrs_map.get("GENDER", ""),
                "shoe_type": attrs_map.get("SHOE_TYPE", ""),
                "all_attributes": {a["id"]: a.get("value_name", "")
                                   for a in data.get("attributes", [])
                                   if a.get("value_name")},
                "num_pictures": len(data.get("pictures", [])),
                "picture_urls": [p.get("url", "") for p in data.get("pictures", [])],
                "seller_id": data.get("seller_id"),
                "official_store_id": data.get("official_store_id"),
            }
            items.append(item)
            print(f"✅ {item['title'][:60]}")
        else:
            print("❌ (puede estar bloqueado)")
        time.sleep(0.4)

    save_json(items, "04_items.json")
    return items


# ============================================================
# PASO 5: Trends de todas las categorías
# ============================================================
def get_all_trends(categories):
    """Trends de cada categoría relevante."""
    print("\n" + "="*60)
    print("PASO 5: Trends por categoría")
    print("="*60)

    all_trends = {}
    # Solo categorías únicas de primer nivel
    seen = set()
    for cat in categories:
        cid = cat["id"]
        if cid in seen:
            continue
        seen.add(cid)

        data = api_get(f"/trends/MLA/{cid}")
        if data and isinstance(data, list) and len(data) > 0:
            keywords = [t.get("keyword", "") for t in data]
            all_trends[cid] = {
                "name": cat["name"],
                "keywords": keywords
            }
            print(f"  🔥 {cid} ({cat['name']}): {len(keywords)} keywords")
        time.sleep(0.3)

    save_json(all_trends, "05_trends.json")
    return all_trends


# ============================================================
# PASO 6: Atributos requeridos
# ============================================================
def get_all_attributes(categories):
    """Atributos de cada categoría."""
    print("\n" + "="*60)
    print("PASO 6: Atributos por categoría")
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
                        if a.get("tags", {}).get("required") and
                        not a.get("tags", {}).get("hidden")]
            all_attrs[cid] = {
                "name": cat["name"],
                "total": len(data),
                "required_count": len(required),
                "required_attrs": [
                    {"id": a["id"], "name": a["name"],
                     "value_type": a.get("value_type", "")}
                    for a in required
                ],
                "all_attrs_summary": [
                    {"id": a["id"], "name": a["name"],
                     "required": a.get("tags", {}).get("required", False)}
                    for a in data if not a.get("tags", {}).get("hidden")
                ]
            }
            print(f"  📋 {cid} ({cat['name']}): {len(data)} attrs ({len(required)} required)")
        time.sleep(0.3)

    save_json(all_attrs, "06_attributes.json")
    return all_attrs


# ============================================================
# PASO 7: Construir dataset unificado para DSPy
# ============================================================
def build_dataset(products, items, highlights, trends, attributes):
    """
    Combina products (catálogo) + items (listings reales) en un
    dataset unificado con quality scores.
    """
    print("\n" + "="*60)
    print("PASO 7: Construyendo dataset unificado")
    print("="*60)

    dataset = []

    # Mapear highlights para ranking
    highlight_map = {}
    for h in highlights:
        highlight_map[h["id"]] = h

    # --- Procesar PRODUCTS (catálogo = gold standard) ---
    for p in products:
        pid = p["id"]
        h_info = highlight_map.get(pid, {})

        filled = sum(1 for v in p["all_attributes"].values() if v)
        total = len(p["all_attributes"])
        completeness = filled / max(total, 1)

        quality = (
            completeness * 0.35 +
            (min(p["num_pictures"], 8) / 8) * 0.25 +
            (1.0 if p["brand"] else 0) * 0.15 +
            (1.0 if p["model"] else 0) * 0.10 +
            (1.0 if p["color"] else 0) * 0.05 +
            (1.0 if p["gender"] else 0) * 0.05 +
            (1.0 if p.get("short_description") else 0) * 0.05
        )

        cat_id = h_info.get("category_id", "")
        trend_kws = trends.get(cat_id, {}).get("keywords", [])

        dataset.append({
            "id": pid,
            "source_type": "CATALOG_PRODUCT",
            "input": {
                "product_name": p["name"],
                "brand": p["brand"],
                "model": p["model"],
                "line": p["line"],
                "color": p["color"],
                "gender": p["gender"],
                "shoe_type": p["shoe_type"],
                "sole_type": p["sole_type"],
                "age_group": p["age_group"],
                "material": p["material"],
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
                "highlight_position": h_info.get("position"),
                "attributes_filled": filled,
                "attributes_total": total,
            }
        })

    # --- Procesar ITEMS (listings reales) ---
    for item in items:
        iid = item["id"]
        h_info = highlight_map.get(iid, {})

        filled = sum(1 for v in item["all_attributes"].values() if v)
        total = len(item["all_attributes"])
        completeness = filled / max(total, 1)

        quality = (
            completeness * 0.35 +
            (min(item["num_pictures"], 8) / 8) * 0.25 +
            (1.0 if item["brand"] else 0) * 0.15 +
            (1.0 if item["model"] else 0) * 0.10 +
            (1.0 if item["color"] else 0) * 0.05 +
            (1.0 if item["gender"] else 0) * 0.05 +
            (1.0 if item.get("listing_type_id") == "gold_pro" else 0) * 0.05
        )

        cat_id = item.get("category_id", h_info.get("category_id", ""))
        trend_kws = trends.get(cat_id, {}).get("keywords", [])

        dataset.append({
            "id": iid,
            "source_type": "SELLER_LISTING",
            "input": {
                "product_name": item["title"],
                "brand": item["brand"],
                "model": item["model"],
                "line": item["line"],
                "color": item["color"],
                "gender": item["gender"],
                "shoe_type": item["shoe_type"],
                "category_id": cat_id,
                "category_name": h_info.get("category_name", ""),
                "num_photos": item["num_pictures"],
                "photo_urls": item["picture_urls"][:3],
                "price": item.get("price"),
                "currency": item.get("currency_id", ""),
                "condition": item.get("condition", ""),
                "listing_type": item.get("listing_type_id", ""),
                "permalink": item.get("permalink", ""),
                "all_attributes": item["all_attributes"],
                "trending_keywords": trend_kws[:10],
                "is_official_store": item.get("official_store_id") is not None,
            },
            "output": {
                "title": item["title"],
                "quality_score": round(quality, 3),
                "highlight_position": h_info.get("position"),
                "attributes_filled": filled,
                "attributes_total": total,
            }
        })

    # Sort by quality
    dataset.sort(key=lambda x: x["output"]["quality_score"], reverse=True)

    # Stats
    catalog_items = [d for d in dataset if d["source_type"] == "CATALOG_PRODUCT"]
    seller_items = [d for d in dataset if d["source_type"] == "SELLER_LISTING"]

    print(f"\n📊 Dataset total: {len(dataset)} ejemplos")
    print(f"   - Catálogo MELI (gold standard): {len(catalog_items)}")
    print(f"   - Listings de sellers: {len(seller_items)}")

    if dataset:
        scores = [d["output"]["quality_score"] for d in dataset]
        print(f"   - Score promedio: {sum(scores)/len(scores):.3f}")
        print(f"   - Score max/min: {max(scores):.3f} / {min(scores):.3f}")

    # Brands breakdown
    brands = {}
    for d in dataset:
        b = d["input"].get("brand", "Sin marca") or "Sin marca"
        brands[b] = brands.get(b, 0) + 1
    print(f"\n🏷️ Marcas encontradas ({len(brands)}):")
    for brand, count in sorted(brands.items(), key=lambda x: -x[1])[:15]:
        print(f"   {brand}: {count}")

    save_json(dataset, "07_dataset_final.json")

    # Quick version
    quick = []
    for d in dataset:
        quick.append({
            "id": d["id"],
            "source_type": d["source_type"],
            "name": d["input"]["product_name"],
            "brand": d["input"]["brand"],
            "model": d["input"]["model"],
            "color": d["input"]["color"],
            "gender": d["input"]["gender"],
            "num_photos": d["input"]["num_photos"],
            "quality_score": d["output"]["quality_score"],
            "category": d["input"]["category_name"],
        })
    save_json(quick, "07_dataset_quick.json")

    return dataset


# ============================================================
# MAIN
# ============================================================
def main():
    print("🚀 MELI Sneakers Dataset Collector V2")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}")

    start = time.time()

    # 1. Encontrar categorías
    categories = find_all_sneaker_categories()

    # 2. Highlights
    product_ids, item_ids, highlights = get_all_highlights(categories)

    # 3. Detalle de products
    products = get_product_details(product_ids)

    # 4. Detalle de items (limitar a 80 para no pasarse)
    items = get_item_details(item_ids[:80])

    # 5. Trends
    trends = get_all_trends(categories)

    # 6. Atributos
    attributes = get_all_attributes(categories)

    # 7. Dataset
    dataset = build_dataset(products, items, highlights, trends, attributes)

    elapsed = time.time() - start
    print(f"\n{'='*60}")
    print(f"✅ COMPLETADO en {elapsed:.0f}s")
    print(f"📁 Archivos en: {OUTPUT_DIR.absolute()}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()