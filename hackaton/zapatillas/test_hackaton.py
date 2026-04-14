"""
MELI Dataset Builder para DSPy Listing Optimizer
================================================
Script para recolectar listings de MercadoLibre Argentina (MLA)
usando endpoints PÚBLICOS (sin autenticación) y armar el dataset
de entrenamiento para optimizar prompts con DSPy.

Endpoints públicos utilizados:
- /sites/MLA/search?q=...           → Buscar items por keyword
- /sites/MLA/search?category=...    → Buscar items por categoría
- /items/{id}                       → Detalle completo de un item
- /items/{id}/description           → Descripción HTML del item
- /sites/MLA/categories             → Listar categorías raíz
- /categories/{id}                  → Detalle de una categoría
- /categories/{id}/attributes       → Atributos requeridos por categoría
- /sites/MLA/trends/search?category=... → Trends por categoría

Uso:
    pip install requests tqdm anthropic
    python meli_dataset_builder.py
"""

import json
import time
import os
import re
from pathlib import Path
from datetime import datetime

try:
    import requests
except ImportError:
    print("Instalar: pip install requests")
    exit(1)

try:
    from tqdm import tqdm
except ImportError:
    # Fallback si no tiene tqdm
    def tqdm(iterable, **kwargs):
        return iterable

# ============================================================
# CONFIGURACIÓN
# ============================================================

BASE_URL = "https://api.mercadolibre.com"
SITE_ID = "MLA"  # Argentina

# Categorías objetivo: elegimos las más relevantes para e-commerce
# y que tienen mayor volumen de listings variados
TARGET_CATEGORIES = {
    "MLA1055": "Celulares y Smartphones",
    "MLA1648": "Computación",
    "MLA1144": "Consolas y Videojuegos",
    "MLA1000": "Electrónica, Audio y Video",
    "MLA1276": "Deportes y Fitness",
    "MLA1246": "Belleza y Cuidado Personal",
    "MLA1574": "Hogar, Muebles y Jardín",
    "MLA1051": "Celulares y Teléfonos",
    "MLA5726": "Electrodomésticos",
    "MLA1182": "Instrumentos Musicales",
}

# Keywords de búsqueda para obtener diversidad de listings
SEARCH_QUERIES = [
    "auriculares bluetooth",
    "zapatillas running",
    "cafetera express",
    "silla gamer",
    "teclado mecanico",
    "parlante bluetooth",
    "smartwatch",
    "aspiradora robot",
    "mochila notebook",
    "reloj inteligente",
    "cámara seguridad wifi",
    "monitor gamer 144hz",
    "mouse inalámbrico",
    "cargador inalámbrico",
    "tablet samsung",
]

# Cuántos items recolectar por query/categoría
ITEMS_PER_QUERY = 20
ITEMS_PER_CATEGORY = 15

# Rate limiting: MELI permite ~30 req/min sin auth
REQUEST_DELAY = 2.5  # segundos entre requests

OUTPUT_DIR = Path("dataset")
OUTPUT_DIR.mkdir(exist_ok=True)


# ============================================================
# FUNCIONES DE API
# ============================================================

def meli_get(endpoint: str, params: dict = None) -> dict | None:
    """GET request a la API de MELI con manejo de errores y rate limiting."""
    url = f"{BASE_URL}{endpoint}"
    try:
        time.sleep(REQUEST_DELAY)
        resp = requests.get(url, params=params, timeout=15)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 429:
            print(f"  ⚠️  Rate limited. Esperando 60s...")
            time.sleep(60)
            return meli_get(endpoint, params)  # retry
        else:
            print(f"  ❌ Error {resp.status_code} en {endpoint}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Request failed: {e}")
        return None


def search_items(query: str = None, category: str = None, 
                 sort: str = "relevance", limit: int = 50, 
                 offset: int = 0) -> list[dict]:
    """
    Busca items en MLA. Endpoint público, no requiere auth.
    
    Sorts disponibles: relevance, price_asc, price_desc
    """
    params = {"limit": min(limit, 50), "offset": offset, "sort": sort}
    if query:
        params["q"] = query
    if category:
        params["category"] = category
    
    data = meli_get(f"/sites/{SITE_ID}/search", params)
    if data and "results" in data:
        return data["results"]
    return []


