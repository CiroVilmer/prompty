import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import dspy


def evaluate_module(module, examples, metric, num_threads=4) -> dict:
    """Run dspy.Evaluate and return a dict with mean score and
    per-example scores. Handles the current EvaluationResult shape
    (dspy >= 2.5) where results live in the `results` attribute."""
    evaluator = dspy.Evaluate(
        devset=examples,
        metric=metric,
        num_threads=num_threads,
        display_progress=True,
    )
    result = evaluator(module)

    # Current dspy returns an EvaluationResult object with:
    #   - .score  (float, the mean metric value)
    #   - .results (list of (example, prediction, score) tuples)
    # Older versions returned a plain float or a (float, list) tuple.
    # Handle all three shapes defensively.
    mean_score = None
    per_example_raw = []

    if hasattr(result, "score") and hasattr(result, "results"):
        mean_score = float(result.score)
        per_example_raw = result.results
    elif isinstance(result, tuple) and len(result) >= 2:
        mean_score = float(result[0])
        per_example_raw = result[1]
    elif isinstance(result, (int, float)):
        mean_score = float(result)
        per_example_raw = []
    else:
        raise RuntimeError(
            f"Unexpected dspy.Evaluate return type: {type(result).__name__}. "
            f"Inspect and extend evaluate_module."
        )

    per_example = []
    for item in per_example_raw:
        ex, score = None, None
        if isinstance(item, tuple):
            if len(item) == 3:
                ex, _pred, score = item
            elif len(item) == 2:
                ex, score = item
        if ex is None:
            continue
        per_example.append({
            "example_id": getattr(ex, "id", None),
            "score": float(score) if score is not None else 0.0,
        })

    return {"mean": mean_score, "per_example": per_example}


def next_version_path(base_dir: Path, name: str) -> Path:
    """Find base_dir / f'{name}_v{N}.json' with N = next free int."""
    base_dir.mkdir(parents=True, exist_ok=True)
    n = 1
    while (base_dir / f"{name}_v{n}.json").exists():
        n += 1
    return base_dir / f"{name}_v{n}.json"


def get_git_sha() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        return "unknown"


def save_compiled(module, meta: dict, base_dir: Path, name: str) -> Path:
    """Save optimized DSPy program + meta. Returns the program path."""
    path = next_version_path(base_dir, name)
    module.save(str(path))
    meta_path = path.with_suffix(".meta.json")
    meta = {**meta, "saved_at": datetime.now(timezone.utc).isoformat()}
    meta_path.write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return path
