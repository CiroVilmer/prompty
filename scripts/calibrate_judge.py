"""Calibrate the ListingJudge before using it to drive MIPROv2.

Two sanity checks on 5 training examples:
  1. GOLD-SELF: gold listing as both generated and reference → expect ≥ 0.80
  2. DEGRADED: degraded listing as generated, gold as reference → expect ≤ 0.40

Run:
  python scripts/calibrate_judge.py              # full (gold-self + degraded)
  python scripts/calibrate_judge.py --gold-only  # gold-self only (saves budget)
"""

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import dspy

from dspy_pipeline.config import JUDGE_LM, configure_default_lm
from dspy_pipeline.data.degrade import degrade
from dspy_pipeline.data.load import load_dataset, split_dataset
from dspy_pipeline.judges.listing_judge import ListingJudge
from dspy_pipeline.judges.metric import (
    ATTRIBUTES_WEIGHT,
    DESCRIPTION_WEIGHTS,
    KEYWORDS_WEIGHT,
    TITLE_WEIGHTS,
    _normalize_ordinal,
)


def _run_judge(judge, ex, pred):
    """Run judge and return (result, score, per-dimension dict)."""
    r = judge(
        generated_title=pred.title,
        generated_description=pred.description,
        generated_attributes=pred.attributes,
        reference_title=ex.gold_title,
        reference_description=ex.gold_description,
        reference_attributes_count=ex.gold_attributes_count,
        category=ex.category,
        trending_keywords=ex.trending_keywords,
    )

    title_score = (
        TITLE_WEIGHTS["brand"] * float(r.title_has_brand)
        + TITLE_WEIGHTS["model"] * float(r.title_has_model_or_line)
        + TITLE_WEIGHTS["specs"] * float(r.title_has_key_specs)
        + TITLE_WEIGHTS["length"] * float(r.title_length_ok)
        + TITLE_WEIGHTS["no_spam"] * float(r.title_avoids_spam)
    )
    desc_score = (
        DESCRIPTION_WEIGHTS["completeness"] * _normalize_ordinal(r.description_completeness)
        + DESCRIPTION_WEIGHTS["structure"] * _normalize_ordinal(r.description_structure)
        + DESCRIPTION_WEIGHTS["buyer_qs"] * _normalize_ordinal(r.description_answers_buyer_qs)
    )
    attr_score = ATTRIBUTES_WEIGHT * _normalize_ordinal(r.attributes_coverage)
    kw_score = KEYWORDS_WEIGHT * float(r.uses_relevant_trending_keywords)
    total = title_score + desc_score + attr_score + kw_score

    dims = {
        "title_has_brand": r.title_has_brand,
        "title_has_model_or_line": r.title_has_model_or_line,
        "title_has_key_specs": r.title_has_key_specs,
        "title_length_ok": r.title_length_ok,
        "title_avoids_spam": r.title_avoids_spam,
        "description_completeness": r.description_completeness,
        "description_structure": r.description_structure,
        "description_answers_buyer_qs": r.description_answers_buyer_qs,
        "attributes_coverage": r.attributes_coverage,
        "uses_relevant_trending_keywords": r.uses_relevant_trending_keywords,
        "reasoning": r.reasoning,
        "top_improvement": r.top_improvement,
        # Weighted sub-scores for debugging
        "w_title": title_score,
        "w_desc": desc_score,
        "w_attr": attr_score,
        "w_kw": kw_score,
    }

    return r, total, dims


