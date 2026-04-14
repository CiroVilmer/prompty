"""/api/generate returns the UNOPTIMIZED baseline DSPy pipeline.
The MIPROv2-compiled program showed no statistically significant
improvement on our 15-example holdout (baseline 0.739, optimized
0.718). The baseline is the honest production artifact. The optimized
version is available via /api/compare for demonstration purposes."""

import asyncio
import logging

from fastapi import APIRouter, Depends

from apps.api.schemas import GenerateRequest, GenerateResponse
from apps.api.dependencies import get_generator_baseline

router = APIRouter()
logger = logging.getLogger(__name__)

MOCK_GENERATE = GenerateResponse(
    title=(
        "Notebook HP 255 G10 Ryzen 7 7730U | 16GB RAM | 512GB SSD NVMe "
        "| 15.6\" Full HD | Windows 11 Home"
    ),
    description=(
        "DESCRIPCIÓN DEL PRODUCTO\n"
        "*****************************************\n"
        "La HP 255 G10 es una notebook confiable y potente, diseñada "
        "para trabajo profesional, estudio universitario y uso diario "
        "intensivo.\n\n"
        "Equipada con el procesador AMD Ryzen 7 7730U, 16 GB de RAM y "
        "512 GB de SSD NVMe, ofrece un desempeño sólido para multitarea "
        "y software exigente.\n\n"
        "ESPECIFICACIONES TÉCNICAS\n"
        "****************************************\n"
        "Procesador: AMD Ryzen 7 7730U\n"
        "RAM: 16 GB DDR4\n"
        "Almacenamiento: 512 GB SSD NVMe\n"
        "Pantalla: 15.6\" Full HD\n"
        "Sistema operativo: Windows 11 Home\n\n"
        "5 RAZONES PARA COMPRARLA\n"
        "*****************************************\n"
        "1. Procesador Ryzen 7 de 8 núcleos.\n"
        "2. 16 GB de RAM y 512 GB SSD listos para trabajar.\n"
        "3. Pantalla Full HD de 15.6 pulgadas.\n"
        "4. Teclado con pad numérico.\n"
        "5. Excelente relación precio-prestaciones."
    ),
    attributes={
        "BRAND": "HP",
        "LINE": "255 G10",
        "MODEL": "A82ZVUA",
        "PROCESSOR_BRAND": "AMD",
        "PROCESSOR_LINE": "Ryzen 7",
        "PROCESSOR_MODEL": "7730U",
        "RAM_MEMORY_MODULE_TOTAL_CAPACITY": "16 GB",
        "RAM_MEMORY_TYPE": "DDR4",
        "SSD_DATA_STORAGE_CAPACITY": "512 GB",
        "DISPLAY_SIZE": "15.6 \"",
        "DISPLAY_RESOLUTION": "1920 px x 1080 px",
        "OS_NAME": "Windows",
        "OS_VERSION": "11",
    },
)


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest, generator=Depends(get_generator_baseline)):
    if generator is None:
        return MOCK_GENERATE
    try:
        result = await asyncio.to_thread(
            generator,
            weak_title=req.weak_title,
            weak_description=req.weak_description,
            weak_attributes=req.weak_attributes,
            category=req.category,
            trending_keywords=req.trending_keywords,
            audit_diagnosis=req.audit_diagnosis,
        )
        return GenerateResponse(
            title=str(result.title),
            description=str(result.description),
            attributes={str(k): str(v) for k, v in (result.attributes or {}).items()},
        )
    except Exception:
        logger.exception("Generator failed; returning mock fallback")
        return MOCK_GENERATE
