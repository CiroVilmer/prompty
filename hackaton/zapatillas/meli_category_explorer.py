"""
MELI Category Explorer - Zapatillas/Calzado
============================================
Explora TODO el árbol de categorías de calzado para encontrar
subcategorías con más variedad de marcas.
"""

import requests
import json
import time
import os

ACCESS_TOKEN = os.environ.get("MELI_ACCESS_TOKEN", 
    "APP_USR-3709463098260571-041221-c6d61a8f3006d6f135b8242c4b857742-369195231")
BASE_URL = "https://api.mercadolibre.com"
HEADERS = {"Authorization": f"Bearer {ACCESS_TOKEN}"}


def api_get(endpoint):
    try:
        resp = requests.get(f"{BASE_URL}{endpoint}", headers=HEADERS, timeout=15)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 429:
            time.sleep(3)
            return api_get(endpoint)
        else:
            return None
    except:
        return None


def explore_category(cat_id, depth=0, max_depth=4):
    """Explora recursivamente una categoría y sus hijos."""
    data = api_get(f"/categories/{cat_id}")
    if not data:
        return []
    
    indent = "  " * depth
    name = data.get("name", "?")
    total = data.get("total_items_in_this_category", 0)
    children = data.get("children_categories", [])
    
    print(f"{indent}{'📁' if children else '📄'} {cat_id}: {name} ({total:,} items)")
    
    results = [{
        "id": cat_id,
        "name": name,
        "total_items": total,
        "depth": depth,
        "has_children": len(children) > 0
    }]
    
    if depth < max_depth and children:
        for child in children:
            time.sleep(0.2)
            results.extend(explore_category(child["id"], depth + 1, max_depth))
    
    return results


def check_highlights(cat_id, cat_name):
    """Verifica cuántos highlights tiene una categoría."""
    data = api_get(f"/highlights/MLA/category/{cat_id}")
    if data and "content" in data:
        products = [i for i in data["content"] if i.get("type") == "PRODUCT"]
        items = [i for i in data["content"] if i.get("type") != "PRODUCT"]
        return len(products), len(items)
    return 0, 0


print("🔍 MELI Category Explorer - Calzado")
print("=" * 60)

# Paso 1: Encontrar categorías de calzado desde Ropa y Accesorios
print("\n📂 Explorando 'Ropa y Accesorios' (MLA1430)...")
ropa = api_get("/categories/MLA1430")

calzado_cats = []
if ropa and "children_categories" in ropa:
    for child in ropa["children_categories"]:
        print(f"\n  📁 {child['id']}: {child['name']}")
        if any(kw in child["name"].lower() for kw in ["calzado", "zapato"]):
            calzado_cats.append(child["id"])

# Paso 2: Explorar cada categoría de calzado a fondo
print("\n" + "=" * 60)
print("📂 Explorando árbol completo de calzado...")
print("=" * 60)

all_categories = []
for cat_id in calzado_cats:
    print(f"\n{'='*40}")
    cats = explore_category(cat_id, depth=0, max_depth=3)
    all_categories.extend(cats)

# Paso 3: También explorar MLA109027 directamente
print(f"\n{'='*40}")
print("📂 Explorando MLA109027 (Zapatillas) directamente...")
cats_direct = explore_category("MLA109027", depth=0, max_depth=2)
# Agregar solo los que no estén ya
existing_ids = {c["id"] for c in all_categories}
for c in cats_direct:
    if c["id"] not in existing_ids:
        all_categories.append(c)

# Paso 4: Verificar highlights de las categorías hoja (sin hijos)
print("\n" + "=" * 60)
print("🏆 Verificando highlights por categoría...")
print("=" * 60)

leaf_cats = [c for c in all_categories if not c["has_children"] and c["total_items"] > 1000]
leaf_cats.sort(key=lambda x: x["total_items"], reverse=True)

highlights_report = []
for cat in leaf_cats:
    prods, items = check_highlights(cat["id"], cat["name"])
    total = prods + items
    if total > 0:
        print(f"  ✅ {cat['id']}: {cat['name']} → {prods} products, {items} items")
        highlights_report.append({
            "id": cat["id"],
            "name": cat["name"],
            "total_items": cat["total_items"],
            "highlight_products": prods,
            "highlight_items": items
        })
    time.sleep(0.3)

# Guardar resultado
print("\n" + "=" * 60)
print("📊 RESUMEN")
print("=" * 60)
print(f"Total categorías encontradas: {len(all_categories)}")
print(f"Categorías hoja con >1000 items: {len(leaf_cats)}")
print(f"Categorías con highlights: {len(highlights_report)}")

print("\n🏆 Top categorías con highlights:")
highlights_report.sort(key=lambda x: x["highlight_products"], reverse=True)
for h in highlights_report[:15]:
    print(f"  {h['id']}: {h['name']} ({h['total_items']:,} items) → {h['highlight_products']} products")

with open("category_explorer_results.json", "w", encoding="utf-8") as f:
    json.dump({
        "all_categories": all_categories,
        "highlights_report": highlights_report
    }, f, ensure_ascii=False, indent=2)

print(f"\n💾 Guardado en category_explorer_results.json")
print("\n📋 Copiá las categorías con highlights y pasámelas para armar el collector v2")