def get_item_detail(item_id: str) -> dict | None:
    """Obtiene el detalle completo de un item. Endpoint público."""
    return meli_get(f"/items/{item_id}")


def get_item_description(item_id: str) -> str:
    """Obtiene la descripción (texto largo) de un item. Endpoint público."""
    data = meli_get(f"/items/{item_id}/description")
    if data and "plain_text" in data:
        return data["plain_text"]
    elif data and "text" in data:
        # Limpiar HTML básico si viene en formato text
        text = data["text"]
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    return ""


def get_category_attributes(category_id: str) -> list[dict]:
    """Obtiene los atributos requeridos/opcionales de una categoría."""
    data = meli_get(f"/categories/{category_id}/attributes")
    if data:
        return data
    return []


def get_category_detail(category_id: str) -> dict | None:
    """Obtiene detalle de una categoría incluyendo path completo."""
    return meli_get(f"/categories/{category_id}")


def get_trends(category_id: str) -> list[dict]:
    """Obtiene trends/búsquedas populares de una categoría."""
    data = meli_get(f"/sites/{SITE_ID}/trends/search", 
                    {"category": category_id, "limit": 10})
    if data:
        return data
    return []


# ============================================================
# PROCESAMIENTO DE DATOS
# ============================================================

def extract_listing_data(item_detail: dict, description: str,
                         category_attrs: list[dict]) -> dict:
    """
    Extrae y estructura los datos relevantes de un listing para el dataset.
    
    Retorna un dict limpio con toda la info necesaria para entrenar DSPy.
    """
    # Contar atributos completados vs requeridos
    required_attrs = [a for a in category_attrs 
                      if a.get("tags", {}).get("required", False)
                      or "required" in a.get("tags", [])]
    
    item_attr_ids = {a["id"] for a in item_detail.get("attributes", [])}
    required_attr_ids = {a["id"] for a in required_attrs}
    filled_required = len(item_attr_ids & required_attr_ids)
    total_required = len(required_attr_ids) if required_attr_ids else 1
    
    # Extraer URLs de fotos
    pictures = item_detail.get("pictures", []) or []
    picture_urls = [p.get("secure_url") or p.get("url", "") for p in pictures]
    
    # Info del seller
    seller = item_detail.get("seller", {}) or {}
    seller_reputation = seller.get("seller_reputation", {}) or {}
    
    # Tags del item (envío gratis, full, etc.)
    tags = item_detail.get("tags", []) or []
    
    return {
        # === Identificación ===
        "item_id": item_detail.get("id", ""),
        "category_id": item_detail.get("category_id", ""),
        "permalink": item_detail.get("permalink", ""),
        
        # === Contenido del listing (lo que vamos a optimizar) ===
        "title": item_detail.get("title", ""),
        "description": description[:3000],  # Truncar para no exceder context
        "price": item_detail.get("price", 0),
        "currency_id": item_detail.get("currency_id", ""),
        "condition": item_detail.get("condition", ""),
        
        # === Atributos ===
        "attributes": [
            {
                "id": a.get("id", ""),
                "name": a.get("name", ""),
                "value_name": a.get("value_name", ""),
            }
            for a in item_detail.get("attributes", [])
            if a.get("value_name")  # Solo los que tienen valor
        ],
        "attribute_completeness": round(filled_required / total_required, 2),
        
        # === Imágenes ===
        "picture_count": len(pictures),
        "picture_urls": picture_urls[:6],  # Max 6 para no sobrecargar
        "has_video": "has_video" in tags,
        
        # === Señales de calidad / performance ===
        "sold_quantity": item_detail.get("sold_quantity", 0),
        "available_quantity": item_detail.get("available_quantity", 0),
        "listing_type_id": item_detail.get("listing_type_id", ""),
        "free_shipping": any("free_shipping" in str(t) for t in tags),
        "fulfillment": any("fulfillment" in str(t) for t in tags),
        
        # === Seller info ===
        "seller_power_status": seller_reputation.get(
            "power_seller_status", None),
        "seller_level": seller_reputation.get("level_id", ""),
        
        # === Metadata ===
        "date_created": item_detail.get("date_created", ""),
        "last_updated": item_detail.get("last_updated", ""),
        "tags": tags,
    }


