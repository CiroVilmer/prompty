import logging
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger(__name__)

_REAL_MODULES_AVAILABLE = False
_INIT_ERROR: str | None = None

try:
    import dspy
    from dspy_pipeline.config import configure_default_lm
    from dspy_pipeline.modules import (
        AuditorModule, TextGeneratorModule, ImagePrompterModule,
    )
    configure_default_lm()
    _REAL_MODULES_AVAILABLE = True
    logger.info("DSPy modules available; real mode enabled.")
except Exception as e:
    _INIT_ERROR = f"{type(e).__name__}: {e}"
    logger.warning("DSPy NOT available. Falling back to mocks. Error: %s", _INIT_ERROR)


def is_real_mode() -> bool:
    return _REAL_MODULES_AVAILABLE


def get_init_error() -> str | None:
    return _INIT_ERROR


def _latest_compiled(name: str) -> Path | None:
    base = Path("dspy_pipeline/compiled")
    if not base.exists():
        return None
    matches = sorted(
        p for p in base.glob(f"{name}_v*.json")
        if not p.name.endswith(".meta.json")
    )
    return matches[-1] if matches else None


@lru_cache(maxsize=1)
def get_auditor():
    if not _REAL_MODULES_AVAILABLE:
        return None
    return AuditorModule()


@lru_cache(maxsize=1)
def get_generator_baseline():
    """/api/generate returns the UNOPTIMIZED baseline DSPy pipeline.
    The MIPROv2-compiled program showed no statistically significant
    improvement on our 15-example holdout (baseline 0.739, optimized
    0.718). The baseline is the honest production artifact."""
    if not _REAL_MODULES_AVAILABLE:
        return None
    return TextGeneratorModule()


@lru_cache(maxsize=1)
def get_generator_optimized():
    """TextGeneratorModule with the MIPROv2-compiled program loaded.
    Used by /api/compare for the three-way comparison."""
    if not _REAL_MODULES_AVAILABLE:
        return None
    mod = TextGeneratorModule()
    compiled = _latest_compiled("generator")
    if compiled is None:
        logger.warning("No compiled generator found; returning unoptimized as fallback.")
        return mod
    try:
        mod.load(str(compiled))
        logger.info("Loaded compiled generator: %s", compiled.name)
    except Exception as e:
        logger.error("Failed to load %s: %s", compiled.name, e)
    return mod


@lru_cache(maxsize=1)
def get_image_prompter():
    if not _REAL_MODULES_AVAILABLE:
        return None
    return ImagePrompterModule()


@lru_cache(maxsize=1)
def get_listing_judge():
    """The LLM-as-judge used for scoring. Loaded lazily because it's
    only used by /api/compare."""
    if not _REAL_MODULES_AVAILABLE:
        return None
    from dspy_pipeline.judges import ListingJudge
    return ListingJudge()
