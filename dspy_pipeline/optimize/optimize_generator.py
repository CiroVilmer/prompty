"""Optimize the TextGeneratorModule with MIPROv2.

Usage:
  python -m dspy_pipeline.optimize.optimize_generator --dry-run
  python -m dspy_pipeline.optimize.optimize_generator --confirm
  python -m dspy_pipeline.optimize.optimize_generator --confirm --preset medium
"""

import argparse
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

import dspy

from dspy_pipeline.config import configure_default_lm
from dspy_pipeline.data.degrade import make_training_pair
from dspy_pipeline.data.load import load_dataset, split_dataset
from dspy_pipeline.judges.metric import listing_quality_metric
from dspy_pipeline.modules.auditor import AuditorModule
from dspy_pipeline.modules.text_generator import TextGeneratorModule
from dspy_pipeline.optimize.common import (
    evaluate_module,
    get_git_sha,
    save_compiled,
)

COMPILED_DIR = Path("dspy_pipeline/compiled")


def _precompute_diagnoses(examples, seeds_offset=0):
    """Run AuditorModule on each example's weak fields, return
    {index -> serialized diagnosis dict}."""
    auditor = AuditorModule()
    cache = {}
    for i, ex in enumerate(examples):
        pair = make_training_pair(ex, seed=i + seeds_offset)
        ex_id = getattr(ex, "id", f"ex_{i}")
        print(f"    [{i+1}/{len(examples)}] {ex_id} ...", end=" ", flush=True)
        t0 = time.time()
        diagnosis = auditor(
            weak_title=pair.weak_title,
            weak_description=pair.weak_description,
            weak_attributes=pair.weak_attributes,
            category=pair.category,
            known_trending_keywords=pair.trending_keywords,
        )
        elapsed = time.time() - t0
        serialized = TextGeneratorModule._serialize_diagnosis(diagnosis)
        cache[i] = {"pair": pair, "diagnosis": serialized}
        print(f"({elapsed:.1f}s)")
    return cache


def _build_dspy_set(examples, cache):
    """Build dspy.Example list from examples + cached diagnoses."""
    result = []
    for i, ex in enumerate(examples):
        pair = cache[i]["pair"]
        diag = cache[i]["diagnosis"]
        entry = dspy.Example(
            weak_title=pair.weak_title,
            weak_description=pair.weak_description,
            weak_attributes=pair.weak_attributes,
            trending_keywords=ex.trending_keywords,
            category=ex.category,
            audit_diagnosis=diag,
            gold_title=ex.gold_title,
            gold_description=ex.gold_description,
            gold_attributes_count=ex.gold_attributes_count,
        ).with_inputs(
            "weak_title", "weak_description", "weak_attributes",
            "trending_keywords", "category", "audit_diagnosis",
        )
        result.append(entry)
    return result


