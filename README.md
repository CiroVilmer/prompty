# Prompty

**Prompty** is a prompt optimisation and distribution platform. Build, test, and automatically optimise prompts for any LLM, then distribute them across your team with full version control.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Runtime | React 19.2 |
| Deploy | Vercel |

---

## Getting started

### 1. Clone & install

```bash
git clone https://github.com/your-org/prompty.git
cd prompty
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in each value:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL (or SQLite) connection string |
| `AUTH_SECRET` | Random 32-byte secret — run `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | Anthropic key for the `/api/optimize` route |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app (`http://localhost:3000` locally) |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Turbopack is the default bundler in Next.js 16 — no extra flags needed.

### 4. Type-check

```bash
npm run type-check
```

---

## Folder structure

```
prompty/
├── src/
│   ├── app/
│   │   ├── layout.tsx              Root layout — fonts & metadata
│   │   ├── page.tsx                Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx      Sign-in page
│   │   │   └── register/page.tsx   Registration page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          Dashboard shell (sidebar + header)
│   │   │   ├── page.tsx            Overview / stats
│   │   │   └── prompts/
│   │   │       ├── page.tsx        List prompts
│   │   │       ├── new/page.tsx    Create a prompt
│   │   │       └── [id]/page.tsx   Edit / view a prompt
│   │   └── api/
│   │       ├── prompts/route.ts        GET list, POST create
│   │       ├── prompts/[id]/route.ts   GET, PUT, DELETE single
│   │       ├── optimize/route.ts       POST — run optimisation
│   │       └── health/route.ts         GET — liveness probe
│   ├── lib/
│   │   ├── db.ts           Database client placeholder (Prisma / Drizzle)
│   │   ├── auth.ts         Auth helpers — token creation & verification
│   │   └── api-client.ts   Typed fetch wrapper for internal API calls
│   ├── components/
│   │   ├── ui/             Button, Input, Card
│   │   └── layout/         Header, Sidebar, Footer
│   └── types/
│       └── index.ts        Shared TypeScript types
├── proxy.ts                Next.js 16 proxy (replaces middleware.ts)
├── next.config.ts          Next.js config — reactCompiler enabled
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## API endpoints

### Prompts

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/prompts` | List all prompts |
| `POST` | `/api/prompts` | Create a new prompt |
| `GET` | `/api/prompts/:id` | Get a single prompt |
| `PUT` | `/api/prompts/:id` | Update a prompt |
| `DELETE` | `/api/prompts/:id` | Delete a prompt |

**POST / PUT body**

```json
{
  "title": "My prompt",
  "content": "You are a helpful assistant that…",
  "model": "claude-sonnet-4-6",
  "variables": { "tone": "formal" },
  "tags": ["summarisation", "rag"]
}
```

### Optimisation

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/optimize` | Run DSPy optimisation on a prompt |

**POST body**

```json
{
  "promptId": "uuid",
  "model": "claude-sonnet-4-6",
  "examples": [
    { "input": "Summarise this article…", "expectedOutput": "…" }
  ]
}
```

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Liveness probe — returns `{ status: "ok" }` |

---

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Add the environment variables from `.env.example` in the Vercel project settings.
4. Deploy — Vercel auto-detects Next.js and uses Turbopack.

---

## Next steps

- [ ] Wire up a real database (Prisma or Drizzle) in `src/lib/db.ts`
- [ ] Implement auth (Auth.js v5 / Lucia / Clerk) in `src/lib/auth.ts`
- [ ] Integrate Anthropic SDK in `/api/optimize` for real optimisation
- [ ] Add DSPy micro-service for multi-step teleprompter optimisation
- [ ] Add prompt versioning and diff view
