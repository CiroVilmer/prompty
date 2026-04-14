"""
MELI Sneakers Dataset Collector
================================
Hackathon Anthropic/Kaszek - Listing Optimizer con DSPy

Recolecta datos de zapatillas best-sellers desde la API de MercadoLibre
usando los endpoints confirmados que funcionan:
  - /highlights/MLA/category/{cat_id}  → best sellers rankeados
  - /products/{product_id}             → detalle completo
  - /trends/MLA/{cat_id}              → keywords populares
  - /categories/{cat_id}/attributes    → atributos requeridos

Genera un dataset JSON listo para usar con DSPy MIPROv2.
"""

import requests
import json
import time
import os
from datetime import datetime
from pathlib import Path


# ============================================================
# CONFIGURACIÓN - Completar con tu token
# ============================================================
ACCESS_TOKEN = "APP_USR-3709463098260571-041221-c6d61a8f3006d6f135b8242c4b857742-369195231"
BASE_URL = "https://api.mercadolibre.com"

# Categorías de zapatillas en MLA
# Primero exploramos para encontrar las subcategorías correctas
SNEAKERS_ROOT_CATEGORIES = [
    "MLA109027",  # Zapatillas (general, visto en docs)
    "MLA1430",    # Ropa y Accesorios (root)
]

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

OUTPUT_DIR = Path("dataset_zapatillas")
OUTPUT_DIR.mkdir(exist_ok=True)


# ============================================================
# HELPERS
# ============================================================
def api_get(endpoint, params=None):
    """GET request con rate limiting y error handling."""
    url = f"{BASE_URL}{endpoint}"
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 429:
            print(f"  ⏳ Rate limited, esperando 3s...")
            time.sleep(3)
            return api_get(endpoint, params)
        else:
            print(f"  ❌ {resp.status_code} en {endpoint}: {resp.text[:200]}")
            return None
    except Exception as e:
        print(f"  ❌ Error en {endpoint}: {e}")
        return None


def save_json(data, filename):
    """Guarda data a JSON con formato legible."""
    path = OUTPUT_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  💾 Guardado: {path} ({len(json.dumps(data))} bytes)")
    return path


# ============================================================
# PASO 1: Descubrir categorías de zapatillas
# ============================================================
def discover_sneaker_categories():
    """
    Navega el árbol de categorías para encontrar todas las
    subcategorías de zapatillas/calzado deportivo.
    """
    print("\n" + "="*60)
    print("PASO 1: Descubriendo categorías de zapatillas")
    print("="*60)
    
    sneaker_cats = []
    
    # Primero: obtener todas las categorías root
    print("\n📂 Obteniendo categorías root de MLA...")
    roots = api_get("/sites/MLA/categories")
    if not roots:
        print("❌ No se pudieron obtener categorías root")
        return sneaker_cats
    
    # Buscar "Ropa y Accesorios" y subcategorías de calzado
    for root in roots:
        print(f"  📁 {root['id']}: {root['name']}")
    
    # Explorar Ropa y Accesorios → Calzado
    print("\n🔍 Explorando subcategorías de calzado...")
    calzado_root = api_get("/categories/MLA1430")  # Ropa y Accesorios
    if calzado_root and "children_categories" in calzado_root:
        for child in calzado_root["children_categories"]:
            if any(kw in child["name"].lower() for kw in ["calzado", "zapato", "zapatilla"]):
                print(f"  👟 Encontrado: {child['id']} - {child['name']}")
                # Explorar subcategorías
                sub = api_get(f"/categories/{child['id']}")
                if sub and "children_categories" in sub:
                    for sub_child in sub["children_categories"]:
                        print(f"    └── {sub_child['id']}: {sub_child['name']}")
                        if any(kw in sub_child["name"].lower() for kw in 
                               ["zapatilla", "deportiv", "running", "training", 
                                "urbana", "sneaker", "tenis"]):
                            sneaker_cats.append({
                                "id": sub_child["id"],
                                "name": sub_child["name"],
                                "total_items": sub_child.get("total_items_in_this_category", 0)
                            })
                            # Una capa más abajo
                            subsub = api_get(f"/categories/{sub_child['id']}")
                            if subsub and "children_categories" in subsub:
                                for ss in subsub["children_categories"]:
                                    print(f"      └── {ss['id']}: {ss['name']}")
                                    sneaker_cats.append({
                                        "id": ss["id"],
                                        "name": ss["name"],
                                        "total_items": ss.get("total_items_in_this_category", 0)
                                    })
                time.sleep(0.3)
    
    # También probar la categoría directa MLA109027
    direct = api_get("/categories/MLA109027")
    if direct:
        print(f"\n  👟 Categoría directa: {direct.get('id')} - {direct.get('name')}")
        sneaker_cats.append({
            "id": direct["id"],
            "name": direct.get("name", "Zapatillas"),
            "total_items": direct.get("total_items_in_this_category", 0)
        })
        if "children_categories" in direct:
            for child in direct["children_categories"]:
                print(f"    └── {child['id']}: {child['name']}")
                sneaker_cats.append({
                    "id": child["id"],
                    "name": child["name"],
                    "total_items": child.get("total_items_in_this_category", 0)
                })
    
    # Dedup
    seen = set()
    unique_cats = []
    for cat in sneaker_cats:
        if cat["id"] not in seen:
            seen.add(cat["id"])
            unique_cats.append(cat)
    
    print(f"\n✅ Encontradas {len(unique_cats)} categorías de zapatillas")
    save_json(unique_cats, "01_categorias_zapatillas.json")
    return unique_cats


