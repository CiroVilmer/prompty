"""
Bad Listings de Laptops - Basados en Productos Reales
======================================================
Toma laptops reales del dataset y genera versiones degradadas
usando la info real pero mal presentada.

NO inventa productos — usa los datos reales y los arruina
como lo haría un seller amateur.

Uso:
  $env:ANTHROPIC_API_KEY='tu_api_key'
  python generate_bad_laptops.py
"""

import json
import os
import time
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("Instalá el SDK: pip install anthropic")
    exit(1)

API_KEY = "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"
MODEL = "claude-haiku-4-5-20251001"
LAPTOPS_FILE = "dataset_laptops_v2/03_laptops.json"
OUTPUT_DIR = Path("dataset_laptops_v2")
OUTPUT_FILE = OUTPUT_DIR / "08_bad_listings.json"

client = anthropic.Anthropic(api_key=API_KEY)

SYSTEM_PROMPT = """Sos un simulador de sellers amateurs de MercadoLibre Argentina.

Te voy a dar los datos REALES de una laptop del catálogo de MELI. Tu trabajo es 
generar 3 versiones MALAS del listing de ESA MISMA laptop, cada una con un perfil 
diferente de seller amateur.

REGLAS CRÍTICAS:
- Es el MISMO producto real, con la MISMA info — pero MAL presentado
- Usá los datos reales (marca, modelo, procesador, RAM, etc.) pero degradalos
- NO inventes specs que no existen en el producto original
- Las fotos son las mismas pero el seller usa menos (indicá cuántas usaría)

Los 3 perfiles:

PERFIL A - "El Novato": 
- Título cortísimo y genérico, omite la mayoría de specs
- Sin descripción o 1 línea genérica
- Solo completa 2-3 atributos obligatorios
- Usa 1-2 fotos de las disponibles

PERFIL B - "El Spammer":
- Título en MAYÚSCULAS con keywords spam y signos de exclamación  
- Descripción llena de "OFERTA!!!", "ENVÍO GRATIS", "CONSULTE" sin specs reales
- Completa algunos atributos pero con valores genéricos
- Usa 2-3 fotos con banners de oferta

PERFIL C - "El Incompleto":
- Título tiene la marca pero le falta modelo o specs clave
- Descripción copia parcial de la ficha técnica, cortada o desordenada
- Completa la mitad de atributos, algunos con errores sutiles
- Usa 3-4 fotos

Respondé SOLO con un JSON array de 3 objetos (uno por perfil), sin markdown ni backticks.
Cada objeto debe tener:
{
  "profile": "novato" | "spammer" | "incompleto",
  "title": "título malo",
  "description": "descripción mala",
  "attributes_shown": {"BRAND": "valor", "MODEL": "", ...},
  "num_photos_used": 2,
  "error_types": ["titulo_generico", "pocos_atributos", ...]
}

Error types posibles:
titulo_generico, titulo_mayusculas, titulo_spam, titulo_cortado, titulo_sin_specs,
pocos_atributos, atributos_vacios, atributos_genericos, 
sin_descripcion, descripcion_spam, descripcion_cortada, descripcion_sin_specs,
pocas_fotos"""


def generate_bad_versions(laptop):
    """Genera 3 versiones malas de una laptop real."""
    
    attrs = laptop.get("all_attributes", {})
    
    user_prompt = f"""Generá 3 listings MALOS para esta laptop REAL de MercadoLibre:

DATOS REALES DEL CATÁLOGO:
- Nombre completo: {laptop.get('name', '')}
- Marca: {laptop.get('brand', '')}
- Modelo: {laptop.get('model', '')}
- Línea: {laptop.get('line', '')}
- Procesador: {laptop.get('processor_brand', '')} {laptop.get('processor_model', '')}
- Línea procesador: {laptop.get('processor_line', '')}
- RAM: {laptop.get('ram_memory', '')}
- Tipo RAM: {laptop.get('ram_type', '')}
- Almacenamiento: {laptop.get('storage_capacity', '')} {laptop.get('storage_type', '')}
- Pantalla: {laptop.get('screen_size', '')}
- Resolución: {laptop.get('screen_resolution', '')}
- GPU: {laptop.get('gpu_brand', '')} {laptop.get('gpu_model', '')}
- Sistema Operativo: {laptop.get('os', '')} {laptop.get('os_version', '')}
- Color: {laptop.get('color', '')}
- Fotos disponibles: {laptop.get('num_pictures', 0)}
- Total atributos completos: {len(attrs)}

Algunos atributos adicionales: {json.dumps(dict(list(attrs.items())[:15]), ensure_ascii=False)}

Recordá: usá los datos REALES de esta laptop, pero presentalos MAL según cada perfil."""

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}]
        )
        
        text = response.content[0].text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    
    except json.JSONDecodeError as e:
        print(f"  ⚠️ JSON inválido: {e}")
        return None
    except Exception as e:
        print(f"  ❌ Error API: {e}")
        return None


