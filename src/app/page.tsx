import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { WarpBackground } from '@/registry/magicui/warp-background'

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ── HERO ── */}
        <WarpBackground
          className="min-h-screen"
          perspective={100}
          beamsPerSide={4}
          beamDuration={4}
          beamDelayMax={4}
          beamDelayMin={0.5}
          beamSize={5}
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-40 text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-slate-800/60 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="font-mono text-xs font-medium tracking-wider text-cyan-400">
                Powered by Claude (Anthropic) + DSPy
              </span>
            </div>

            {/* Headline */}
            <h1 className="max-w-4xl text-balance text-6xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-7xl">
              Listings optimizados{' '}
              <span className="text-cyan-400">para tus productos</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              Prompty analiza los mejores productos del mercado y transforma tus
              publicaciones en listings que venden. Texto, atributos, keywords e
              imágenes — todo optimizado con datos reales.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/demo"
                className="rounded-lg bg-cyan-400 px-7 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-400/20 transition-all hover:bg-cyan-300 hover:shadow-cyan-400/40"
              >
                Probá la demo
              </Link>
              <Link
                href="#como-funciona"
                className="rounded-lg border border-slate-600/60 bg-slate-800/50 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-slate-500 hover:bg-slate-700/50"
              >
                Cómo funciona
              </Link>
            </div>

            {/* ── Before / After comparison ── */}
            <div className="mt-16 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/60 shadow-2xl shadow-black/50 backdrop-blur-sm">
              {/* Header row */}
              <div className="flex items-center gap-3 border-b border-slate-700/50 px-5 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <span className="h-3 w-3 rounded-full bg-green-500/70" />
                </div>
                <span className="font-mono text-xs text-slate-500">
                  prompty — score de listing · categoría: zapatillas
                </span>
              </div>

              {/* Two-column compare */}
              <div className="grid grid-cols-2 divide-x divide-slate-700/50">
                {/* ── ANTES ── */}
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="font-mono text-xs font-semibold tracking-[0.15em] text-red-400">
                      ANTES
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-400 italic">
                    &ldquo;zapatilla deportiva cómoda buen precio varios talles
                    envío gratis&rdquo;
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {[
                      'Sin atributos completados',
                      'Sin keywords de búsqueda',
                      'Descripción vacía',
                      'Foto con fondo desordenado',
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-xs text-slate-500"
                      >
                        <span className="text-red-500">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Score bar */}
                  <div className="mt-5 border-t border-slate-700/40 pt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-mono">Score</span>
                      <span className="font-mono font-bold text-red-400">
                        0.23
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-700/60">
                      <div
                        className="h-1.5 rounded-full bg-red-500/70"
                        style={{ width: '23%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── DESPUÉS ── */}
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span className="font-mono text-xs font-semibold tracking-[0.15em] text-cyan-400">
                      DESPUÉS — PROMPTY
                    </span>
                  </div>

                  <p className="text-sm font-medium leading-relaxed text-white">
                    &ldquo;Zapatillas Running Adidas Galaxy 6 Hombre —
                    Amortiguación Cloudfoam, Suela de Goma Flexible&rdquo;
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {[
                      'Atributos completos (marca, talle, modelo)',
                      'Keywords de tendencia incluidas',
                      'Descripción con bullets de venta',
                      'Imagen con fondo blanco y specs',
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-xs text-slate-300"
                      >
                        <span className="text-cyan-400">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Score bar */}
                  <div className="mt-5 border-t border-slate-700/40 pt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-mono">Score</span>
                      <span className="font-mono font-bold text-cyan-400">
                        0.87
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-700/60">
                      <div
                        className="h-1.5 rounded-full bg-cyan-400"
                        style={{ width: '87%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer hint */}
              <div className="border-t border-slate-700/50 px-6 py-3 text-center">
                <span className="font-mono text-[11px] text-slate-600">
                  Cada optimización se entrena con los best sellers reales de la
                  categoría
                </span>
              </div>
            </div>
          </div>
        </WarpBackground>
      </main>
    </>
  )
}