# ============================================================
# PASO 2: Obtener highlights (best sellers) por categoría
# ============================================================
def get_highlights(categories):
    """
    Usa /highlights/MLA/category/{cat_id} para obtener los
    productos best-sellers de cada categoría.
    """
    print("\n" + "="*60)
    print("PASO 2: Obteniendo highlights (best sellers)")
    print("="*60)
    
    all_product_ids = []
    highlights_data = []
    
    for cat in categories:
        cat_id = cat["id"]
        print(f"\n🏆 Highlights de {cat_id} ({cat['name']})...")
        
        data = api_get(f"/highlights/MLA/category/{cat_id}")
        if data and "content" in data:
            products_in_cat = []
            for item in data["content"]:
                # Los highlights pueden tener tipo "PRODUCT" o "ITEM"
                entry = {
                    "type": item.get("type"),
                    "id": item.get("id"),
                    "position": item.get("position"),
                    "category_id": cat_id,
                    "category_name": cat["name"]
                }
                products_in_cat.append(entry)
                if item.get("type") == "PRODUCT":
                    all_product_ids.append(item["id"])
                    
            highlights_data.extend(products_in_cat)
            print(f"  ✅ {len(products_in_cat)} productos encontrados")
        else:
            print(f"  ⚠️ Sin highlights para {cat_id}")
        
        time.sleep(0.5)
    
    # Dedup product IDs
    unique_product_ids = list(set(all_product_ids))
    
    print(f"\n📊 Total highlights: {len(highlights_data)}")
    print(f"📊 Product IDs únicos: {len(unique_product_ids)}")
    
    save_json(highlights_data, "02_highlights_raw.json")
    save_json(unique_product_ids, "02_product_ids.json")
    
    return unique_product_ids, highlights_data