def _print_breakdown(label, ex_id, title_text, dims, score):
    print(f"\n{'='*70}")
    print(f"  {label}  |  {ex_id}  |  SCORE = {score:.2f}")
    print(f"  title ({len(title_text)} chars): {title_text[:100]}...")
    print(f"{'='*70}")
    print(f"  TITLE  brand={dims['title_has_brand']}  model={dims['title_has_model_or_line']}  "
          f"specs={dims['title_has_key_specs']}  length_ok={dims['title_length_ok']}  "
          f"no_spam={dims['title_avoids_spam']}   => weighted {dims['w_title']:.3f}")
    print(f"  DESC   completeness={dims['description_completeness']}  "
          f"structure={dims['description_structure']}  "
          f"buyer_qs={dims['description_answers_buyer_qs']}   => weighted {dims['w_desc']:.3f}")
    print(f"  ATTRS  coverage={dims['attributes_coverage']}   => weighted {dims['w_attr']:.3f}")
    print(f"  KW     uses_trending={dims['uses_relevant_trending_keywords']}   => weighted {dims['w_kw']:.3f}")
    print(f"  REASONING: {dims['reasoning']}")
    print(f"  TOP FIX:   {dims['top_improvement']}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--gold-only", action="store_true", help="Skip degraded runs")
    args = parser.parse_args()

    configure_default_lm()
    judge = ListingJudge()

    examples = load_dataset()
    train, _, _ = split_dataset(examples)
    sample = train[:5]

    gold_rows = []
    degraded_rows = []

    for i, ex in enumerate(sample):
        ex_id = getattr(ex, "id", f"example_{i}")

        # --- Gold-self ---
        gold_pred = dspy.Prediction(
            title=ex.gold_title,
            description=ex.gold_description,
            attributes=ex.product_specs,
        )
        _, gs_score, gs_dims = _run_judge(judge, ex, gold_pred)
        gold_rows.append((ex_id, gs_score, gs_dims))
        _print_breakdown("GOLD-SELF", ex_id, ex.gold_title, gs_dims, gs_score)

        # --- Degraded ---
        if not args.gold_only:
            weak = degrade(ex, seed=i)
            degraded_pred = dspy.Prediction(
                title=weak["weak_title"],
                description=weak["weak_description"],
                attributes=weak["weak_attributes"],
            )
            _, ds_score, ds_dims = _run_judge(judge, ex, degraded_pred)
            degraded_rows.append((ex_id, ds_score, ds_dims))
            _print_breakdown("DEGRADED", ex_id, weak["weak_title"], ds_dims, ds_score)

    # --- Summary table ---
    print(f"\n\n{'='*70}")
    print("SUMMARY TABLE")
    print(f"{'='*70}")
    if args.gold_only:
        print(f"\n{'example_id':<20} {'gold-self':>10}")
        print("-" * 32)
        for ex_id, gs, _ in gold_rows:
            print(f"{str(ex_id):<20} {gs:>10.2f}")
        mean_gs = sum(r[1] for r in gold_rows) / len(gold_rows)
        print("-" * 32)
        print(f"{'MEAN':<20} {mean_gs:>10.2f}")
        print()
        print(f"  {'PASS' if mean_gs >= 0.80 else 'FAIL'}: gold-self mean >= 0.80")
    else:
        print(f"\n{'example_id':<20} {'gold-self':>10} {'degraded':>10} {'gap':>10}")
        print("-" * 54)
        for (ex_id, gs, _), (_, ds, _) in zip(gold_rows, degraded_rows):
            gap = gs - ds
            print(f"{str(ex_id):<20} {gs:>10.2f} {ds:>10.2f} {gap:>10.2f}")
        mean_gs = sum(r[1] for r in gold_rows) / len(gold_rows)
        mean_ds = sum(r[1] for r in degraded_rows) / len(degraded_rows)
        mean_gap = mean_gs - mean_ds
        print("-" * 54)
        print(f"{'MEAN':<20} {mean_gs:>10.2f} {mean_ds:>10.2f} {mean_gap:>10.2f}")
        print()
        checks = [
            ("gold-self mean >= 0.80", mean_gs >= 0.80),
            ("degraded mean <= 0.40", mean_ds <= 0.40),
            ("gap mean >= 0.40", mean_gap >= 0.40),
        ]
        all_pass = True
        for label, ok in checks:
            status = "PASS" if ok else "FAIL"
            print(f"  {status}: {label}")
            if not ok:
                all_pass = False
        print()
        print("OVERALL:", "PASS" if all_pass else "FAIL")
        return 0 if all_pass else 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
