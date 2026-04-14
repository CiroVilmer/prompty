"""
Buscador de más Notebooks
===========================
Intenta varias estrategias para encontrar más product IDs de notebooks:
1. Domain discovery (predictor de categorías)
2. Highlights de categorías hermanas (Tablets, PC Gaming, PC Escritorio)
3. Endpoint /products/search si existe
4. Buscar en trends keywords y ver si hay product IDs en los URLs
"""

import requests
import json
import time
import os
from pathlib import Path

ACCESS_TOKEN = os.environ.get("MELI_ACCESS_TOKEN",
    "APP_USR-3709463098260571-041315-ca70b26489280680c8162394e035e549-369195231")
BASE_URL = "https://api.mercadolibre.com"
HEADERS = {"Authorization": f"Bearer {ACCESS_TOKEN}", "Content-Type": "application/json"}
OUTPUT_DIR = Path("dataset_laptops_v2")

# Cargar product IDs que ya tenemos
existing_ids = set()
existing_file = OUTPUT_DIR / "02_product_ids_raw.json"
if existing_file.exists():
    with open(existing_file) as f:
        existing_ids = set(json.load(f))
print(f"📂 Ya tenemos {len(existing_ids)} product IDs")


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
        print(f"  ❌ {e}")
        return None


new_product_ids = set()

# ============================================================
# ESTRATEGIA 1: Domain Discovery
# ============================================================
print("\n" + "="*60)
print("ESTRATEGIA 1: Domain Discovery (predictor de categorías)")
print("="*60)

queries = [
    "notebook lenovo ideapad",
    "laptop hp pavilion",
    "macbook air apple",
    "notebook asus vivobook",
    "laptop dell inspiron",
    "notebook acer aspire",
    "laptop gamer msi",
    "chromebook samsung",
    "notebook samsung galaxy book",
    "thinkpad lenovo",
    "laptop huawei matebook",
]

for q in queries:
    print(f"\n🔍 '{q}'...")
    data = api_get(f"/sites/MLA/domain_discovery/search", {"q": q})
    if data:
        for pred in data[:3]:
            print(f"  → domain: {pred.get('domain_id')} | cat: {pred.get('category_id')} | {pred.get('category_name')}")
    else:
        # Intentar sin auth
        print("  Intentando endpoint alternativo...")
        data = api_get(f"/sites/MLA/domain_discovery/search?q={q.replace(' ', '%20')}")
        if data:
            for pred in data[:2]:
                print(f"  → {pred.get('domain_id')} | {pred.get('category_name')}")
    time.sleep(0.3)

# ============================================================
# ESTRATEGIA 2: Highlights de categorías relacionadas
# ============================================================
print("\n" + "="*60)
print("ESTRATEGIA 2: Highlights de categorías relacionadas")
print("="*60)

related_cats = [
    ("MLA400950", "Tablets y Accesorios"),
    ("MLA447778", "Accesorios de PC Gaming"),
    ("MLA430637", "PC de Escritorio"),
    ("MLA1648", "Computación (root)"),
    ("MLA3724", "Zapatillas (Deportes)"),  # Solo para ver si el formato cambia
]

for cat_id, name in related_cats:
    print(f"\n🏆 {cat_id}: {name}...")
    data = api_get(f"/highlights/MLA/category/{cat_id}")
    if data and "content" in data:
        prods = [e for e in data["content"] if e.get("type") == "PRODUCT"]
        items = [e for e in data["content"] if e.get("type") == "ITEM"]
        print(f"  ✅ {len(prods)} products, {len(items)} items")
        for p in prods[:5]:
            pid = p["id"]
            is_new = pid not in existing_ids
            marker = "🆕" if is_new else "   "
            print(f"  {marker} {pid}")
            if is_new:
                new_product_ids.add(pid)
    time.sleep(0.4)

# ============================================================
# ESTRATEGIA 3: Explorar productos relacionados
# ============================================================
print("\n" + "="*60)
print("ESTRATEGIA 3: Productos del catálogo por búsqueda")
print("="*60)

# Intentar /products/search (puede no existir)
search_endpoints = [
    "/products/search?q=notebook&category_id=MLA1652&limit=50",
    "/products/search?q=laptop&category_id=MLA1652&limit=50",
    "/products/search?status=active&category_id=MLA1652&limit=50",
    "/catalog_products/search?q=notebook&site_id=MLA&limit=50",
    "/catalog/MLA/search?q=notebook",
]