def compute_quality_heuristic(listing: dict) -> dict:
    """
    Calcula un score heurístico de calidad del listing.
    
    Este score es SOLO para pre-filtrar y tener una noción inicial.
    El score definitivo lo dará el LM-as-Judge (Claude).
    
    Dimensiones:
    - title_quality: largo, presencia de keywords, no ALL CAPS
    - description_quality: largo, no vacía
    - image_quality: cantidad de fotos
    - attribute_completeness: % de atributos requeridos
    - seller_signals: envío gratis, fulfillment, etc.
    """
    scores = {}
    
    # Title quality (0-10)
    title = listing.get("title", "")
    title_len = len(title)
    title_score = 5
    if title_len >= 40:
        title_score += 1
    if title_len >= 55:
        title_score += 1
    if title.isupper():
        title_score -= 3  # ALL CAPS es mala práctica
    if title_len < 20:
        title_score -= 2
    if any(c in title for c in ["!", "?", "$"]):
        title_score -= 1  # Caracteres spam
    scores["title_quality"] = max(0, min(10, title_score))
    
    # Description quality (0-10)
    desc = listing.get("description", "")
    desc_len = len(desc)
    desc_score = 3
    if desc_len >= 100:
        desc_score += 2
    if desc_len >= 300:
        desc_score += 2
    if desc_len >= 500:
        desc_score += 1
    if desc_len == 0:
        desc_score = 0
    scores["description_quality"] = max(0, min(10, desc_score))
    
    # Image quality (0-10)
    pic_count = listing.get("picture_count", 0)
    img_score = min(10, pic_count * 2)  # 5+ fotos = 10
    if listing.get("has_video"):
        img_score = min(10, img_score + 2)
    scores["image_quality"] = img_score
    
    # Attribute completeness (0-10)
    scores["attribute_completeness"] = round(
        listing.get("attribute_completeness", 0) * 10, 1)
    
    # Seller/listing signals (0-10)
    signal_score = 5
    if listing.get("free_shipping"):
        signal_score += 2
    if listing.get("fulfillment"):
        signal_score += 2
    if listing.get("listing_type_id") in ["gold_pro", "gold_special"]:
        signal_score += 1
    scores["seller_signals"] = min(10, signal_score)
    
    # Score total ponderado
    weights = {
        "title_quality": 0.25,
        "description_quality": 0.25,
        "image_quality": 0.20,
        "attribute_completeness": 0.20,
        "seller_signals": 0.10,
    }
    total = sum(scores[k] * weights[k] for k in weights)
    scores["total_score"] = round(total, 2)
    
    return scores


# ============================================================
# RECOLECCIÓN PRINCIPAL
# ============================================================

def collect_from_searches(queries: list[str], 
                          items_per_query: int) -> list[str]:
    """Recolecta item IDs buscando por keywords."""
    all_ids = set()
    
    print("\n🔍 Fase 1: Buscando por keywords...")
    for query in tqdm(queries, desc="Queries"):
        results = search_items(query=query, limit=items_per_query)
        ids = [r["id"] for r in results]
        all_ids.update(ids)
        print(f"  '{query}' → {len(ids)} items")
    
    return list(all_ids)


def collect_from_categories(categories: dict[str, str],
                            items_per_cat: int) -> list[str]:
    """Recolecta item IDs de las top categorías."""
    all_ids = set()
    
    print("\n📂 Fase 2: Buscando por categorías...")
    for cat_id, cat_name in tqdm(categories.items(), desc="Categorías"):
        results = search_items(category=cat_id, limit=items_per_cat)
        ids = [r["id"] for r in results]
        all_ids.update(ids)
        print(f"  {cat_name} ({cat_id}) → {len(ids)} items")
    
    return list(all_ids)


