# CLAUDE.md — Prompty

## Project Overview

Prompty is an **AI-powered Mercado Libre listing optimizer** built for the Anthropic × Kaszek Hackathon. It transforms weak, unstructured product descriptions into fully optimized MELI listings — title, description, attributes, keywords, and image guidance — using a four-stage AI pipeline powered by Claude and DSPy.

**What it is today:** A full-stack product with a marketing landing page, a product creation dashboard (chat-style UX), a FastAPI backend, and a DSPy prompt optimization pipeline.

**Target market:** LATAM e-commerce sellers (Argentina, Mercado Libre). MVP vertical: sneakers. Pipeline is category-agnostic.

---

## Tech Stack

### Frontend
| Layer | Tool | Version | Purpose |
|---|---|---|---|
| Framework | **Next.js** (App Router) | 16 | SSR, routing, performance |
| Language | **TypeScript** | 5.4 | Type safety |
| Styling | **Tailwind CSS** | v4 | Utility-first styling |
| Animations | **GSAP + ScrollTrigger** | 3.12 | Scroll-driven animations, pinned sections |
| Smooth Scroll | **Lenis** | 1.1 | Scroll normalization, wired to GSAP |
| Component Animation | **Framer Motion** | 11 | Hover, enter/exit, spring physics |
| UI Components | **Aceternity UI** | shadcn registry | `animated-tooltip`, `warp-background`, `highlighter` |
| UI Components | **ReactBits** | source-copied | `border-glow` |
| Package Manager | **pnpm** | — | Fast, disk-efficient |
| Deployment | **Vercel** | — | Edge-optimized frontend |

### Backend
| Layer | Tool | Version | Purpose |
|---|---|---|---|
| API Server | **FastAPI** | 0.110 | REST API, pipeline orchestration |
| Language | **Python** | 3.11+ | Backend runtime |
| LLM — Generation | **Claude Sonnet 4.6** | claude-sonnet-4-6 | Text generation, degrade, raw comparison |
| LLM — Judge | **Claude Opus 4.6** | claude-opus-4-6 | Quality scoring in `/compare` |
| Prompt Optimization | **DSPy + MIPROv2** | Stanford | Empirical prompt tuning |
| Marketplace Data | **Mercado Libre API** | — | Trends, top products, attributes |
| Raw LLM Client | **Anthropic Python SDK** | — | Direct Claude calls (degrade + raw comparison) |
| Deployment | **Uvicorn** | — | ASGI server |

---

## Architecture: Four-Stage Pipeline

```
User input (natural language or raw listing)
       │
       ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   ┌─────────────────┐
│   Auditor    │──▶│  Researcher  │──▶│  Text Generator  │──▶│ Image Prompter  │
│              │   │              │   │                  │   │                 │
│ DSPy Chain   │   │ MELI API:    │   │ DSPy Chain       │   │ DSPy Chain      │
│ of Thought   │   │ highlights,  │   │ of Thought       │   │ of Thought      │
│ on Audit     │   │ trends,      │   │ on Generate      │   │ on Analyze      │
│ Listing sig  │   │ attributes   │   │ Optimized sig    │   │ Image Patterns  │
└──────────────┘   └──────────────┘   └──────────────────┘   └─────────────────┘
                                               │
                            ─────────────────────────────────────
                            DSPy MIPROv2 Optimization Layer
                            Trained on 70+ real MELI products
                            Sneakers + Laptops verticals
                            Baseline → Optimized: 64.95 → 71.75
                            ─────────────────────────────────────
```

**Next.js proxies all requests to FastAPI.** The frontend never calls Claude or MELI directly.

---

## File Structure (Actual)