def main():
    print("🏭 Bad Listings de Laptops (basados en productos reales)")
    print("=" * 58)
    
    if API_KEY == "TU_API_KEY":
        print("\n⚠️ Configurá tu API key:")
        print("  $env:ANTHROPIC_API_KEY='tu_key'")
        return
    
    # Cargar laptops reales
    with open(LAPTOPS_FILE, "r", encoding="utf-8") as f:
        all_laptops = json.load(f)
    
    # Filtrar solo las que son laptops reales (tienen procesador)
    real_laptops = [l for l in all_laptops if l.get("processor_brand")]
    print(f"📂 {len(real_laptops)} laptops reales con procesador identificado")
    
    # Tomar las 10 mejores (más completas)
    real_laptops.sort(key=lambda x: len(x.get("all_attributes", {})), reverse=True)
    selected = real_laptops[:3]
    
    print(f"📋 Seleccionadas {len(selected)} laptops:\n")
    for i, l in enumerate(selected):
        cpu = f"{l.get('processor_brand', '')} {l.get('processor_model', '')}".strip()
        print(f"  {i+1}. {l.get('brand', '?')} {l.get('model', '?')} | {cpu} | "
              f"{l.get('ram_memory', '?')} RAM | {l.get('storage_capacity', '?')}")
    
    # Generar bad listings
    all_bad = []
    
    for i, laptop in enumerate(selected):
        name = laptop.get("name", "?")[:50
        ]
        print(f"\n[{i+1}/{len(selected)}] {name}...", end=" ")
        
        bad_versions = generate_bad_versions(laptop)
        
        if bad_versions and isinstance(bad_versions, list):
            for version in bad_versions:
                version["original_product_id"] = laptop.get("id", "")
                version["original_name"] = laptop.get("name", "")
                version["original_brand"] = laptop.get("brand", "")
                version["original_model"] = laptop.get("model", "")
                version["original_processor"] = f"{laptop.get('processor_brand', '')} {laptop.get('processor_model', '')}".strip()
                version["original_ram"] = laptop.get("ram_memory", "")
                version["original_storage"] = laptop.get("storage_capacity", "")
                version["original_num_photos"] = laptop.get("num_pictures", 0)
                version["original_photo_urls"] = laptop.get("picture_urls", [])[:3]
                
            all_bad.extend(bad_versions)
            profiles = [v.get("profile", "?") for v in bad_versions]
            print(f"✅ {len(bad_versions)} versiones ({', '.join(profiles)})")
            
            # Mostrar preview del novato
            novato = next((v for v in bad_versions if v.get("profile") == "novato"), bad_versions[0])
            print(f"     Novato:  \"{novato.get('title', '?')[:60]}\"")
            spammer = next((v for v in bad_versions if v.get("profile") == "spammer"), None)
            if spammer:
                print(f"     Spammer: \"{spammer.get('title', '?')[:60]}\"")
        else:
            print("❌")
        
        time.sleep(1)
    
    # Guardar
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_bad, f, ensure_ascii=False, indent=2)
    
    # Stats
    print(f"\n{'='*58}")
    print(f"✅ Generados: {len(all_bad)} bad listings de {len(selected)} laptops reales")
    print(f"💾 Guardado en: {OUTPUT_FILE}")
    
    print(f"\n📊 Por perfil:")
    profile_counts = {}
    for b in all_bad:
        p = b.get("profile", "?")
        profile_counts[p] = profile_counts.get(p, 0) + 1
    for p, c in profile_counts.items():
        print(f"   {p}: {c}")
    
    print(f"\n📊 Errores más comunes:")
    error_counts = {}
    for b in all_bad:
        for e in b.get("error_types", []):
            error_counts[e] = error_counts.get(e, 0) + 1
    for e, c in sorted(error_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"   {e}: {c}")
    
    # Generar trainset combinado
    print(f"\n📦 Generando trainset DSPy...")
    trainset = []
    for b in all_bad:
        trainset.append({
            "input": {
                "title": b.get("title", ""),
                "description": b.get("description", ""),
                "attributes_shown": b.get("attributes_shown", {}),
                "num_photos": b.get("num_photos_used", 1),
                "error_types": b.get("error_types", []),
            },
            "real_product": {
                "id": b.get("original_product_id", ""),
                "name": b.get("original_name", ""),
                "brand": b.get("original_brand", ""),
                "model": b.get("original_model", ""),
                "processor": b.get("original_processor", ""),
                "ram": b.get("original_ram", ""),
                "storage": b.get("original_storage", ""),
                "photo_urls": b.get("original_photo_urls", []),
            },
            "profile": b.get("profile", ""),
        })
    
    trainset_file = OUTPUT_DIR / "09_dspy_trainset.json"
    with open(trainset_file, "w", encoding="utf-8") as f:
        json.dump(trainset, f, ensure_ascii=False, indent=2)
    print(f"💾 Trainset: {trainset_file} ({len(trainset)} ejemplos)")


if __name__ == "__main__":
    main()