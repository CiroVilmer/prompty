"""
Generador de Listings Malos - Pool Independiente
==================================================
Hackathon Anthropic/Kaszek - Listing Optimizer con DSPy

Genera un pool de listings malos variados que servirán como
INPUTS del trainset de DSPy. No están vinculados 1 a 1 con
los productos del catálogo.

DSPy usa estos inputs + una métrica autónoma (sin gold labels)
para optimizar el prompt que transforma listings malos → buenos.

Uso:
  $env:ANTHROPIC_API_KEY='tu_api_key'
  python generate_bad_listings.py
"""

import json
import os
import time
import random
from datetime import datetime
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("Instalá el SDK: pip install anthropic")
    exit(1)


# ============================================================
# CONFIG
# ============================================================
API_KEY = "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"
MODEL = "claude-haiku-4-5-20251001"

# Archivos del dataset v2
PRODUCTS_FILE = "dataset_zapatillas_v2/03_products.json"
TRENDS_FILE = "dataset_zapatillas_v2/05_trends.json"
ATTRIBUTES_FILE = "dataset_zapatillas_v2/06_attributes.json"
OUTPUT_DIR = Path("dataset_zapatillas_v2")
OUTPUT_FILE = OUTPUT_DIR / "08_bad_listings_pool.json"

client = anthropic.Anthropic(api_key=API_KEY)

# ============================================================
# Perfiles de sellers amateurs
# Cada perfil genera un tipo de error diferente
# ============================================================
SELLER_PROFILES = [
    {
        "id": "novato_total",
        "description": "Primer vez vendiendo. No sabe nada de ecommerce. Pone lo mínimo indispensable.",
        "instructions": """Generá un listing como alguien que vende por primera vez online.
- Título: muy corto, genérico, sin marca ni modelo. Ej: "zapatilla deportiva hombre"
- Descripción: 1 línea máximo, tipo "zapatilla cómoda buen estado"
- Atributos: solo completó 1 o 2 (el obligatorio nomás)
- Fotos: 1 sola foto, sacada con celular"""
    },
    {
        "id": "spammer",
        "description": "Seller que mete keywords spam y MAYÚSCULAS para aparecer más.",
        "instructions": """Generá un listing de un seller que abusa de keywords y mayúsculas.
- Título: TODO EN MAYÚSCULAS, repite palabras clave, mete cosas irrelevantes.
  Ej: "ZAPATILLA DEPORTIVA HOMBRE OFERTA ENVÍO GRATIS NUEVA MEJOR PRECIO!!!"
- Descripción: llena de "OFERTA", "MEJOR PRECIO", "ENVÍO GRATIS", "CONSULTE STOCK", 
  pero sin info real del producto
- Atributos: puso algunos pero con valores genéricos ("talle único", "varios colores")
- Fotos: 2-3 fotos pero con banners de "OFERTA" encima"""
    },
    {
        "id": "copypaste",
        "description": "Copió el listing de otro seller y lo modificó mal.",
        "instructions": """Generá un listing de alguien que copió de otro y lo editó mal.
- Título: mezcla info de otro producto, tiene la marca pero modelo incorrecto o cortado.
  Ej: "Zapatillas Adidas Modelo Running Originales Imp" (cortado)
- Descripción: copiada de otro producto, menciona características que no aplican
- Atributos: algunos correctos, otros copiados de otro producto (color equivocado, género equivocado)
- Fotos: 3-4 fotos genéricas, alguna puede ser stock de internet"""
    },
    {
        "id": "perezoso",
        "description": "Sabe vender pero le da fiaca completar todo.",
        "instructions": """Generá un listing de un seller con experiencia pero que no se esfuerza.
- Título: tiene la marca y algo del modelo pero incompleto, sin color ni género.
  Ej: "Zapatillas Adidas Running" (sin modelo, sin color, sin género)
- Descripción: "Zapatillas originales. Consultar talles disponibles por mensaje."
- Atributos: completó los obligatorios pero dejó vacíos todos los opcionales
- Fotos: 4-5 fotos decentes pero le faltan ángulos importantes"""
    },
    {
        "id": "desinformado",
        "description": "Pone info incorrecta o contradictoria.",
        "instructions": """Generá un listing con información errónea o contradictoria.
- Título: tiene errores de ortografía, marca mal escrita, o categoría incorrecta.
  Ej: "Zapatilla Addidas Runing Hombre" (typos) o pone "urbana" cuando es running
- Descripción: mezcla características de otro modelo, menciona tecnología que no tiene
- Atributos: algunos con valores incorrectos (puso "Cuero" cuando es sintético, color equivocado)
- Fotos: fotos correctas del producto pero no coinciden con los atributos"""
    },
    {
        "id": "traducido_mal",
        "description": "Importador que tradujo la ficha del producto con Google Translate.",
        "instructions": """Generá un listing de un importador que tradujo mal del inglés/chino.
- Título: mezcla español e inglés raro. 
  Ej: "Sneaker Sport Shoes Zapatilla Deportiva Men Running"
- Descripción: español raro, frases traducidas literalmente. 
  "Zapato de deporte de alta calidad. Muy confortable para hacer running."
- Atributos: algunos en inglés, otros en español, valores genéricos
- Fotos: fotos de catálogo del proveedor, con fondo blanco pero genéricas"""
    },
]


