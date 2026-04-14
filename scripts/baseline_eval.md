# Baseline Evaluation

## How to run

```bash
# Default: evaluate on val split (5 examples, ~20 LM calls)
python scripts/baseline_eval.py

# Evaluate on holdout split
python scripts/baseline_eval.py --split holdout

# Both splits
python scripts/baseline_eval.py --split both

# Quick smoke test (2 examples only)
python scripts/baseline_eval.py --limit 2
```

Requires `ANTHROPIC_API_KEY` in `.env` at the repo root.

## What it does

1. Loads the dataset and splits it (train 15 / val 5 / holdout 5, seed=42).
2. For each example in the chosen split, creates a degraded (weak) listing.
3. Runs **AuditorModule** on the weak listing, then scores it with `audit_quality_metric`.
4. Runs **TextGeneratorModule** using the auditor's diagnosis, then scores it with `listing_quality_metric`.
5. Writes JSON artifacts to `dspy_pipeline/compiled/`.

## Output JSON format

Each artifact (`baseline_auditor_val.json`, `baseline_generator_val.json`) has:

```json
{
  "module": "auditor | generator",
  "optimizer": null,
  "split": "val",
  "n_examples": 5,
  "metric_mean": 0.xx,
  "metric_median": 0.xx,
  "metric_stdev": 0.xx,
  "metric_min": 0.xx,
  "metric_max": 0.xx,
  "timestamp": "ISO-8601",
  "git_sha": "abc1234",
  "per_example": [
    {
      "example_id": "...",
      "score": 0.xx,
      "latency_s": 1.2,
      "input": { ... },
      "output": { ... },
      "reference": { ... }
    }
  ]
}
```

## Important

Commit the baseline JSON artifacts to git **before** running MIPROv2 optimization. These numbers are the "before" in the before/after comparison and must be reproducible.