def enrich_items(item_ids: list[str]) -> list[dict]:
    """
    Para cada item ID, obtiene el detalle completo + descripción.
    Retorna lista de listings enriquecidos.
    """
    listings = []
    
    # Cache de atributos por categoría para no repetir calls
    category_attrs_cache = {}
    
    print(f"\n📦 Fase 3: Enriqueciendo {len(item_ids)} items...")
    for item_id in tqdm(item_ids, desc="Enriqueciendo"):
        # 1. Detalle del item
        detail = get_item_detail(item_id)
        if not detail:
            continue
        
        # 2. Descripción
        description = get_item_description(item_id)
        
        # 3. Atributos de la categoría (con cache)
        cat_id = detail.get("category_id", "")
        if cat_id not in category_attrs_cache:
            category_attrs_cache[cat_id] = get_category_attributes(cat_id)
        cat_attrs = category_attrs_cache[cat_id]
        
        # 4. Extraer y estructurar
        listing = extract_listing_data(detail, description, cat_attrs)
        
        # 5. Calcular scores heurísticos
        listing["heuristic_scores"] = compute_quality_heuristic(listing)
        
        listings.append(listing)
    
    return listings


def split_dataset(listings: list[dict]) -> dict:
    """
    Divide el dataset en:
    - "good_listings": score >= 7 (los que DSPy usará como ejemplos positivos)
    - "bad_listings": score < 5 (los que usaremos como input a optimizar)
    - "medium_listings": 5 <= score < 7 (para evaluación)
    
    Esta clasificación heurística será refinada después con Claude.
    """
    good = [l for l in listings 
            if l["heuristic_scores"]["total_score"] >= 7]
    bad = [l for l in listings 
           if l["heuristic_scores"]["total_score"] < 5]
    medium = [l for l in listings 
              if 5 <= l["heuristic_scores"]["total_score"] < 7]
    
    return {"good": good, "medium": medium, "bad": bad}


# ============================================================
# GENERACIÓN DE TRAINING EXAMPLES PARA DSPy
# ============================================================

def generate_dspy_training_examples(good_listings: list[dict],
                                    bad_listings: list[dict]) -> list[dict]:
    """
    Genera los ejemplos de entrenamiento para DSPy.
    
    Cada ejemplo tiene:
    - input: el listing "malo" o "medio" (lo que el seller subiría)
    - reference: un listing "bueno" de la misma categoría (el target)
    - category_context: info de la categoría y atributos esperados
    
    Estos ejemplos serán usados por MIPROv2 para optimizar los prompts.
    """
    examples = []
    
    # Agrupar buenos por categoría
    good_by_cat = {}
    for listing in good_listings:
        cat = listing["category_id"]
        good_by_cat.setdefault(cat, []).append(listing)
    
    for bad_listing in bad_listings:
        cat = bad_listing["category_id"]
        
        # Buscar un buen listing de la misma categoría como referencia
        if cat in good_by_cat and good_by_cat[cat]:
            reference = good_by_cat[cat][0]  # Tomar el mejor de la categoría
        else:
            # Si no hay de la misma categoría, usar cualquier bueno
            reference = good_listings[0] if good_listings else None
        
        example = {
            "input_listing": {
                "title": bad_listing["title"],
                "description": bad_listing["description"][:1000],
                "price": bad_listing["price"],
                "condition": bad_listing["condition"],
                "picture_count": bad_listing["picture_count"],
                "picture_urls": bad_listing["picture_urls"][:3],
                "attributes": bad_listing["attributes"][:10],
                "category_id": bad_listing["category_id"],
            },
            "reference_listing": {
                "title": reference["title"],
                "description": reference["description"][:1000],
                "attributes": reference["attributes"][:10],
                "picture_count": reference["picture_count"],
                "heuristic_score": reference["heuristic_scores"]["total_score"],
            } if reference else None,
            "category_context": {
                "category_id": cat,
            },
            "input_score": bad_listing["heuristic_scores"]["total_score"],
        }
        
        examples.append(example)
    
    return examples


