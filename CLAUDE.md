# CLAUDE.md — Prompty Landing Page

## Project Overview

Prompty is a **prompt optimization and distribution platform** leveraging DSPy, targeted at the LATAM ecosystem (e-commerce, fintech, edtech). This project is the **marketing landing page** — a bright, clean, animation-rich website that presents the Listing Optimizer product.

The site is a **single-page landing** with 8 sections (Header → Hero → Problema → Antes/Después → Por Qué Prompty → Equipo → CTA → Footer). The tone is **bright, professional, and confident** — think modern SaaS with personality, not dark wizard mode.

---

## Tech Stack

| Layer | Tool | Purpose |
|---|---|---|
| Framework | **Next.js 14+** (App Router) | SSR, routing, performance |
| Language | **TypeScript** | Type safety |
| Styling | **Tailwind CSS 3** | Utility-first styling |
| UI Components | **Aceternity UI** (shadcn registry) | Pre-built animated components (`compare`, `navbar`, `hero-sections`, `background-grid`, `animated-tooltip`, `footer`) |
| UI Components | **ReactBits** | Additional animated components (`curved-loop` text, `border-glow` cards, `chroma-grid`, `beams` background) |
| Scroll Animation | **GSAP + ScrollTrigger** | Timeline-based scroll-driven animations, pinned sections, scrubbed sequences |
| Smooth Scroll | **Lenis** | Buttery smooth scroll normalization |
| Component Animation | **Framer Motion** | Hover states, enter/exit, springs, layout animations (also powers Aceternity internals) |
| Package Manager | **pnpm** | Fast, disk-efficient |
| Deployment | **Vercel** | Edge-optimized hosting |

### Aceternity UI Setup

Components are installed via the shadcn CLI from Aceternity's registry:

```bash
# shadcn config (components.json) must include:
"registries": {
  "@aceternity": "https://ui.aceternity.com/registry/{name}.json"
}

# Install a component:
pnpm dlx shadcn@latest add @aceternity/compare
pnpm dlx shadcn@latest add @aceternity/background-beams
# etc.
```

Components land in `components/ui/` and are fully customizable source code (not a dependency).

---

## Architecture & File Structure

```
prompty-web/
├── public/
│   ├── fonts/                # Self-hosted display + body fonts (WOFF2)
│   ├── images/               # Product screenshots, team photos, before/after mockups
│   ├── icons/                # SVG icons
│   └── og-image.png          # Social preview
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout — Lenis provider, fonts, metadata
│   │   ├── page.tsx          # Home — composes all sections in order
│   │   └── globals.css       # Tailwind directives, CSS vars, custom props
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Aceternity resizable-navbar style
│   │   │   ├── Footer.tsx          # Aceternity centered-with-logo style
│   │   │   └── LenisProvider.tsx   # Smooth scroll wrapper
│   │   ├── sections/               # Full-width landing sections
│   │   │   ├── Hero.tsx
│   │   │   ├── Problem.tsx
│   │   │   ├── BeforeAfter.tsx
│   │   │   ├── WhyPrompty.tsx
│   │   │   ├── Team.tsx
│   │   │   └── CTAFinal.tsx
│   │   ├── ui/                     # Aceternity + ReactBits + custom primitives
│   │   │   ├── compare.tsx         # Aceternity Compare (before/after slider)
│   │   │   ├── background-grid.tsx # Aceternity background-grid-with-dots
│   │   │   ├── resizable-navbar.tsx
│   │   │   ├── animated-tooltip.tsx
│   │   │   ├── border-glow.tsx     # ReactBits border-glow
│   │   │   ├── chroma-grid.tsx     # ReactBits chroma-grid
│   │   │   ├── beams.tsx           # ReactBits beams background
│   │   │   ├── curved-loop.tsx     # ReactBits curved-loop text
│   │   │   ├── Button.tsx
│   │   │   └── Badge.tsx
│   │   └── animations/
│   │       ├── ScrollReveal.tsx    # GSAP ScrollTrigger wrapper
│   │       ├── TextSplit.tsx       # Character/word split entrance
│   │       ├── CountUp.tsx         # Animated number counter
│   │       └── StaggerChildren.tsx # Staggered child entrance
│   ├── hooks/
│   │   ├── useGSAP.ts             # GSAP context + cleanup
│   │   ├── useLenis.ts            # Access Lenis instance
│   │   └── useMediaQuery.ts       # Responsive / reduced-motion
│   ├── lib/
│   │   ├── gsap-register.ts       # Register GSAP plugins once
│   │   ├── animations.ts          # Shared presets (durations, easings, staggers)
│   │   ├── constants.ts           # Brand tokens, breakpoints
│   │   └── utils.ts               # cn() helper (clsx + twMerge)
│   └── types/
│       └── index.ts
├── tailwind.config.ts
├── components.json                  # shadcn + Aceternity registry config
├── next.config.mjs
├── tsconfig.json
├── package.json
└── CLAUDE.md
```