```
prompty/
├── src/                                  # Next.js 16 frontend
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page (composes all sections)
│   │   ├── (auth)/
│   │   │   ├── login/                    # Login page + LoginForm
│   │   │   └── register/                 # Register page + RegisterForm
│   │   ├── dashboard/                    # Main product dashboard
│   │   │   ├── layout.tsx                # Dashboard shell (sidebar, header)
│   │   │   ├── page.tsx                  # Overview with stats + quick actions
│   │   │   └── products/
│   │   │       ├── new/page.tsx          # ★ AI listing generator UI (main product)
│   │   │       └── success/page.tsx      # Post-publish confirmation
│   │   ├── dashboardv2/                  # Experimental dashboard (backend health check)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Shows backend status (real/mock mode)
│   │   │   ├── optimize/page.tsx
│   │   │   └── prompts/                  # Prompt management (experimental)
│   │   │       ├── page.tsx
│   │   │       ├── new/page.tsx
│   │   │       ├── [id]/page.tsx
│   │   │       └── PromptForm.tsx
│   │   └── api/                          # Next.js proxy routes → FastAPI
│   │       ├── audit/route.ts            # POST → /api/audit
│   │       ├── generate/route.ts         # POST → /api/generate
│   │       ├── compare/route.ts          # POST → /api/compare
│   │       ├── image-prompt/route.ts     # POST → /api/image-prompt
│   │       ├── degrade/route.ts          # POST → /api/degrade
│   │       ├── health/route.ts           # GET  → /api/health
│   │       ├── backend-health/route.ts   # GET  → /api/health (dashboard widget)
│   │       ├── optimize/route.ts         # POST → /api/optimize
│   │       └── prompts/
│   │           ├── route.ts              # GET/POST /api/prompts
│   │           └── [id]/route.ts         # GET/PUT/DELETE /api/prompts/:id
│   ├── components/
│   │   ├── landing/
│   │   │   ├── HeroSection.tsx           # Static hero (not used on live landing)
│   │   │   ├── HeroSectionDynamic.tsx    # ★ Active hero with loading gate
│   │   │   └── Navbar.tsx                # Landing navbar
│   │   ├── layout/
│   │   │   ├── DashboardMiniHeader.tsx   # Compact dashboard top bar
│   │   │   ├── Footer.tsx                # Layout footer
│   │   │   ├── Header.tsx                # General header
│   │   │   ├── LoadingScreen.tsx         # Intro animation overlay
│   │   │   └── Sidebar.tsx               # Dashboard sidebar
│   │   ├── sections/                     # Landing page sections
│   │   │   ├── BeforeAfterSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Problem.tsx
│   │   │   └── WhyPrompty.tsx
│   │   └── ui/                           # Primitives + installed component source
│   │       ├── animated-tooltip.tsx      # Aceternity
│   │       ├── border-glow.tsx           # ReactBits
│   │       ├── highlighter.tsx           # Aceternity
│   │       ├── warp-background.tsx       # Aceternity
│   │       ├── tooltip.tsx               # Radix-based tooltip
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Input.tsx
│   ├── lib/
│   │   ├── api-client.ts                 # Typed fetch wrapper (GET/POST/PUT/DELETE)
│   │   ├── fastapi.ts                    # proxyToFastAPI() helper
│   │   ├── auth.ts                       # Auth utilities
│   │   ├── db.ts                         # DB client
│   │   └── utils.ts                      # cn() helper
│   └── types/
│       └── index.ts                      # All TypeScript types (Prompt, User, API shapes)
│
├── apps/
│   └── api/                              # FastAPI backend
│       ├── main.py                       # App init, CORS, router registration
│       ├── schemas.py                    # Pydantic request/response models
│       ├── dependencies.py               # Module loading + mock fallback
│       ├── raw_llm.py                    # Direct Anthropic SDK calls (raw + degrade)
│       ├── mercadolibre.py               # MELI API (currently stubbed for notebooks)
│       └── routers/
│           ├── audit.py                  # POST /api/audit
│           ├── generate.py               # POST /api/generate (baseline DSPy)
│           ├── compare.py                # POST /api/compare (3-way + judge scoring)
│           ├── image.py                  # POST /api/image-prompt
│           └── degrade.py               # POST /api/degrade
│
├── dspy_pipeline/                        # DSPy modules + optimization
│   ├── signatures.py                     # 3 DSPy Signatures (Audit, Generate, Image)
│   ├── config.py                         # LM config (Generator: Sonnet, Judge: Opus)
│   ├── modules/
│   │   ├── auditor.py                    # AuditorModule (ChainOfThought)
│   │   ├── text_generator.py             # TextGeneratorModule (ChainOfThought)
│   │   ├── image_prompter.py             # ImagePrompterModule (ChainOfThought)
│   │   └── pipeline.py                   # End-to-end pipeline
│   ├── judges/
│   │   ├── listing_judge.py              # ListingJudge DSPy module
│   │   ├── audit_judge.py                # AuditJudge DSPy module
│   │   └── metric.py                     # listing_quality_metric() — weighted scoring
│   ├── optimize/
│   │   ├── common.py                     # Shared optimization utilities
│   │   └── optimize_generator.py         # MIPROv2 optimization script
│   ├── compiled/
│   │   ├── generator_v1.json             # ★ Active MIPROv2-compiled checkpoint
│   │   └── generator_v1.meta.json        # Optimization metadata
│   └── data/
│       ├── load.py                       # Dataset loader
│       └── degrade.py                    # Listing degradation for training data
│
├── hackaton/                             # Raw training data collection
│   ├── zapatillas/                       # Sneakers vertical (primary training set)
│   │   └── dataset_zapatillas_v2/        # Final: 70+ products, 22 brands
│   └── laptops/                          # Laptops vertical (secondary)
│       └── dataset_laptops_v2/
│
├── scripts/
│   ├── baseline_eval.py                  # Evaluate baseline vs optimized
│   ├── calibrate_judge.py                # Judge calibration
│   └── show_optimization_diff.py         # Show prompt diff after optimization
│
├── tests/
│   ├── test_data.py
│   ├── test_judges.py
│   └── test_modules.py
│
├── proxy.ts                              # Standalone proxy utility
├── package.json
├── tailwind.config.ts
├── components.json                       # shadcn + Aceternity registry config
├── next.config.mjs
└── tsconfig.json
```