# ============================================================
# SCRIPT PARA LABELING CON CLAUDE (LM-as-Judge)
# ============================================================

JUDGE_PROMPT_TEMPLATE = """Eres un experto en e-commerce y marketplaces de Latinoamérica.
Evalúa este listing de MercadoLibre Argentina en una escala de 1 a 10.

## Listing a evaluar:
- **Título:** {title}
- **Descripción:** {description}
- **Precio:** {price} {currency}
- **Cantidad de fotos:** {picture_count}
- **Atributos completados:** {attribute_count}
- **Condición:** {condition}
- **Envío gratis:** {free_shipping}

## Criterios de evaluación (cada uno del 1 al 10):

1. **Título** (peso 25%): ¿Es descriptivo, incluye marca/modelo, tiene keywords 
   relevantes, largo adecuado (40-60 chars), NO tiene spam ni ALL CAPS?
   
2. **Descripción** (peso 25%): ¿Es completa, persuasiva, tiene estructura clara,
   incluye especificaciones técnicas, beneficios, y condiciones?
   
3. **Completitud de atributos** (peso 20%): ¿Los atributos técnicos están 
   completos? ¿Incluye marca, modelo, dimensiones, materiales?
   
4. **Presentación visual** (peso 20%): ¿Tiene suficientes fotos (ideal 5+)?
   (No puedes ver las fotos, evalúa por cantidad y si tiene video)
   
5. **Señales de confianza** (peso 10%): ¿Tiene envío gratis, garantía, 
   buena estructura general que inspire confianza?

Responde SOLO con un JSON:
{{
    "title_score": <1-10>,
    "description_score": <1-10>,
    "attribute_score": <1-10>,
    "visual_score": <1-10>,
    "trust_score": <1-10>,
    "total_score": <1-10>,
    "main_issues": ["issue1", "issue2", "issue3"],
    "improvement_suggestions": ["suggestion1", "suggestion2"]
}}"""


def generate_judge_script():
    """
    Genera el script separado que usa Claude para labelear los listings.
    Este script se corre después de recolectar los datos.
    """
    script = '''"""
Label listings con Claude como LM-as-Judge.
Requiere: pip install anthropic
Configurar: export ANTHROPIC_API_KEY=tu_key
"""
import json
import time
from pathlib import Path
from anthropic import Anthropic

client = Anthropic()
MODEL = "claude-sonnet-4-20250514"

def judge_listing(listing: dict) -> dict:
    """Envía un listing a Claude para que lo evalúe."""
    prompt = f"""Eres un experto en e-commerce y marketplaces de Latinoamérica.
Evalúa este listing de MercadoLibre Argentina en una escala de 1 a 10.

Título: {listing['title']}
Descripción: {listing['description'][:1500]}
Precio: {listing['price']} {listing.get('currency_id', 'ARS')}
Fotos: {listing['picture_count']}
Atributos: {len(listing['attributes'])} completados
Condición: {listing['condition']}
Envío gratis: {listing.get('free_shipping', False)}

Criterios: título (25%), descripción (25%), atributos (20%), 
fotos (20%), confianza (10%).

Responde SOLO con JSON:
{{"title_score": <1-10>, "description_score": <1-10>, 
  "attribute_score": <1-10>, "visual_score": <1-10>, 
  "trust_score": <1-10>, "total_score": <1-10>,
  "main_issues": ["..."], "improvement_suggestions": ["..."]}}"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    text = response.content[0].text
    # Limpiar posible markdown
    text = text.strip().removeprefix("```json").removesuffix("```").strip()
    return json.loads(text)


def label_dataset(input_path: str = "dataset/raw_listings.json",
                  output_path: str = "dataset/labeled_listings.json"):
    """Labelea todos los listings del dataset."""
    
    with open(input_path) as f:
        listings = json.load(f)
    
    labeled = []
    for i, listing in enumerate(listings):
        print(f"Labeling {i+1}/{len(listings)}: {listing['title'][:50]}...")
        try:
            scores = judge_listing(listing)
            listing["claude_scores"] = scores
            labeled.append(listing)
            time.sleep(1)  # Rate limiting
        except Exception as e:
            print(f"  Error: {e}")
            listing["claude_scores"] = None
            labeled.append(listing)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(labeled, f, ensure_ascii=False, indent=2)
    
    print(f"\\n✅ {len(labeled)} listings labeleados → {output_path}")
    
    # Stats
    scored = [l for l in labeled if l.get("claude_scores")]
    if scored:
        avg = sum(l["claude_scores"]["total_score"] for l in scored) / len(scored)
        good = len([l for l in scored if l["claude_scores"]["total_score"] >= 7])
        bad = len([l for l in scored if l["claude_scores"]["total_score"] < 5])
        print(f"   Promedio: {avg:.1f}/10")
        print(f"   Buenos (>=7): {good}")
        print(f"   Malos (<5): {bad}")


if __name__ == "__main__":
    label_dataset()
'''
    
    with open(OUTPUT_DIR / "label_with_claude.py", "w") as f:
        f.write(script)
    print(f"📝 Script de labeling generado → {OUTPUT_DIR}/label_with_claude.py")