---

## Visual Identity & Design Tokens — BRIGHT THEME

### Color Palette

```css
:root {
  /* Backgrounds */
  --color-bg:            #FFFFFF;       /* Main background — pure white */
  --color-bg-soft:       #F8F9FC;       /* Alternate section background — off-white blue */
  --color-bg-muted:      #F1F3F8;       /* Cards, elevated surfaces */

  /* Brand Primary */
  --color-primary:       #7B2FF2;       /* Prompty purple — buttons, accents, links */
  --color-primary-dark:  #5A1DB8;       /* Hover / pressed state */
  --color-primary-light: #EDE5FF;       /* Light purple tint — badges, highlights */
  --color-primary-glow:  rgba(123, 47, 242, 0.12); /* Subtle glow on white */

  /* Brand Secondary */
  --color-accent:        #FBBF24;       /* Amber — sparkle accents, star ratings */
  --color-green:         #22C55E;       /* Success / improvement indicators */

  /* Text */
  --color-text:          #1A1A2E;       /* Primary text — near-black with blue tint */
  --color-text-secondary:#6B7280;       /* Secondary / muted text */
  --color-text-tertiary: #9CA3AF;       /* Placeholder, disabled */

  /* Borders & Dividers */
  --color-border:        #E5E7EB;       /* Default border */
  --color-border-hover:  #D1D5DB;       /* Hover border */

  /* Semantic */
  --color-before:        #FEE2E2;       /* Red-tinted — "before" state */
  --color-before-text:   #DC2626;
  --color-after:         #DCFCE7;       /* Green-tinted — "after" state */
  --color-after-text:    #16A34A;
}
```

### Typography