# ============================================================
# PASO 3: Obtener detalle de cada producto
# ============================================================
def get_product_details(product_ids):
    """
    Usa /products/{product_id} para obtener el detalle completo
    de cada producto: nombre, atributos, fotos, descripción.
    Estos son los datos curados del catálogo de MELI.
    """
    print("\n" + "="*60)
    print("PASO 3: Obteniendo detalle de productos")
    print("="*60)
    
    products = []
    errors = []
    
    for i, pid in enumerate(product_ids):
        print(f"\n📦 [{i+1}/{len(product_ids)}] Producto: {pid}")
        
        data = api_get(f"/products/{pid}")
        if data:
            product = {
                "product_id": pid,
                "name": data.get("name"),
                "status": data.get("status"),
                "domain_id": data.get("domain_id"),
                "buy_box_winner": data.get("buy_box_winner"),
                
                # Atributos del producto (marca, modelo, color, etc.)
                "attributes": [
                    {
                        "id": attr.get("id"),
                        "name": attr.get("name"),
                        "value_id": attr.get("value_id"),
                        "value_name": attr.get("value_name"),
                        "values": attr.get("values", [])
                    }
                    for attr in data.get("attributes", [])
                ],
                
                # Fotos del producto (URLs)
                "pictures": [
                    {
                        "id": pic.get("id"),
                        "url": pic.get("url"),
                        "suggested_for_picker": pic.get("suggested_for_picker", [])
                    }
                    for pic in data.get("pictures", [])
                ],
                
                # Descripción corta / short description
                "short_description": data.get("short_description"),
                
                # Parent platform (si es variante)
                "parent_id": data.get("parent_id"),
                
                # Settings y metadata
                "settings": data.get("settings"),
            }
            
            # Extraer atributos clave como campos directos para fácil acceso
            attrs_map = {a["id"]: a.get("value_name", "") for a in data.get("attributes", [])}
            product["_brand"] = attrs_map.get("BRAND", "")
            product["_model"] = attrs_map.get("MODEL", "")
            product["_color"] = attrs_map.get("COLOR", "")
            product["_gender"] = attrs_map.get("GENDER", "")
            product["_line"] = attrs_map.get("LINE", "")
            product["_shoe_type"] = attrs_map.get("SHOE_TYPE", "")
            product["_sole_type"] = attrs_map.get("SOLE_TYPE", "")
            product["_num_pictures"] = len(data.get("pictures", []))
            
            products.append(product)
            print(f"  ✅ {product['name']}")
            print(f"     Marca: {product['_brand']} | Modelo: {product['_model']}")
            print(f"     Fotos: {product['_num_pictures']} | Color: {product['_color']}")
        else:
            errors.append(pid)
            print(f"  ❌ Error obteniendo {pid}")
        
        time.sleep(0.5)
    
    print(f"\n📊 Productos obtenidos: {len(products)}/{len(product_ids)}")
    if errors:
        print(f"⚠️ Errores: {len(errors)} productos fallidos")
    
    save_json(products, "03_products_detail.json")
    save_json(errors, "03_errors.json")
    
    return products


# ============================================================
# PASO 4: Obtener trends (keywords populares) por categoría
# ============================================================
def get_trends(categories):
    """
    Usa /trends/MLA/{cat_id} para obtener las keywords
    más buscadas en cada categoría de zapatillas.
    Útil para el módulo Investigador del pipeline.
    """
    print("\n" + "="*60)
    print("PASO 4: Obteniendo trends (keywords populares)")
    print("="*60)
    
    all_trends = {}
    
    for cat in categories:
        cat_id = cat["id"]
        print(f"\n🔥 Trends de {cat_id} ({cat['name']})...")
        
        data = api_get(f"/trends/MLA/{cat_id}")
        if data:
            trends = []
            for trend in data:
                trends.append({
                    "keyword": trend.get("keyword"),
                    "url": trend.get("url")
                })
            all_trends[cat_id] = {
                "category_name": cat["name"],
                "trends": trends
            }
            print(f"  ✅ {len(trends)} keywords encontradas")
            for t in trends[:5]:
                print(f"     🔑 {t['keyword']}")
        else:
            print(f"  ⚠️ Sin trends para {cat_id}")
        
        time.sleep(0.5)
    
    save_json(all_trends, "04_trends.json")
    return all_trends