# ============================================================
# GENERACIÓN DE DSPY TRAINING SET
# ============================================================

def generate_dspy_trainset_script():
    """
    Genera el script que convierte el dataset labeleado en 
    ejemplos de entrenamiento para DSPy.
    """
    script = '''"""
Convierte el dataset labeleado en training examples para DSPy.
"""
import json
import dspy

def load_training_examples(
    labeled_path: str = "dataset/labeled_listings.json"
) -> tuple[list, list]:
    """
    Carga listings labeleados y genera train/val sets para DSPy.
    
    Retorna (trainset, valset) como listas de dspy.Example.
    """
    with open(labeled_path) as f:
        listings = json.load(f)
    
    # Filtrar los que tienen scores de Claude
    scored = [l for l in listings if l.get("claude_scores")]
    
    # Separar buenos y malos
    good = [l for l in scored if l["claude_scores"]["total_score"] >= 7]
    bad = [l for l in scored if l["claude_scores"]["total_score"] < 5]
    medium = [l for l in scored if 5 <= l["claude_scores"]["total_score"] < 7]
    
    print(f"Dataset: {len(good)} buenos, {len(medium)} medios, {len(bad)} malos")
    
    # Crear examples: input = listing malo → output = listing mejorado
    # Para DSPy, necesitamos pares (input, expected_output)
    examples = []
    
    # Agrupar buenos por categoría para referencias
    good_by_cat = {}
    for l in good:
        cat = l["category_id"]
        good_by_cat.setdefault(cat, []).append(l)
    
    for listing in bad + medium:
        cat = listing["category_id"]
        ref = good_by_cat.get(cat, good[:1])
        if not ref:
            continue
        
        # El example para DSPy
        ex = dspy.Example(
            # Inputs
            raw_title=listing["title"],
            raw_description=listing["description"][:1000],
            category_id=listing["category_id"],
            price=str(listing["price"]),
            condition=listing["condition"],
            attributes=json.dumps(listing["attributes"][:8]),
            picture_count=str(listing["picture_count"]),
            # Reference (lo que el sistema debería aspirar a generar)
            reference_title=ref[0]["title"],
            reference_description=ref[0]["description"][:1000],
            reference_score=str(ref[0]["claude_scores"]["total_score"]),
            # Score del input (para la métrica)
            input_score=str(listing["claude_scores"]["total_score"]),
            issues=json.dumps(listing["claude_scores"].get("main_issues", [])),
        ).with_inputs(
            "raw_title", "raw_description", "category_id", 
            "price", "condition", "attributes", "picture_count"
        )
        
        examples.append(ex)
    
    # Split 80/20
    split = int(len(examples) * 0.8)
    trainset = examples[:split]
    valset = examples[split:]
    
    print(f"Train: {len(trainset)}, Val: {len(valset)}")
    return trainset, valset


if __name__ == "__main__":
    train, val = load_training_examples()
    print(f"\\nListo para DSPy!")
    print(f"  trainset: {len(train)} examples")
    print(f"  valset: {len(val)} examples")
'''
    
    with open(OUTPUT_DIR / "create_dspy_trainset.py", "w") as f:
        f.write(script)
    print(f"📝 Script DSPy trainset generado → {OUTPUT_DIR}/create_dspy_trainset.py")