- **Display / Headings:** Bold, modern, slightly rounded. Candidates: `Plus Jakarta Sans 700/800`, `Cabinet Grotesk Bold`, `Satoshi Black`. Must feel confident and approachable — NOT playful/bubbly (that's the brand logo only).
- **Body:** Same family at regular weight, or a clean geometric sans. Candidates: `Plus Jakarta Sans 400/500`, `General Sans`, `Satoshi Regular`.
- **Code / Mono:** `JetBrains Mono` or `Fira Code` — for listing examples, pipeline labels.
- **Logo:** "PROMPTY" retains its bubbly cream retro-sticker lettering — this is an image/SVG asset, not a web font.

### Tone & Mood

- **Bright, airy, trustworthy** — lots of white space, clean grid, light shadows
- **Purple as the power color** — used sparingly for CTAs, active states, key accents
- **Data-driven confidence** — numbers, scores, comparisons front and center
- **LATAM SaaS aesthetic** — modern, professional, not Silicon Valley minimal-bland

---

## Section-by-Section Spec

### 0. HEADER (Navbar)

**Layout:** Left: "Nosotros" link | Center: Prompty logo (SVG) | Right: "Probar demo" button
**Component:** Aceternity `resizable-navbar` — shrinks/shadows on scroll
**Reference:** `https://ui.aceternity.com/components/resizable-navbar`
**Behavior:** Sticky top. Transparent on hero, becomes `bg-white/80 backdrop-blur` on scroll. Purple CTA button always visible.

---

### 1. HERO

**Copy:**
- Título: `"Listings optimizados para tus productos"`
- Subtítulo: `"Prompty analiza los mejores productos del mercado y transforma tus publicaciones en listings que venden. Texto, atributos, keywords e imágenes — todo optimizado con datos reales."`
- Botón primario: `"Probá la demo"` (purple, solid)
- Botón secundario: `"Cómo funciona"` (outlined, scrolls to Pipeline section)

**Components:**
- Background: Aceternity `background-grid-with-dots` (light variant — gray dots on white)
- Text animation: ReactBits `curved-loop` on a keyword (e.g., "optimizados" curves/loops)
- Layout inspo: Aceternity `hero-sections` centered layout

**Animation:**
- Title: word-by-word stagger reveal (GSAP or Framer Motion `whileInView`)
- Subtitle: fade up with slight delay
- Buttons: fade up last, slight spring
- Background grid: subtle parallax drift on scroll (GSAP scrub)

**Reference URLs:**
- `https://ui.aceternity.com/blocks/backgrounds/background-grid-with-dots`
- `https://ui.aceternity.com/blocks/hero-sections/centered-around-testimonials`
- `https://reactbits.dev/text-animations/curved-loop?curveAmount=70`
- `https://ui.aceternity.com/components/hero-sections-free`

---

### 2. EL PROBLEMA

**Copy:**
- Título: `"Publicar bien no debería ser tan difícil"`
- Texto: `"Millones de vendedores pierden ventas todos los días por listings mediocres. Títulos incompletos, atributos vacíos, descripciones genéricas y fotos que no comunican nada. El algoritmo los entierra y los compradores ni los ven. El problema no es falta de ganas — es falta de herramientas. Hasta ahora."`
- Botón 1: `"Cómo funciona Prompty"` → links to internal pipeline page (4 stages)
- Botón 2: `"Qué nos hace diferentes"` → links to internal DSPy explanation page

**Background:** `--color-bg-soft` (#F8F9FC) to visually separate from hero.

**Animation:**
- Title: GSAP ScrollTrigger entrance, slides up + fades
- Text paragraph: fade up with delay
- Key phrases highlighted (e.g., "listings mediocres", "El algoritmo los entierra") — could use a subtle text highlight sweep animation on scroll enter
- Buttons stagger in at the end

---

### 3. ANTES / DESPUÉS

**Copy:**
- Título: `"De listing invisible a publicación profesional"`
- Lado izquierdo — Etiqueta: `"Listing original"`
  - Ejemplo: `"zapatilla deportiva cómoda buen precio varios talles envío gratis"`
  - Notas: atributos vacíos, sin keywords, sin descripción, foto con fondo desordenado
- Lado derecho — Etiqueta: `"Optimizado por Prompty"`
  - Ejemplo: `"Zapatillas Running Adidas Galaxy 6 Hombre — Amortiguación Cloudfoam"`
  - Notas: atributos completos, keywords de tendencia, descripción con bullets, imagen profesional fondo blanco
- Texto debajo: `"Cada optimización se basa en los best sellers reales de la categoría, las tendencias de búsqueda actuales y los atributos que el marketplace exige."`

**Component:** Aceternity `compare` — drag/slide before-after comparison
**Reference:** `https://ui.aceternity.com/components/compare`

**Animation:**
- Section title: scroll-triggered entrance
- Compare component: fades in, slider starts at 30% (mostly showing "before") then auto-animates to 70% once in view, inviting the user to drag
- Bottom text: fade up after compare is visible

**Visual Design Notes:**
- "Before" side: slightly desaturated, messy photo, red-tinted badges for missing attributes
- "After" side: crisp, professional photo, green-tinted badges for completed attributes, score badge
- The compare slider divider line should be `--color-primary` purple

---

### 4. POR QUÉ PROMPTY

**Copy:**
- Título: `"No es un mejorador de títulos"`
- Card 1 — `"Basado en datos reales"`: `"Cada optimización se alimenta de los productos mejor rankeados de tu categoría. No adivinamos — consultamos el mercado."`
- Card 2 — `"End-to-end"`: `"Texto, atributos, keywords e imágenes. Entrás con un listing mediocre y salís con una publicación completa lista para competir."`
- Card 3 — `"Mejora medible"`: `"Te mostramos el score antes y después. Sabés exactamente cuánto mejoró tu listing y en qué dimensiones."`
- Card 4 — `"Cualquier categoría"`: `"Zapatillas, electrónica, indumentaria — el pipeline se calibra automáticamente con los datos de cada vertical."`

**Component:** ReactBits `border-glow` on each card
**Reference:** `https://reactbits.dev/components/border-glow`

**Layout:** 2×2 grid on desktop, single column on mobile. Each card has an icon (Lucide or custom SVG), title, and body text.

**Animation:**
- Cards stagger in from below (GSAP ScrollTrigger, `stagger: 0.12`)
- Border glow activates on hover (Framer Motion / ReactBits)
- Optional: each card icon has a subtle loop animation (pulse, rotate, float)

---

### 5. EL EQUIPO

**Copy:**
- Título: `"Quiénes somos"`
- Team member data: **TBD — needs names, roles, photos, short bios**

**Components:**
- ReactBits `chroma-grid` for team member photo grid
- Aceternity `animated-tooltip` on hover (shows role + bio)

**Reference:**
- `https://reactbits.dev/components/chroma-grid`
- `https://ui.aceternity.com/components/animated-tooltip`

**Animation:**
- Grid items stagger in
- Hover reveals tooltip with spring animation
- Photos may have a subtle color/chroma shift effect from the chroma-grid component

---

### 6. CTA FINAL

**Copy:**
- Título: `"Dejá de perder ventas por un mal listing"`
- Subtítulo: `"Probá Prompty y ve la diferencia en segundos."`
- Botón: `"Probar ahora"` (large, purple, prominent)

**Component:** ReactBits `beams` background
**Reference:** `https://reactbits.dev/backgrounds/beams`

**Animation:**
- Beams animate continuously in background (light purple / soft gradient beams on white)
- Title: line-by-line reveal (GSAP)
- Button: magnetic cursor effect + glow pulse on idle
- This section should feel like the climax — slightly more visual energy than the rest

---

### 7. FOOTER

**Component:** Aceternity `centered-with-logo` footer block
**Reference:** `https://ui.aceternity.com/blocks/footers/centered-with-logo`

**Content:** Prompty logo, copyright, social links, "Hecho en Argentina 🇦🇷" or similar. Minimal. Links to Nosotros, Demo, Contacto.

---

## Animation Architecture

### Guiding Principles

1. **GSAP owns the scroll.** All scroll-driven animations (pin, scrub, parallax, section transitions) go through GSAP ScrollTrigger. Don't use Intersection Observer or Framer Motion's `useScroll` for scroll-bound transforms.
2. **Framer Motion owns the components.** Hover states, tap feedback, enter/exit, spring physics, layout shifts. Also used internally by Aceternity components.
3. **Lenis owns the scroll feel.** Smooth interpolation. Must be wired to GSAP ScrollTrigger (see pattern below).
4. **Respect `prefers-reduced-motion`.** Graceful degradation to instant state changes.
5. **GPU-first transforms.** Only animate `transform` and `opacity`. Never `width`, `height`, `top`, `left`.
6. **Content-first.** Every section must be fully readable with zero animation.

### Lenis ↔ GSAP Integration

```tsx
// LenisProvider.tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
```

### useGSAP Hook

```tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useGSAP(callback: (ctx: gsap.Context) => void, deps: any[] = []) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => callback(ctx), ref.current);
    return () => ctx.revert();
  }, deps);
  return ref;
}
```

### Animation Taxonomy — Quick Reference

| I want to... | Use |
|---|---|
| Animate on scroll position | GSAP ScrollTrigger |
| Pin a section during scroll | GSAP ScrollTrigger `pin: true` |
| Stagger elements on scroll enter | GSAP ScrollTrigger + `stagger` |
| Smooth scroll feel | Lenis (global) |
| Hover / tap micro-interaction | Framer Motion `whileHover` / `whileTap` |
| Before/after comparison slider | Aceternity `compare` |
| Animated background grid | Aceternity `background-grid-with-dots` |
| Glowing card border on hover | ReactBits `border-glow` |
| Continuous beam background | ReactBits `beams` |
| Looping curved text | ReactBits `curved-loop` |
| Team photo grid effect | ReactBits `chroma-grid` |
| Tooltip on hover | Aceternity `animated-tooltip` |

---

## Performance Rules

1. **Lazy-load below-fold sections** with `next/dynamic` + `ssr: false` for heavy animation components.
2. **Preload critical fonts** via `next/font`.
3. **`will-change: transform`** only on actively animating elements — remove after.
4. **All images WebP/AVIF** via `next/image` with explicit dimensions.
5. **Target 60fps** on a 2020 mid-range laptop. Profile in Chrome DevTools.
6. **Split GSAP timelines per section.** Each section owns its ScrollTrigger lifecycle.
7. **Debounce resize** → `ScrollTrigger.refresh()`.

---

## Development Conventions

- **Components:** PascalCase. One per file.
- **Hooks:** `use` prefix. Always clean up GSAP contexts and Lenis in `useEffect` return.
- **Animations:** Reusable GSAP defaults in `lib/animations.ts`. No magic numbers in components.
- **Aceternity components:** Installed into `components/ui/` as source. Modify freely.
- **ReactBits components:** Copy source into `components/ui/`. Same convention.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `style:`, `perf:`).
- **Branching:** `main` → production. `dev` → staging.

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.2",
    "react": "^18.3",
    "react-dom": "^18.3",
    "gsap": "^3.12",
    "lenis": "^1.1",
    "framer-motion": "^11",
    "clsx": "^2.1",
    "tailwind-merge": "^2.3"
  },
  "devDependencies": {
    "typescript": "^5.4",
    "tailwindcss": "^3.4",
    "@types/react": "^18.3",
    "eslint": "^8",
    "prettier": "^3"
  }
}
```

> **Note on GSAP licensing:** Core + ScrollTrigger are free. Premium plugins (SplitText, DrawSVG) require GSAP Club. Check https://gsap.com/pricing/.

---

## Internal Pages (Future)

Two buttons in the "El Problema" section link to internal pages not yet built:

1. **Pipeline page** — "Cómo funciona Prompty" — explains the 4-stage pipeline: Auditor → Investigador → Generador de texto → Generador de imagen
2. **DSPy page** — "Qué nos hace diferentes" — explains how DSPy/MIPROv2 optimizes the prompts with real marketplace data

These are separate routes (`/como-funciona`, `/diferencia` or similar) — specs TBD.

---

## Pending / TBD

- [ ] **Team section data** — names, roles, photos, bios needed
- [ ] **Demo link** — where does "Probar demo" / "Probar ahora" point to?
- [ ] **Before/After mockup images** — need the actual product screenshots or we design them
- [ ] **Card icons** — which icon per "Por Qué Prompty" card (Lucide set or custom?)
- [ ] **Internal page specs** — Pipeline + DSPy explanation pages
- [ ] **Analytics** — Vercel Analytics, Plausible, or GA4?
- [ ] **SEO** — meta descriptions, structured data, sitemap

---

## Prompt Tip for Claude Sessions

> "I'm building Prompty's landing page — a bright, modern, animated Next.js site for a LATAM listing optimizer product. Stack: GSAP + ScrollTrigger for scroll animations, Lenis for smooth scroll, Framer Motion for component animations, Aceternity UI + ReactBits for pre-built animated components. Bright white + purple brand. See CLAUDE.md for the full section-by-section spec with exact copy and component references."