# ============================================================
# PASO 5: Obtener atributos requeridos por categoría
# ============================================================
def get_category_attributes(categories):
    """
    Usa /categories/{cat_id}/attributes para obtener los
    atributos requeridos y opcionales de cada categoría.
    Esto define qué campos debe tener un listing completo.
    """
    print("\n" + "="*60)
    print("PASO 5: Obteniendo atributos de categorías")
    print("="*60)
    
    all_attributes = {}
    
    for cat in categories:
        cat_id = cat["id"]
        print(f"\n📋 Atributos de {cat_id} ({cat['name']})...")
        
        data = api_get(f"/categories/{cat_id}/attributes")
        if data:
            attributes = []
            required_count = 0
            for attr in data:
                is_required = attr.get("tags", {}).get("required", False)
                if is_required:
                    required_count += 1
                
                attr_info = {
                    "id": attr.get("id"),
                    "name": attr.get("name"),
                    "value_type": attr.get("value_type"),
                    "required": is_required,
                    "allow_custom": attr.get("tags", {}).get("allow_custom_value", False),
                    "hidden": attr.get("tags", {}).get("hidden", False),
                    "values": [
                        {"id": v.get("id"), "name": v.get("name")}
                        for v in attr.get("values", [])[:20]  # Limitar a 20 valores
                    ]
                }
                attributes.append(attr_info)
            
            all_attributes[cat_id] = {
                "category_name": cat["name"],
                "total_attributes": len(attributes),
                "required_count": required_count,
                "attributes": attributes
            }
            print(f"  ✅ {len(attributes)} atributos ({required_count} requeridos)")
        else:
            print(f"  ⚠️ Sin atributos para {cat_id}")
        
        time.sleep(0.3)
    
    save_json(all_attributes, "05_category_attributes.json")
    return all_attributes


