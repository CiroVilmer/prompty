from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.routers import audit, generate, image, compare, degrade
from apps.api.dependencies import is_real_mode, get_init_error, _latest_compiled

import os

app = FastAPI(title="Prompty API", version="0.1.0")

# CORS — permissive for now. Tighten before production demo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ] + [o.strip() for o in os.getenv("EXTRA_CORS_ORIGINS", "").split(",") if o.strip()],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audit.router, prefix="/api", tags=["audit"])
app.include_router(generate.router, prefix="/api", tags=["generate"])
app.include_router(image.router, prefix="/api", tags=["image"])
app.include_router(compare.router, prefix="/api", tags=["compare"])
app.include_router(degrade.router, prefix="/api", tags=["degrade"])


@app.get("/api/health")
async def health():
    compiled = _latest_compiled("generator")
    return {
        "status": "ok",
        "mode": "real" if is_real_mode() else "mock",
        "init_error": get_init_error(),
        "compiled_generator": compiled.name if compiled else None,
        "endpoints": ["/api/audit", "/api/generate", "/api/image-prompt", "/api/compare"],
    }