def main():
    parser = argparse.ArgumentParser(
        description="Optimize TextGeneratorModule with MIPROv2"
    )
    parser.add_argument("--confirm", action="store_true",
                        help="Required to actually run optimization")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print cost estimate and exit")
    parser.add_argument("--preset", choices=["light", "medium"], default="light")
    parser.add_argument("--max-bootstrapped", type=int, default=2)
    parser.add_argument("--max-labeled", type=int, default=2)
    parser.add_argument("--num-threads", type=int, default=4)
    args = parser.parse_args()

    configure_default_lm()

    print("Loading data...")
    examples = load_dataset()
    train_raw, val_raw, holdout_raw = split_dataset(examples)

    n_train = len(train_raw)
    n_val = len(val_raw)
    n_holdout = len(holdout_raw)

    if args.preset == "light":
        est_candidates = 6
        est_trials = 6
    else:
        est_candidates = 12
        est_trials = 12

    minibatch = min(n_val, 25)
    est_bootstrap = args.max_bootstrapped * n_train * 2
    est_proposal = est_candidates * 2
    est_trial = est_trials * minibatch * 2
    est_final = n_val * 2
    est_total = est_bootstrap + est_proposal + est_trial + est_final
    est_precompute = n_train + n_val + n_holdout

    print(f"""
+---------------------------------------------------------+
| MIPROv2 Optimization Cost Estimate                      |
+---------------------------------------------------------+
| Preset:             {args.preset:<38}|
| Trainset:           {n_train:<38}|
| Valset:             {n_val:<38}|
| Max bootstrapped:   {args.max_bootstrapped:<38}|
| Max labeled:        {args.max_labeled:<38}|
+---------------------------------------------------------+
| Pre-compute audits: ~{est_precompute} Sonnet calls{' '*(26-len(str(est_precompute)))}|
| MIPROv2 est. calls: ~{est_total} (50% Sonnet, 50% Opus){' '*(6-len(str(est_total)))}|
| Rough cost:         $5-15 USD                           |
| Wall clock:         30-75 minutes                       |
+---------------------------------------------------------+
""")

    if args.dry_run:
        print("Dry run complete. Pass --confirm to run optimization.")
        return 0

    if not args.confirm:
        print("Missing --confirm flag. Use --dry-run to see estimate only.")
        return 1

    # --- Pre-compute audit diagnoses ---
    print(f"Pre-computing audit diagnoses for {n_train} train examples...")
    train_cache = _precompute_diagnoses(train_raw, seeds_offset=0)

    print(f"\nPre-computing audit diagnoses for {n_val} val examples...")
    val_cache = _precompute_diagnoses(val_raw, seeds_offset=100)

    print(f"\nPre-computing audit diagnoses for {n_holdout} holdout examples...")
    holdout_cache = _precompute_diagnoses(holdout_raw, seeds_offset=200)

    # --- Build DSPy datasets ---
    trainset = _build_dspy_set(train_raw, train_cache)
    valset = _build_dspy_set(val_raw, val_cache)
    holdoutset = _build_dspy_set(holdout_raw, holdout_cache)

    print(f"\nDatasets built: train={len(trainset)}, val={len(valset)}, holdout={len(holdoutset)}")

    # --- Baseline ---
    print("\nMeasuring baseline val score...")
    baseline_val = evaluate_module(
        TextGeneratorModule(), valset, listing_quality_metric,
        num_threads=args.num_threads,
    )
    print(f"Baseline val mean: {baseline_val['mean']:.3f}")

    # --- Optimize ---
    print(f"\nStarting MIPROv2 (preset={args.preset})...")
    t0 = time.time()

    optimizer = dspy.MIPROv2(
        metric=listing_quality_metric,
        auto=args.preset,
        num_threads=args.num_threads,
        max_bootstrapped_demos=args.max_bootstrapped,
        max_labeled_demos=args.max_labeled,
    )

    try:
        optimized = optimizer.compile(
            TextGeneratorModule(),
            trainset=trainset,
            requires_permission_to_run=False,
        )
    except KeyboardInterrupt:
        print("\n[!] Interrupted. No checkpoint saved.")
        raise
    except Exception as e:
        print(f"\n[!] MIPROv2 failed: {type(e).__name__}: {e}")
        print("Baseline val score remains the shipping number.")
        raise

    opt_time = time.time() - t0
    print(f"\nMIPROv2 completed in {opt_time/60:.1f} minutes.")

    # --- Evaluate optimized ---
    print("\nEvaluating optimized module on val...")
    val_result = evaluate_module(
        optimized, valset, listing_quality_metric,
        num_threads=args.num_threads,
    )

    print("Evaluating optimized module on holdout...")
    holdout_result = evaluate_module(
        optimized, holdoutset, listing_quality_metric,
        num_threads=args.num_threads,
    )

    delta = val_result["mean"] - baseline_val["mean"]
    print(f"\n{'='*50}")
    print(f"Baseline val:      {baseline_val['mean']:.3f}")
    print(f"Optimized val:     {val_result['mean']:.3f}  (delta {delta:+.3f})")
    print(f"Optimized holdout: {holdout_result['mean']:.3f}")
    print(f"{'='*50}")

    if delta < 0:
        print(
            f"\nWARNING: Optimization made val score WORSE "
            f"({baseline_val['mean']:.3f} -> {val_result['mean']:.3f}). "
            f"This can happen with very small datasets (overfitting to "
            f"bootstrapped demos). The unoptimized baseline remains the "
            f"recommended production artifact. Inspect per-example scores "
            f"and reasoning before deciding."
        )

    # --- Save ---
    meta = {
        "baseline_val_mean": baseline_val["mean"],
        "optimized_val_mean": val_result["mean"],
        "optimized_holdout_mean": holdout_result["mean"],
        "delta_val": delta,
        "per_example_val": val_result["per_example"],
        "per_example_holdout": holdout_result["per_example"],
        "preset": args.preset,
        "trainset_size": len(trainset),
        "max_bootstrapped_demos": args.max_bootstrapped,
        "max_labeled_demos": args.max_labeled,
        "optimization_time_minutes": round(opt_time / 60, 1),
        "git_sha": get_git_sha(),
    }
    path = save_compiled(
        optimized, meta,
        base_dir=COMPILED_DIR,
        name="generator",
    )
    print(f"\nSaved: {path}")
    print(f"Saved: {path.with_suffix('.meta.json')}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