# ============================================================
# PASO 6: Armar dataset final para DSPy
# ============================================================
def build_dspy_dataset(products, trends, attributes, highlights):
    """
    Construye el dataset final optimizado para entrenar
    el Listing Optimizer con DSPy MIPROv2.
    
    Estructura de cada ejemplo:
    {
        "input": {
            "product_name": "Nike Air Max 90",
            "brand": "Nike",
            "model": "Air Max 90",
            "category": "Zapatillas Urbanas",
            "attributes": {...},
            "trending_keywords": [...],
            "required_attributes": [...],
            "num_photos": 8,
            "photo_urls": [...]
        },
        "output": {
            "optimized_title": "Zapatillas Nike Air Max 90 Urbanas Hombre - Blanco/Negro",
            "key_attributes_filled": [...],
            "description_highlights": [...],
            "quality_score": 0.95
        }
    }
    """
    print("\n" + "="*60)
    print("PASO 6: Construyendo dataset para DSPy")
    print("="*60)
    
    dataset = []
    
    # Mapear trends por categoría para enriquecer
    trends_by_cat = {}
    for cat_id, trend_data in trends.items():
        trends_by_cat[cat_id] = [t["keyword"] for t in trend_data.get("trends", [])]
    
    # Mapear atributos requeridos por categoría
    required_attrs_by_cat = {}
    for cat_id, attr_data in attributes.items():
        required_attrs_by_cat[cat_id] = [
            a for a in attr_data.get("attributes", []) 
            if a.get("required") and not a.get("hidden")
        ]
    
    # Mapear highlights para saber el ranking
    highlight_ranks = {}
    for h in highlights:
        if h.get("type") == "PRODUCT":
            highlight_ranks[h["id"]] = {
                "position": h.get("position", 99),
                "category_id": h.get("category_id")
            }
    
    for product in products:
        pid = product["product_id"]
        
        # Encontrar la categoría del highlight
        rank_info = highlight_ranks.get(pid, {})
        cat_id = rank_info.get("category_id", "")
        
        # Calcular quality score basado en completitud
        filled_attrs = sum(1 for a in product.get("attributes", []) if a.get("value_name"))
        total_attrs = len(product.get("attributes", []))
        completeness = filled_attrs / max(total_attrs, 1)
        
        has_photos = product["_num_pictures"] > 0
        has_brand = bool(product["_brand"])
        has_model = bool(product["_model"])
        has_description = bool(product.get("short_description"))
        
        quality_score = (
            completeness * 0.4 +
            (1.0 if has_photos else 0) * 0.2 +
            (min(product["_num_pictures"], 6) / 6) * 0.15 +
            (1.0 if has_brand else 0) * 0.1 +
            (1.0 if has_model else 0) * 0.1 +
            (1.0 if has_description else 0) * 0.05
        )
        
        example = {
            "id": pid,
            "input": {
                "product_name": product.get("name", ""),
                "brand": product["_brand"],
                "model": product["_model"],
                "line": product["_line"],
                "color": product["_color"],
                "gender": product["_gender"],
                "shoe_type": product["_shoe_type"],
                "sole_type": product["_sole_type"],
                "category_id": cat_id,
                "all_attributes": {
                    a["id"]: a.get("value_name", "")
                    for a in product.get("attributes", [])
                    if a.get("value_name")
                },
                "num_photos": product["_num_pictures"],
                "photo_urls": [p["url"] for p in product.get("pictures", []) if p.get("url")],
                "trending_keywords": trends_by_cat.get(cat_id, []),
                "required_attributes": [
                    a["id"] for a in required_attrs_by_cat.get(cat_id, [])
                ],
            },
            "output": {
                "catalog_title": product.get("name", ""),
                "short_description": product.get("short_description", ""),
                "filled_attributes_count": filled_attrs,
                "total_attributes_count": total_attrs,
                "quality_score": round(quality_score, 3),
                "highlight_position": rank_info.get("position", None),
            },
            "metadata": {
                "domain_id": product.get("domain_id"),
                "status": product.get("status"),
                "collected_at": datetime.now().isoformat(),
            }
        }
        
        dataset.append(example)
    
    # Ordenar por quality score descendente
    dataset.sort(key=lambda x: x["output"]["quality_score"], reverse=True)
    
    print(f"\n📊 Dataset construido: {len(dataset)} ejemplos")
    
    if dataset:
        scores = [d["output"]["quality_score"] for d in dataset]
        print(f"   Score promedio: {sum(scores)/len(scores):.3f}")
        print(f"   Score máximo:   {max(scores):.3f}")
        print(f"   Score mínimo:   {min(scores):.3f}")
        
        # Top 5 productos
        print(f"\n🏆 Top 5 productos por quality score:")
        for d in dataset[:5]:
            print(f"   {d['output']['quality_score']:.3f} | {d['input']['brand']} {d['input']['model']} | {d['input']['num_photos']} fotos")
    
    save_json(dataset, "06_dspy_dataset.json")
    
    # También guardar versión reducida para quick-start
    quick_dataset = []
    for d in dataset:
        quick_dataset.append({
            "product_name": d["input"]["product_name"],
            "brand": d["input"]["brand"],
            "model": d["input"]["model"],
            "color": d["input"]["color"],
            "gender": d["input"]["gender"],
            "num_photos": d["input"]["num_photos"],
            "catalog_title": d["output"]["catalog_title"],
            "quality_score": d["output"]["quality_score"],
            "trending_keywords": d["input"]["trending_keywords"][:5],
        })
    save_json(quick_dataset, "06_dspy_dataset_quick.json")
    
    return dataset


