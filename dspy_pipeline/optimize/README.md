# Optimization

## Workflow

1. **Dry run** — check cost estimate:
   ```bash
   python -m dspy_pipeline.optimize.optimize_generator --dry-run
   ```

2. **Run optimization**:
   ```bash
   python -m dspy_pipeline.optimize.optimize_generator --confirm
   ```

   Optional flags:
   - `--preset {light,medium}` (default: light)
   - `--max-bootstrapped N` (default: 2)
   - `--max-labeled N` (default: 2)
   - `--num-threads N` (default: 4)

## Output

Each run produces two files in `dspy_pipeline/compiled/`:

- `generator_vN.json` — the compiled DSPy program (load with `module.load(path)`)
- `generator_vN.meta.json` — metadata (baseline score, optimized score, delta, config)

## Loading at serve time

```python
from dspy_pipeline.modules.text_generator import TextGeneratorModule

gen = TextGeneratorModule()
gen.load("dspy_pipeline/compiled/generator_v1.json")
```

## Rules

- **NEVER re-optimize at serve time.** Compiled JSON is committed to git.
- If you want to re-run optimization, commit or delete existing `generator_v*.json` first to avoid confusion about which version is "current".
- The latest `generator_v*.json` is the production artifact.

## Viewing results

```bash
python scripts/show_optimization_diff.py              # latest version
python scripts/show_optimization_diff.py --version 1  # specific version
```

Shows side-by-side baseline vs optimized output on the holdout set.