for ep in search_endpoints:
    print(f"\n🔍 {ep}...")
    data = api_get(ep)
    if data:
        if isinstance(data, dict):
            results = data.get("results", data.get("products", []))
            if results:
                print(f"  ✅ {len(results)} resultados!")
                for r in results[:5]:
                    rid = r.get("id", r.get("product_id", "?"))
                    rname = r.get("name", r.get("title", "?"))
                    print(f"  🆕 {rid}: {rname[:50]}")
                    new_product_ids.add(rid)
            else:
                print(f"  Respuesta sin resultados: {list(data.keys())[:5]}")
        elif isinstance(data, list):
            print(f"  ✅ {len(data)} resultados (array)!")
            for r in data[:5]:
                rid = r.get("id", "?")
                print(f"  🆕 {rid}")
    time.sleep(0.5)

# ============================================================
# ESTRATEGIA 4: Trends URLs → product IDs
# ============================================================
print("\n" + "="*60)
print("ESTRATEGIA 4: Extraer product IDs desde trends URLs")
print("="*60)

trends_file = OUTPUT_DIR / "04_trends.json"
if trends_file.exists():
    with open(trends_file) as f:
        trends = json.load(f)
    
    # Solo trends de MLA1652 (Notebooks)
    notebook_trends = trends.get("MLA1652", {}).get("keywords", [])
    print(f"  📋 {len(notebook_trends)} keywords de Notebooks")
    
    # Los trends a veces tienen URLs que apuntan a búsquedas
    data = api_get(f"/trends/MLA/MLA1652")
    if data:
        for trend in data[:10]:
            keyword = trend.get("keyword", "")
            url = trend.get("url", "")
            print(f"  🔑 {keyword}: {url[:80]}...")

# ============================================================
# ESTRATEGIA 5: Obtener detalle de los nuevos product IDs
# ============================================================
print("\n" + "="*60)
print("ESTRATEGIA 5: Verificar nuevos product IDs encontrados")
print("="*60)

# Filtrar solo los realmente nuevos
truly_new = new_product_ids - existing_ids
print(f"\n🆕 Product IDs nuevos encontrados: {len(truly_new)}")

LAPTOP_KEYWORDS = [
    "notebook", "laptop", "macbook", "chromebook",
    "ideapad", "thinkpad", "inspiron", "pavilion",
    "vivobook", "zenbook", "swift", "aspire",
    "latitude", "elitebook", "probook", "legión",
    "legion", "nitro", "predator", "rog",
    "victus", "omen", "galaxy book", "surface",
]

new_laptops = []
for pid in list(truly_new)[:50]:
    data = api_get(f"/products/{pid}")
    if data:
        name = (data.get("name") or "").lower()
        domain = (data.get("domain_id") or "").upper()
        
        is_laptop = any(d in domain for d in ["LAPTOP", "NOTEBOOK"])
        if not is_laptop:
            is_laptop = any(kw in name for kw in LAPTOP_KEYWORDS)
        
        if is_laptop:
            attrs = {a["id"]: a.get("value_name", "") for a in data.get("attributes", [])}
            cpu = f"{attrs.get('PROCESSOR_BRAND', '')} {attrs.get('PROCESSOR_MODEL', '')}".strip()
            print(f"  ✅ LAPTOP: {data.get('name', '')[:50]} | {cpu}")
            new_laptops.append({
                "id": pid,
                "name": data.get("name", ""),
                "domain": domain,
                "brand": attrs.get("BRAND", ""),
                "processor": cpu,
            })
        else:
            print(f"  ⏭️ No laptop: {data.get('name', '')[:40]} ({domain})")
    time.sleep(0.4)

# Resumen
print(f"\n{'='*60}")
print(f"📊 RESUMEN")
print(f"  Product IDs existentes: {len(existing_ids)}")
print(f"  Nuevos encontrados: {len(truly_new)}")
print(f"  Nuevas laptops confirmadas: {len(new_laptops)}")

if new_laptops:
    # Guardar los nuevos
    new_ids_file = OUTPUT_DIR / "02b_new_product_ids.json"
    with open(new_ids_file, "w", encoding="utf-8") as f:
        json.dump([l["id"] for l in new_laptops], f, indent=2)
    print(f"  💾 {new_ids_file}")
    
    print(f"\n  Nuevas laptops:")
    for l in new_laptops:
        print(f"    {l['brand']} - {l['name'][:50]} ({l['processor']})")