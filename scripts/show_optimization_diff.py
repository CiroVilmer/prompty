"""Show side-by-side baseline vs optimized generator output on holdout.

Usage:
  python scripts/show_optimization_diff.py              # latest version
  python scripts/show_optimization_diff.py --version 1  # specific version
"""

import argparse
import re
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import dspy

from dspy_pipeline.config import configure_default_lm
from dspy_pipeline.data.degrade import make_training_pair
from dspy_pipeline.data.load import load_dataset, split_dataset
from dspy_pipeline.judges.metric import listing_quality_metric
from dspy_pipeline.modules.auditor import AuditorModule
from dspy_pipeline.modules.text_generator import TextGeneratorModule

COMPILED_DIR = Path(__file__).resolve().parent.parent / "dspy_pipeline" / "compiled"


def _find_compiled_path(version=None):
    if version is not None:
        path = COMPILED_DIR / f"generator_v{version}.json"
        if not path.exists():
            print(f"Error: {path} not found.")
            sys.exit(1)
        return path
    paths = sorted(COMPILED_DIR.glob("generator_v*.json"))
    paths = [p for p in paths if re.match(r"generator_v\d+\.json$", p.name)]
    if not paths:
        print("Error: no compiled generator found in", COMPILED_DIR)
        sys.exit(1)
    return paths[-1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", type=int, default=None)
    args = parser.parse_args()

    configure_default_lm()

    compiled_path = _find_compiled_path(args.version)
    print(f"Using compiled generator: {compiled_path.name}\n")

    examples = load_dataset()
    _, _, holdout_raw = split_dataset(examples)

    auditor = AuditorModule()
    baseline_gen = TextGeneratorModule()
    optimized_gen = TextGeneratorModule()
    optimized_gen.load(str(compiled_path))

    baseline_scores = []
    optimized_scores = []

    for i, ex in enumerate(holdout_raw):
        pair = make_training_pair(ex, seed=i + 200)
        ex_id = getattr(ex, "id", f"holdout_{i}")

        diagnosis = auditor(
            weak_title=pair.weak_title,
            weak_description=pair.weak_description,
            weak_attributes=pair.weak_attributes,
            category=pair.category,
            known_trending_keywords=pair.trending_keywords,
        )
        diag_dict = TextGeneratorModule._serialize_diagnosis(diagnosis)

        gen_kwargs = dict(
            weak_title=pair.weak_title,
            weak_description=pair.weak_description,
            weak_attributes=pair.weak_attributes,
            trending_keywords=ex.trending_keywords,
            category=ex.category,
            audit_diagnosis=diag_dict,
        )

        base_pred = baseline_gen(**gen_kwargs)
        opt_pred = optimized_gen(**gen_kwargs)

        judge_ex = dspy.Example(
            gold_title=ex.gold_title,
            gold_description=ex.gold_description,
            gold_attributes_count=ex.gold_attributes_count,
            category=ex.category,
            trending_keywords=ex.trending_keywords,
        )

        base_score = listing_quality_metric(judge_ex, base_pred, trace=None)
        opt_score = listing_quality_metric(judge_ex, opt_pred, trace=None)

        baseline_scores.append(float(base_score))
        optimized_scores.append(float(opt_score))

        base_attrs = getattr(base_pred, "attributes", {}) or {}
        opt_attrs = getattr(opt_pred, "attributes", {}) or {}

        print(f"{'='*60} {ex_id} {'='*10}")
        print(f"WEAK INPUT:")
        print(f"  title: {pair.weak_title}")
        print(f"  desc:  {pair.weak_description[:80]}...")
        print()
        print(f"BASELINE   (score {base_score:.2f}):")
        print(f"  title: {getattr(base_pred, 'title', '')}")
        print(f"  desc:  {getattr(base_pred, 'description', '')[:120]}...")
        print(f"  attrs: {len(base_attrs)} filled")
        print()
        print(f"OPTIMIZED  (score {opt_score:.2f}):")
        print(f"  title: {getattr(opt_pred, 'title', '')}")
        print(f"  desc:  {getattr(opt_pred, 'description', '')[:120]}...")
        print(f"  attrs: {len(opt_attrs)} filled")
        print()
        print(f"GOLD:")
        print(f"  title: {ex.gold_title}")
        print()

    mean_base = sum(baseline_scores) / len(baseline_scores)
    mean_opt = sum(optimized_scores) / len(optimized_scores)
    print(f"{'='*70}")
    print(f"HOLDOUT SUMMARY:")
    print(f"  Baseline mean:   {mean_base:.3f}")
    print(f"  Optimized mean:  {mean_opt:.3f}")
    print(f"  Delta:           {mean_opt - mean_base:+.3f}")


if __name__ == "__main__":
    main()