# ============================================================
# SYSTEM PROMPT
# ============================================================
SYSTEM_PROMPT = """Sos un simulador de listings de MercadoLibre Argentina.
Tu trabajo es generar listings MALOS realistas de zapatillas/calzado deportivo,
como los haría un vendedor amateur según el perfil que te den.

IMPORTANTE:
- Generá listings que parezcan REALES, no caricaturas
- Usá marcas y modelos reales de zapatillas (Nike, Adidas, Puma, Reebok, 
  New Balance, Topper, Fila, Vans, etc.)
- Los errores deben ser sutiles y creíbles, como los que ves realmente en MELI
- Variá las marcas, modelos, colores y géneros entre cada listing

Respondé SOLO con un JSON válido (sin markdown, sin backticks) con esta estructura:
{
  "title": "título del listing",
  "description": "descripción del listing",
  "brand": "marca que puso el seller (puede estar mal escrita o vacía)",
  "model": "modelo que puso (puede estar incompleto o vacío)",
  "color": "color indicado (puede ser incorrecto o vacío)",
  "gender": "género indicado (puede ser incorrecto o vacío)",
  "shoe_type": "tipo de calzado indicado (puede estar mal o vacío)",
  "num_photos": 2,
  "attributes_filled": 3,
  "price_ars": 45000,
  "error_types": ["titulo_generico", "pocos_atributos"]
}

Error types posibles:
- titulo_generico: sin marca/modelo específico
- titulo_mayusculas: ABUSO DE MAYÚSCULAS
- titulo_spam: keywords irrelevantes o repetidas
- titulo_cortado: información truncada
- titulo_typos: errores de ortografía
- pocos_atributos: menos de la mitad completados
- atributos_incorrectos: valores equivocados
- sin_descripcion: sin descripción o menos de 10 palabras
- descripcion_spam: llena de "OFERTA" sin info real
- descripcion_copiada: copiada de otro producto
- descripcion_traducida: mal traducida
- pocas_fotos: menos de 4 fotos
- info_contradictoria: atributos no coinciden entre sí"""


# ============================================================
# GENERACIÓN
# ============================================================
def generate_batch(profile, n=5, trending_keywords=None, real_products=None):
    """Genera un batch de listings malos con un perfil específico."""
    
    # Seleccionar algunos productos reales como semilla de inspiración
    # (NO para parear, sino para que use marcas/modelos reales y variados)
    seed_products = random.sample(real_products, min(3, len(real_products))) if real_products else []
    seeds_text = ""
    if seed_products:
        seeds_text = "\n\nUSÁ ESTAS MARCAS/MODELOS COMO INSPIRACIÓN (no copies exacto, variá):\n"
        for p in seed_products:
            seeds_text += f"- {p.get('brand', '?')} {p.get('model', '?')} ({p.get('color', '?')}, {p.get('gender', '?')})\n"
    
    keywords_text = ""
    if trending_keywords:
        kws = random.sample(trending_keywords, min(8, len(trending_keywords)))
        keywords_text = f"\n\nKeywords trending actuales en MELI: {', '.join(kws)}"
    
    user_prompt = f"""Generá {n} listings MALOS de zapatillas para MercadoLibre Argentina.

PERFIL DEL VENDEDOR: {profile['description']}

INSTRUCCIONES ESPECÍFICAS:
{profile['instructions']}
{seeds_text}{keywords_text}

IMPORTANTE: Cada listing debe ser de un producto DIFERENTE (distinta marca, modelo, color).
Respondé con un JSON array de {n} objetos. Solo el JSON, nada más."""

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=3000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}]
        )
        
        text = response.content[0].text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        
        listings = json.loads(text)
        if not isinstance(listings, list):
            listings = [listings]
        
        # Agregar metadata del perfil
        for listing in listings:
            listing["seller_profile"] = profile["id"]
            listing["generated_at"] = datetime.now().isoformat()
        
        return listings
    
    except json.JSONDecodeError as e:
        print(f"  ⚠️ JSON inválido: {e}")
        return []
    except Exception as e:
        print(f"  ❌ Error API: {e}")
        return []