# ============================================================
# PASO 7: Generar reporte resumen
# ============================================================
def generate_report(categories, products, trends, attributes, dataset):
    """Genera un reporte Markdown con el resumen de la recolección."""
    print("\n" + "="*60)
    print("PASO 7: Generando reporte")
    print("="*60)
    
    report = f"""# 📊 MELI Sneakers Dataset - Reporte de Recolección
**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Hackathon:** Anthropic / Kaszek / Digital House

## Resumen
- **Categorías exploradas:** {len(categories)}
- **Productos recolectados:** {len(products)}
- **Categorías con trends:** {len(trends)}
- **Categorías con atributos:** {len(attributes)}
- **Ejemplos en dataset DSPy:** {len(dataset)}

## Categorías
| ID | Nombre | Items |
|----|--------|-------|
"""
    for cat in categories:
        report += f"| {cat['id']} | {cat['name']} | {cat.get('total_items', 'N/A')} |\n"
    
    report += f"""
## Top Productos por Quality Score
| Score | Marca | Modelo | Color | Fotos |
|-------|-------|--------|-------|-------|
"""
    for d in dataset[:10]:
        report += (f"| {d['output']['quality_score']:.3f} | "
                   f"{d['input']['brand']} | "
                   f"{d['input']['model']} | "
                   f"{d['input']['color']} | "
                   f"{d['input']['num_photos']} |\n")
    
    if trends:
        report += "\n## Keywords Trending\n"
        for cat_id, trend_data in trends.items():
            report += f"\n### {trend_data['category_name']} ({cat_id})\n"
            for t in trend_data.get("trends", [])[:10]:
                report += f"- {t['keyword']}\n"
    
    report += f"""
## Estructura del Dataset
Cada ejemplo contiene:
- **input**: nombre, marca, modelo, color, género, tipo, atributos, fotos, keywords trending
- **output**: título del catálogo, descripción, quality score, posición en highlights
- **metadata**: domain_id, status, timestamp

## Archivos Generados
```
dataset_zapatillas/
├── 01_categorias_zapatillas.json  # Categorías descubiertas
├── 02_highlights_raw.json         # Best sellers por categoría  
├── 02_product_ids.json            # IDs de productos a recolectar
├── 03_products_detail.json        # Detalle completo de productos
├── 04_trends.json                 # Keywords populares
├── 05_category_attributes.json    # Atributos requeridos
├── 06_dspy_dataset.json           # Dataset final para DSPy
├── 06_dspy_dataset_quick.json     # Versión reducida quick-start
└── 07_reporte.md                  # Este reporte
```

## Próximos Pasos
1. Revisar `06_dspy_dataset.json` y validar calidad
2. Crear ejemplos de "listings malos" (simulados o de sellers amateurs)
3. Definir métricas para DSPy: completitud, SEO, claridad
4. Entrenar pipeline con MIPROv2: Auditor → Investigador → Gen texto → Gen imagen
"""
    
    path = OUTPUT_DIR / "07_reporte.md"
    with open(path, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"  📝 Reporte guardado: {path}")


# ============================================================
# MAIN
# ============================================================
def main():
    print("🚀 MELI Sneakers Dataset Collector")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"🔑 Token: {'Configurado ✅' if ACCESS_TOKEN != 'TU_ACCESS_TOKEN_AQUI' else '❌ FALTA TOKEN'}")
    
    if ACCESS_TOKEN == "TU_ACCESS_TOKEN_AQUI":
        print("\n⚠️  IMPORTANTE: Configurá tu token antes de correr!")
        print("   Opción 1: export MELI_ACCESS_TOKEN='tu_token_aqui'")
        print("   Opción 2: Editá ACCESS_TOKEN en este archivo")
        print("\n   Tu APP_ID es: 3709463098260571")
        print("   Obtené el token en: https://developers.mercadolibre.com.ar/")
        return
    
    start_time = time.time()
    
    # Paso 1: Descubrir categorías
    categories = discover_sneaker_categories()
    if not categories:
        print("❌ No se encontraron categorías. Verificá el token.")
        return
    
    # Paso 2: Obtener highlights
    product_ids, highlights = get_highlights(categories)
    if not product_ids:
        print("⚠️ No se encontraron product IDs en highlights.")
        print("   Probando con IDs de categorías directas...")
    
    # Paso 3: Obtener detalles de productos
    products = get_product_details(product_ids[:50])  # Limitar a 50 para no pasarse
    
    # Paso 4: Trends
    trends = get_trends(categories[:10])  # Top 10 categorías
    
    # Paso 5: Atributos
    attributes = get_category_attributes(categories[:10])
    
    # Paso 6: Construir dataset
    dataset = build_dspy_dataset(products, trends, attributes, highlights)
    
    # Paso 7: Reporte
    generate_report(categories, products, trends, attributes, dataset)
    
    elapsed = time.time() - start_time
    print("\n" + "="*60)
    print(f"✅ RECOLECCIÓN COMPLETA en {elapsed:.1f}s")
    print(f"📁 Archivos en: {OUTPUT_DIR.absolute()}")
    print("="*60)


if __name__ == "__main__":
    main()