# ============================================================
# MAIN
# ============================================================

def main():
    print("=" * 60)
    print("🛒 MELI Dataset Builder para DSPy Listing Optimizer")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"🌎 Site: {SITE_ID} (Argentina)")
    print(f"📂 Output: {OUTPUT_DIR}/")
    print()
    
    # Paso 1: Recolectar IDs por búsquedas
    search_ids = collect_from_searches(SEARCH_QUERIES, ITEMS_PER_QUERY)
    
    # Paso 2: Recolectar IDs por categorías
    category_ids = collect_from_categories(TARGET_CATEGORIES, ITEMS_PER_CATEGORY)
    
    # Combinar y deduplicar
    all_ids = list(set(search_ids + category_ids))
    print(f"\n📊 Total IDs únicos: {len(all_ids)}")
    
    # Paso 3: Enriquecer cada item con detalle + descripción
    listings = enrich_items(all_ids)
    print(f"\n✅ {len(listings)} listings enriquecidos")
    
    # Paso 4: Guardar raw data
    raw_path = OUTPUT_DIR / "raw_listings.json"
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(listings, f, ensure_ascii=False, indent=2)
    print(f"💾 Raw data → {raw_path}")
    
    # Paso 5: Calcular scores heurísticos y dividir
    split = split_dataset(listings)
    print(f"\n📈 Distribución heurística:")
    print(f"   Buenos (>=7): {len(split['good'])}")
    print(f"   Medios (5-7): {len(split['medium'])}")
    print(f"   Malos (<5):   {len(split['bad'])}")
    
    # Paso 6: Generar training examples preliminares
    examples = generate_dspy_training_examples(
        split["good"], split["bad"] + split["medium"])
    
    examples_path = OUTPUT_DIR / "training_examples_preliminary.json"
    with open(examples_path, "w", encoding="utf-8") as f:
        json.dump(examples, f, ensure_ascii=False, indent=2)
    print(f"💾 Training examples → {examples_path}")
    
    # Paso 7: Generar scripts auxiliares
    generate_judge_script()
    generate_dspy_trainset_script()
    
    # Paso 8: Guardar metadata del dataset
    metadata = {
        "created_at": datetime.now().isoformat(),
        "site_id": SITE_ID,
        "total_listings": len(listings),
        "search_queries_used": SEARCH_QUERIES,
        "categories_used": TARGET_CATEGORIES,
        "distribution": {
            "good": len(split["good"]),
            "medium": len(split["medium"]),
            "bad": len(split["bad"]),
        },
        "training_examples": len(examples),
    }
    
    meta_path = OUTPUT_DIR / "dataset_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'=' * 60}")
    print("✅ Dataset recolectado exitosamente!")
    print(f"{'=' * 60}")
    print(f"""
Próximos pasos:
  1. Revisar los datos en {OUTPUT_DIR}/raw_listings.json
  2. Correr el labeling con Claude:
     export ANTHROPIC_API_KEY=tu_key
     python {OUTPUT_DIR}/label_with_claude.py
  3. Generar el trainset para DSPy:
     python {OUTPUT_DIR}/create_dspy_trainset.py
  4. Correr la compilación de DSPy (ver dspy_pipeline.py)
""")


if __name__ == "__main__":
    main()