def main():
    print("🏭 Generador de Listings Malos - Pool Independiente")
    print("=" * 55)
    
    if API_KEY == "TU_API_KEY":
        print("\n⚠️ Configurá tu API key:")
        print("  $env:ANTHROPIC_API_KEY='tu_key'")
        return
    
    # Cargar datos existentes para inspiración
    real_products = []
    if os.path.exists(PRODUCTS_FILE):
        with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
            real_products = json.load(f)
        print(f"📂 {len(real_products)} productos reales cargados como semilla")
    
    trending_keywords = []
    if os.path.exists(TRENDS_FILE):
        with open(TRENDS_FILE, "r", encoding="utf-8") as f:
            trends = json.load(f)
            for cat_data in trends.values():
                if isinstance(cat_data, dict):
                    trending_keywords.extend(cat_data.get("keywords", []))
        trending_keywords = list(set(trending_keywords))
        print(f"🔑 {len(trending_keywords)} keywords trending cargadas")
    
    # Generar listings malos
    all_bad_listings = []
    LISTINGS_PER_PROFILE = 10  # 6 perfiles x 10 = 60 listings malos
    
    for profile in SELLER_PROFILES:
        print(f"\n👤 Perfil: {profile['id']} — {profile['description'][:50]}...")
        
        # Generar en batches de 5 para mejor calidad
        for batch_num in range(LISTINGS_PER_PROFILE // 5):
            print(f"  📝 Batch {batch_num + 1}...", end=" ")
            
            listings = generate_batch(
                profile=profile,
                n=5,
                trending_keywords=trending_keywords,
                real_products=real_products
            )
            
            if listings:
                all_bad_listings.extend(listings)
                print(f"✅ {len(listings)} listings")
                for l in listings:
                    print(f"     🏷️ \"{l.get('title', '?')[:55]}...\"")
            else:
                print("❌")
            
            time.sleep(1)
    
    # Guardar pool de listings malos
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_bad_listings, f, ensure_ascii=False, indent=2)
    
    # Stats
    print(f"\n{'='*55}")
    print(f"✅ Generados: {len(all_bad_listings)} listings malos")
    print(f"💾 Guardado en: {OUTPUT_FILE}")
    
    print(f"\n📊 Por perfil de seller:")
    profiles_count = {}
    for l in all_bad_listings:
        p = l.get("seller_profile", "unknown")
        profiles_count[p] = profiles_count.get(p, 0) + 1
    for p, count in profiles_count.items():
        print(f"   {p}: {count}")
    
    print(f"\n📊 Tipos de error más comunes:")
    error_counts = {}
    for l in all_bad_listings:
        for err in l.get("error_types", []):
            error_counts[err] = error_counts.get(err, 0) + 1
    for err, count in sorted(error_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"   {err}: {count}")
    
    print(f"\n📊 Marcas en listings malos:")
    brands = {}
    for l in all_bad_listings:
        b = l.get("brand", "Sin marca") or "Sin marca"
        brands[b] = brands.get(b, 0) + 1
    for b, count in sorted(brands.items(), key=lambda x: -x[1])[:10]:
        print(f"   {b}: {count}")
    
    # Generar trainset para DSPy
    print(f"\n{'='*55}")
    print("📦 Generando trainset para DSPy...")
    
    trainset = []
    for listing in all_bad_listings:
        example = {
            "input": {
                "title": listing.get("title", ""),
                "description": listing.get("description", ""),
                "brand": listing.get("brand", ""),
                "model": listing.get("model", ""),
                "color": listing.get("color", ""),
                "gender": listing.get("gender", ""),
                "shoe_type": listing.get("shoe_type", ""),
                "num_photos": listing.get("num_photos", 1),
                "attributes_filled": listing.get("attributes_filled", 1),
                "price_ars": listing.get("price_ars", 0),
            },
            "metadata": {
                "seller_profile": listing.get("seller_profile", ""),
                "error_types": listing.get("error_types", []),
            }
            # NO hay "output" / "label" → DSPy usará la métrica autónoma
        }
        trainset.append(example)
    
    trainset_file = OUTPUT_DIR / "09_dspy_trainset.json"
    with open(trainset_file, "w", encoding="utf-8") as f:
        json.dump(trainset, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Trainset DSPy: {trainset_file} ({len(trainset)} ejemplos)")
    
    print(f"\n🎯 Próximos pasos:")
    print(f"   1. Definir la métrica autónoma de calidad de listings")
    print(f"   2. Crear el pipeline DSPy: Auditor → Investigador → Gen texto")
    print(f"   3. Compilar con MIPROv2 usando este trainset")


if __name__ == "__main__":
    main()