---

## API Reference

### Next.js Proxy Routes (frontend-facing)
All Next.js API routes in `src/app/api/` simply forward requests to FastAPI via `proxyToFastAPI()` in `src/lib/fastapi.ts`. No business logic lives there.

### FastAPI Endpoints (`localhost:8000`)

| Method | Path | Description | DSPy Module |
|---|---|---|---|
| `POST` | `/api/audit` | Diagnose weak listing. Returns missing attributes, title/description issues, priority fixes. | `AuditorModule` (ChainOfThought) |
| `POST` | `/api/generate` | Generate optimized listing (title, description, attributes). Uses **baseline** (unoptimized) DSPy. | `TextGeneratorModule` |
| `POST` | `/api/compare` | Three-way comparison: raw naive LLM vs DSPy baseline vs MIPROv2-optimized. Scores all three with judge. | All + `ListingJudge` |
| `POST` | `/api/image-prompt` | Generate image brief from top-performer reference photos. | `ImagePrompterModule` |
| `POST` | `/api/degrade` | Take real product specs, output a deliberately bad listing (for demo "before" state). | Direct Claude call |
| `GET` | `/api/health` | Liveness probe. Returns mode (real/mock), init error, compiled generator name. | — |

### Important `/api/generate` vs `/api/compare` distinction
- **`/api/generate`** uses the **unoptimized baseline** DSPy program. The MIPROv2-compiled version showed no statistically significant improvement on holdout (baseline 0.739 vs optimized 0.718), so the baseline is the honest production artifact.
- **`/api/compare`** runs all three: (1) raw naive hardcoded "bad listing" response, (2) baseline DSPy, (3) MIPROv2-compiled DSPy — plus judge scoring. Used to demonstrate Prompty's value.

### Pydantic Schemas (`apps/api/schemas.py`)

```python
# Inputs
AuditRequest:    weak_title, weak_description, weak_attributes, category, trending_keywords
GenerateRequest: weak_title, weak_description, weak_attributes, category, trending_keywords, audit_diagnosis
CompareRequest:  same + audit_diagnosis (optional), include_scores (bool)
ImagePromptRequest: product_specs, category, reference_image_urls
DegradeRequest:  product_specs, category

# Outputs
AuditResponse:   missing_critical_attributes, title_issues, description_issues, missing_keywords, priority_fixes
GenerateResponse: title, description, attributes
CompareResponse: raw_llm, prompty_baseline, prompty_optimized (each: GeneratorOutput), judge_reasoning_optimized
ImagePromptResponse: image_generation_prompt, aspect_ratio, style_notes, generated_image_url
DegradeResponse: weak_title, weak_description
```

### Mock Fallback
Every endpoint has a hardcoded mock response. If DSPy modules fail to import (missing deps, missing API key), the backend silently falls back to mocks. Check `/api/health` → `mode: "mock"` to detect this.

---

## DSPy Pipeline Detail

### LM Configuration (`dspy_pipeline/config.py`)
- **Generator LM:** `claude-sonnet-4-6`, temp 0.7, max_tokens 4096
- **Judge LM:** `claude-opus-4-6`, temp 0.0, max_tokens 2048 — deterministic for scoring

### DSPy Signatures (`dspy_pipeline/signatures.py`)

