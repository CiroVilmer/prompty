"""Measure unoptimized baseline scores for Auditor and TextGenerator.

History: the first baseline run (baseline_generator_val_LEAKED.json) fed
product_specs to the generator, leaking gold data. Fixed 2026-04-14 to
pass only weak_title/weak_description/weak_attributes.

These numbers are the "before" in the demo narrative. Commit the JSON
artifacts to git before running MIPROv2 so the comparison is reproducible.

Run:
  python scripts/baseline_eval.py                # val split (default)
  python scripts/baseline_eval.py --split holdout
  python scripts/baseline_eval.py --limit 2      # quick smoke test
"""

import argparse
import json
import statistics
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import dspy

from dspy_pipeline.config import configure_default_lm
from dspy_pipeline.data.degrade import make_training_pair
from dspy_pipeline.data.load import load_dataset, split_dataset
from dspy_pipeline.judges.audit_judge import audit_quality_metric
from dspy_pipeline.judges.metric import listing_quality_metric
from dspy_pipeline.modules.auditor import AuditorModule
from dspy_pipeline.modules.text_generator import TextGeneratorModule

COMPILED_DIR = Path(__file__).resolve().parent.parent / "dspy_pipeline" / "compiled"


def _git_sha() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
    except Exception:
        return "unknown"


def _build_artifact(module_name, split_name, records):
    scores = [r["score"] for r in records]
    return {
        "module": module_name,
        "optimizer": None,
        "split": split_name,
        "n_examples": len(records),
        "metric_mean": round(statistics.mean(scores), 4),
        "metric_median": round(statistics.median(scores), 4),
        "metric_stdev": round(statistics.stdev(scores), 4) if len(scores) > 1 else 0.0,
        "metric_min": round(min(scores), 4),
        "metric_max": round(max(scores), 4),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "git_sha": _git_sha(),
        "per_example": records,
    }


def main():
    parser = argparse.ArgumentParser(description="Baseline evaluation for Prompty modules")
    parser.add_argument("--split", choices=["val", "holdout", "both"], default="val")
    parser.add_argument("--limit", type=int, default=None, help="Cap examples per split")
    args = parser.parse_args()

    configure_default_lm()

    examples = load_dataset()
    train, val, holdout = split_dataset(examples)

    splits = {}
    if args.split in ("val", "both"):
        splits["val"] = val
    if args.split in ("holdout", "both"):
        splits["holdout"] = holdout

    for split_name, split_examples in splits.items():
        if args.limit:
            split_examples = split_examples[:args.limit]

        n = len(split_examples)
        est_calls = n * 4
        print(f"\n--- Split: {split_name} | {n} examples | ~{est_calls} LM calls ---")

        auditor = AuditorModule()
        generator = TextGeneratorModule()

        auditor_records = []
        generator_records = []

        for i, ex in enumerate(split_examples):
            pair = make_training_pair(ex, seed=i + 100)
            ex_id = getattr(ex, "id", f"{split_name}_{i}")
            print(f"  [{i+1}/{n}] {ex_id} ...", end=" ", flush=True)

            # --- Auditor ---
            t0 = time.time()
            diagnosis = auditor(
                weak_title=pair.weak_title,
                weak_description=pair.weak_description,
                weak_attributes=pair.weak_attributes,
                category=pair.category,
                known_trending_keywords=pair.trending_keywords,
            )
            audit_latency = time.time() - t0

            audit_score = audit_quality_metric(pair, diagnosis, trace=None)

            auditor_records.append({
                "example_id": ex_id,
                "score": round(float(audit_score), 4),
                "latency_s": round(audit_latency, 1),
                "input": {
                    "weak_title": pair.weak_title,
                    "weak_description": pair.weak_description,
                    "weak_attributes": pair.weak_attributes,
                },
                "output": {
                    "missing_critical_attributes": getattr(diagnosis, "missing_critical_attributes", []),
                    "title_issues": getattr(diagnosis, "title_issues", []),
                    "description_issues": getattr(diagnosis, "description_issues", []),
                    "missing_keywords": getattr(diagnosis, "missing_keywords", []),
                    "priority_fixes": getattr(diagnosis, "priority_fixes", []),
                },
                "reference": {
                    "gold_title": pair.gold_title,
                    "gold_description": pair.gold_description[:200] + "...",
                    "gold_attributes_count": pair.gold_attributes_count,
                },
            })

            # --- Generator ---
            t0 = time.time()
            listing = generator(
                weak_title=pair.weak_title,
                weak_description=pair.weak_description,
                weak_attributes=pair.weak_attributes,
                trending_keywords=pair.trending_keywords,
                category=pair.category,
                audit_diagnosis=diagnosis,
            )
            gen_latency = time.time() - t0

            gen_score = listing_quality_metric(pair, listing, trace=None)

            generator_records.append({
                "example_id": ex_id,
                "score": round(float(gen_score), 4),
                "latency_s": round(gen_latency, 1),
                "input": {
                    "weak_title": pair.weak_title,
                    "weak_description": pair.weak_description,
                    "weak_attributes_keys": list(pair.weak_attributes.keys()),
                    "category": pair.category,
                },
                "output": {
                    "title": getattr(listing, "title", ""),
                    "description": getattr(listing, "description", "")[:300] + "...",
                    "attributes_count": len(getattr(listing, "attributes", {}) or {}),
                },
                "reference": {
                    "gold_title": pair.gold_title,
                    "gold_description": pair.gold_description[:200] + "...",
                    "gold_attributes_count": pair.gold_attributes_count,
                },
            })

            print(f"audit={audit_score:.2f} gen={gen_score:.2f} "
                  f"({audit_latency:.1f}s + {gen_latency:.1f}s)")

        # --- Save artifacts ---
        audit_artifact = _build_artifact("auditor", split_name, auditor_records)
        gen_artifact = _build_artifact("generator", split_name, generator_records)

        audit_path = COMPILED_DIR / f"baseline_auditor_{split_name}.json"
        gen_path = COMPILED_DIR / f"baseline_generator_{split_name}.json"

        audit_path.write_text(json.dumps(audit_artifact, indent=2, ensure_ascii=False), encoding="utf-8")
        gen_path.write_text(json.dumps(gen_artifact, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"  Saved: {audit_path.name}, {gen_path.name}")

        # --- Summary table ---
        print(f"\n  {'Module':<12} | {'N':>3} | {'Mean':>6} | {'Median':>6} | {'Stdev':>6} | {'Min':>6} | {'Max':>6}")
        print(f"  {'-'*12}-+-{'-'*3}-+-{'-'*6}-+-{'-'*6}-+-{'-'*6}-+-{'-'*6}-+-{'-'*6}")
        for name, art in [("Auditor", audit_artifact), ("Generator", gen_artifact)]:
            print(f"  {name:<12} | {art['n_examples']:>3} | {art['metric_mean']:>6.3f} | "
                  f"{art['metric_median']:>6.3f} | {art['metric_stdev']:>6.3f} | "
                  f"{art['metric_min']:>6.3f} | {art['metric_max']:>6.3f}")

    print("\nDone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
