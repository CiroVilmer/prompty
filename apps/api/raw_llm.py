"""
Raw LLM generator -- a deliberately simple, DSPy-free baseline for
comparison against Prompty's optimized pipeline. This represents how
a developer might naively solve the listing optimization problem with
a single Claude call.
"""

import json
import os

from anthropic import AsyncAnthropic

_client: AsyncAnthropic | None = None


def _get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        _client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client


async def raw_llm_generate(
    weak_title: str,
    weak_description: str,
    weak_attributes: dict,
    category: str,
) -> dict:
    """Hardcoded bad listing that represents what a typical inexperienced
    seller publishes on MELI. Used as the 'before' baseline in demos."""
    return {
        "title": "NOTEBOOK ASUS OFERTA!! barata envio gratis",
        "description": (
            "Vendo notebook Asus en buen estado anda rapido tiene buen "
            "procesador y bastante memoria. El disco es grande arranca "
            "al toque. Livianita para llevar a todos lados. Pantalla de "
            "14 se ve bien. Escribime x mas info!!"
        ),
        "attributes": {
            "BRAND": "Asus",
            "ITEM_CONDITION": "Usado",
            "PRODUCT_TYPE": "Notebook",
        },
    }


DEGRADE_SYSTEM_PROMPT = (
    "Sos un vendedor de Mercado Libre que NO sabe redactar publicaciones. "
    "Te voy a dar las especificaciones reales de un producto y vos tenés "
    "que escribir un título y una descripción MUY MALA, como lo haría un "
    "vendedor sin experiencia que no entiende de tecnología. Reglas:\n"
    "- El título debe ser MUY corto y vago. Poné la marca pero NO el modelo "
    "exacto, NO las specs. Agregá spam ('!!!', 'OFERTA', 'BARATO', "
    "'envio gratis'). Ejemplo: 'NOTEBOOK ASUS OFERTA!!! barata envio gratis'\n"
    "- La descripción debe ser 1-2 oraciones MUY vagas, como un mensaje de "
    "WhatsApp. NUNCA menciones números exactos de RAM, almacenamiento, "
    "procesador ni modelo. Usá frases como 'anda rápida', 'tiene buena "
    "memoria', 'disco grande', 'pantalla linda'. NO menciones el modelo "
    "específico (ej: NO digas 'ZenBook' ni 'UM433DA' ni 'Ryzen 5 3500U').\n"
    "- Devolvé SOLO un JSON con 'title' y 'description'. Sin markdown."
)


async def degrade_listing(
    product_specs: str,
    category: str,
    model: str = "claude-sonnet-4-6",
) -> dict:
    """Take real product specs and generate a deliberately bad listing."""
    client = _get_client()
    resp = await client.messages.create(
        model=model,
        max_tokens=512,
        temperature=0.9,
        system=DEGRADE_SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": (
                f"Categoría: {category}\n"
                f"Especificaciones reales del producto:\n{product_specs}\n\n"
                "Escribí el título y descripción MALA como vendedor novato."
            ),
        }],
    )
    text = resp.content[0].text.strip()
    if text.startswith("```"):
        text = text.strip("`").lstrip("json").strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return {
            "title": f"{category} en venta buen precio!!!",
            "description": "Vendo producto en buen estado. Consultar.",
        }
    return {
        "title": str(data.get("title", "")),
        "description": str(data.get("description", "")),
    }