| Signature | Inputs | Outputs |
|---|---|---|
| `AuditListing` | weak_title, weak_description, weak_attributes, category, known_trending_keywords | missing_critical_attributes, title_issues, description_issues, missing_keywords, priority_fixes |
| `GenerateOptimizedListing` | weak_title, weak_description, weak_attributes, trending_keywords, category, audit_diagnosis | title (50-180 chars), description (3-section), attributes (UPPER_SNAKE_CASE) |
| `AnalyzeImagePatterns` | product_specs, category, reference_image_urls | image_generation_prompt, aspect_ratio, style_notes |

All three modules use `dspy.ChainOfThought` internally.

### Quality Metric Weights (`dspy_pipeline/judges/metric.py`)
```
Attributes coverage:        35%
Trending keyword usage:     17%
Description completeness:   12%
Description answers buyer:  10%
Description structure:       8%
Title has brand:             5%
Title has model/line:        5%
Title has key specs:         4%
Title length OK:             2%
Title avoids spam:           2%
                           ────
Total:                     100%
```

### Optimization Results
| Split | Score |
|---|---|
| Baseline (val) | 64.95 |
| Optimized (val) | 69.30 |
| Optimized (holdout) | **71.75** |

Compiled checkpoint: `dspy_pipeline/compiled/generator_v1.json`

---

## Product UI Flow (`/dashboard/products/new`)

1. **Idle view** — Textarea + image upload + suggestion chips. User describes their product in natural language.
2. **Thinking view** — Animated chat-style activity log (6 simulated AI steps). Simultaneously fires real `/api/generate` call.
3. **Done view (split)** — Left: AI log with "Completed" badge. Right: Listing preview rendered as a Mercado Libre product page (yellow ML header, thumbnail strip, price, attributes).
4. **Compare view** — Left: optimized listing preview. Right: `ImprovementsPanel` with 7 before/after cards (title, category, attributes, price, DSPy vs hand-written, live MELI data, compare→publish).
5. **Publish overlay** — Multi-step progress animation (5 steps). On success, saves listing to `sessionStorage` and redirects to `/dashboard/products/success`.

---

## Landing Page Sections (`src/app/page.tsx`)

Order: `LoadingScreen` → `Navbar` → `HeroSectionDynamic` → `Problem` → `BeforeAfterSection` → `WhyPrompty` → `Footer`

- `LoadingScreen` plays intro animation, fires `onComplete` (triggers hero stagger) and `onExited` (unmounts overlay after GSAP tween finishes)
- Main content is `invisible` until hero is ready (prevents FOUC during loading)

---

## Mercado Libre API Integration (`apps/api/mercadolibre.py`)

**Active MELI endpoints:**
- `GET /highlights/MLA/category/{id}` — top-performing products (best-sellers proxy)
- `GET /products/{id}` — full product detail with attributes
- `GET /trends/MLA/{id}` — trending search keywords
- `GET /categories/{id}/attributes` — required/recommended attributes

**Blocked (insufficient permissions):**
- `GET /sites/MLA/search`, `GET /items/{id}`, `GET /reviews`

**Current state:** `mercadolibre.py` returns static keyword lists for the `notebooks` category. Real MELI API calls were used during data collection (see `hackaton/` datasets) but are not yet wired into the live request path.

---

## Environment Variables

| Variable | Where | Required | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | `.env.local` + backend `.env` | Yes | Claude API key |
| `MELI_ACCESS_TOKEN` | Backend `.env` | For live MELI data | Mercado Libre access token |
| `FASTAPI_URL` | `.env.local` | No (default: `http://localhost:8000`) | FastAPI backend URL |
| `NEXT_PUBLIC_APP_URL` | `.env.local` | No (default: `http://localhost:3000`) | Frontend base URL |
| `EXTRA_CORS_ORIGINS` | Backend env | No | Comma-separated extra CORS origins |

---

## Visual Identity & Design Tokens — BRIGHT THEME

### Color Palette

```css
:root {
  /* Backgrounds */
  --color-bg:            #FFFFFF;       /* Main background — pure white */
  --color-bg-soft:       #F8F9FC;       /* Alternate section background */
  --color-bg-muted:      #F1F3F8;       /* Cards, elevated surfaces */

  /* Brand Primary */
  --color-primary:       #7B2FF2;       /* Prompty purple — buttons, accents */
  --color-primary-dark:  #5A1DB8;       /* Hover / pressed state */
  --color-primary-light: #EDE5FF;       /* Light tint — badges, highlights */
  --color-primary-glow:  rgba(123, 47, 242, 0.12);

  /* Brand Secondary */
  --color-accent:        #FBBF24;       /* Amber — star ratings, sparkle */
  --color-green:         #22C55E;       /* Success / improvement */

  /* Text */
  --color-text:          #1A1A2E;       /* Primary — near-black, blue tint */
  --color-text-secondary:#6B7280;
  --color-text-tertiary: #9CA3AF;

  /* Borders */
  --color-border:        #E5E7EB;
  --color-border-hover:  #D1D5DB;

  /* Semantic */
  --color-before:        #FEE2E2;       /* Red-tinted — "before" state */
  --color-before-text:   #DC2626;
  --color-after:         #DCFCE7;       /* Green-tinted — "after" state */
  --color-after-text:    #16A34A;
}
```

Dashboard severity colors (used in `ImprovementsPanel`):
- **Critical:** rose-500 border, rose-50 background
- **High impact:** amber-500 border, amber-50 background
- **Improvement:** sky-500 border, sky-50 background

### Typography
- **Display / Headings:** `Plus Jakarta Sans 700/800`, `Cabinet Grotesk Bold`, or `Satoshi Black`
- **Body:** Same family regular/medium weight
- **Code / Mono:** `JetBrains Mono` or `Fira Code`
- **Logo:** Image/SVG asset — bubbly cream retro-sticker lettering, not a web font

---

## Animation Architecture

### Rules
1. **GSAP owns scroll.** All scroll-driven animations via GSAP ScrollTrigger. Not Framer Motion `useScroll`, not IntersectionObserver.
2. **Framer Motion owns components.** Hover, tap, enter/exit, spring physics.
3. **Lenis owns scroll feel.** Must be wired to GSAP ScrollTrigger (`lenis.on("scroll", ScrollTrigger.update)`).
4. **Respect `prefers-reduced-motion`.** Instant state changes as fallback.
5. **GPU-first.** Only animate `transform` and `opacity`. Never layout properties.
6. **GSAP in dashboard.** The `/dashboard/products/new` page uses GSAP directly for chat bubble entrance, idle→split transition, and compare panel reveal — no ScrollTrigger needed there.

### Lenis ↔ GSAP Integration

```tsx
// LenisProvider.tsx
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### Animation Taxonomy

| Task | Tool |
|---|---|
| Scroll-driven animation | GSAP ScrollTrigger |
| Pin section during scroll | GSAP `pin: true` |
| Chat bubble entrance | GSAP `fromTo` with stagger |
| Panel slide-in / fade-in | GSAP `fromTo` (opacity, y, scale) |
| Hover / tap | Framer Motion `whileHover` / `whileTap` |
| Glowing card border | ReactBits `border-glow` |
| Tooltip | Aceternity `animated-tooltip` |

---

## Performance Rules

1. **Lazy-load below-fold sections** with `next/dynamic` + `ssr: false`.
2. **Preload critical fonts** via `next/font`.
3. **`will-change: transform`** only on actively animating elements.
4. **All images WebP/AVIF** via `next/image` with explicit dimensions.
5. **Target 60fps** on a 2020 mid-range laptop.
6. **Split GSAP timelines per section.** Each section owns its lifecycle.

---

## Development Conventions

- **Components:** PascalCase, one per file.
- **Hooks:** `use` prefix. Clean up GSAP contexts and Lenis in `useEffect` return.
- **API calls from frontend:** Always via `apiClient` (`src/lib/api-client.ts`). Never raw `fetch` in components.
- **Next.js API routes:** Only `proxyToFastAPI()` — no business logic.
- **DSPy modules:** One module per file in `dspy_pipeline/modules/`. Always use `dspy.ChainOfThought` unless there's a specific reason not to.
- **Mock fallback:** Every FastAPI endpoint has a hardcoded `MOCK_*` constant. Never remove these.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `style:`, `perf:`).
- **Branching:** `main` → production. `dev` → staging.

---

## Aceternity UI Setup

```bash
# shadcn config (components.json) must include:
"registries": {
  "@aceternity": "https://ui.aceternity.com/registry/{name}.json"
}

# Install:
pnpm dlx shadcn@latest add @aceternity/animated-tooltip
pnpm dlx shadcn@latest add @aceternity/warp-background
```

Components land in `src/components/ui/` as source. Modify freely.

---

## Running the Project

```bash
# Frontend
pnpm install
pnpm dev           # http://localhost:3000

# Backend
pip install -r apps/api/requirements.txt
python -m uvicorn apps.api.main:app --reload --port 8000
# Interactive docs: http://localhost:8000/docs
```
