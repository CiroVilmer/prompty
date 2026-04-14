'use client'

/* ─────────────────────────────────────────────────────────────────────────────
   BeforeAfterSection
   Two full-scale Mercado Libre product-page mockups side-by-side, separated
   by a 1 px divider. Uses /macbook-mock.png as the product being listed.
───────────────────────────────────────────────────────────────────────────── */

/* ── Shared ML UI primitives ─────────────────────────────────────────────── */

function MLNavbar({ searchText }: { searchText?: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 bg-[#fff159] px-4 py-2.5">
      {/* Logo */}
      <span className="shrink-0 text-sm font-extrabold tracking-tight text-[#333]">
        mercado
        <span style={{ color: '#3483fa' }}>libre</span>
      </span>

      {/* Search bar */}
      <div className="flex flex-1 items-center gap-2 rounded-sm border border-[#e8d800] bg-white px-3 py-1.5">
        <span className="flex-1 truncate text-xs text-gray-400">
          {searchText ?? 'Buscar en Mercado Libre'}
        </span>
        <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5l3 3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-3">
        <div className="size-4 rounded-full bg-[#333]/10" />
        <div className="size-4 rounded-full bg-[#333]/10" />
        <div className="h-4 w-5 rounded bg-[#333]/10" />
      </div>
    </div>
  )
}

function Stars({ filled = 5 }: { filled?: number }) {
  return (
    <div className="flex items-center gap-px">
      {[...Array(5)].map((_, i) => (
        <svg key={i} viewBox="0 0 10 10" className="size-3.5" fill={i < filled ? '#3483fa' : '#e5e7eb'}>
          <path d="M5 0l1.5 3.1 3.5.5-2.5 2.4.6 3.5L5 7.8 1.9 9.5l.6-3.5L0 3.6l3.5-.5z" />
        </svg>
      ))}
    </div>
  )
}

/* ── Bad listing (Sin Prompty) ────────────────────────────────────────────── */

function BadListing() {
  return (
    <div className="flex flex-col">
      <MLNavbar searchText="macbook" />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-2">
        <p className="text-xs text-gray-400">Inicio &rsaquo; Computación</p>
      </div>

      {/* Product layout */}
      <div className="flex gap-0">

        {/* Thumbnail strip */}
        <div className="flex w-16 shrink-0 flex-col gap-2 border-r border-gray-100 p-3">
          <div className="aspect-square w-full overflow-hidden rounded border-2 border-gray-300 bg-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/macbook-mock.png"
              alt=""
              className="h-full w-full object-contain opacity-50"
              style={{ filter: 'contrast(0.7) brightness(0.85) saturate(0.5)' }}
            />
          </div>
        </div>

        {/* Main image — bad photo */}
        <div className="flex w-[42%] shrink-0 items-center justify-center border-r border-gray-100 bg-stone-100 p-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            {/* messy background */}
            <div
              className="absolute inset-0 bg-stone-200"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-18deg, transparent, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 20px)',
              }}
            />
            {/* macbook, low quality */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/macbook-mock.png"
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-contain opacity-55"
              style={{ filter: 'contrast(0.75) brightness(0.8) saturate(0.4)', mixBlendMode: 'multiply' }}
            />
            {/* Label */}
            <div className="absolute bottom-2 left-2 rounded bg-black/35 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
              Foto de celular
            </div>
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-1 flex-col gap-3 p-6">
          {/* Condition — missing */}
          <p className="text-sm italic text-gray-300">Condición no especificada</p>

          {/* Title — generic & keyword-stuffed */}
          <h2 className="text-base leading-snug text-gray-600">
            macbook usada anda perfecto vendo por upgrade acepto permuta escucho ofertas envio
          </h2>

          {/* No reviews */}
          <div className="flex items-center gap-2">
            <Stars filled={0} />
            <span className="text-sm text-gray-300">Sin calificaciones</span>
          </div>

          {/* Price — no discount */}
          <div className="mt-1 space-y-0.5">
            <p className="text-3xl font-light text-[#333]">$ 1.150.000</p>
            <p className="text-sm text-[#3483fa] cursor-pointer">Ver medios de pago</p>
          </div>

          {/* Shipping — basic */}
          <div>
            <p className="text-sm text-[#00a650]">Envío gratis</p>
            <p className="text-xs text-gray-400">Llega en 5 a 7 días hábiles</p>
          </div>

          {/* Buy buttons — muted */}
          <div className="mt-2 space-y-2">
            <button
              className="w-full rounded-lg border border-gray-200 bg-gray-100 py-2.5 text-sm text-gray-400"
              tabIndex={-1}
            >
              Comprar ahora
            </button>
            <button
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-sm text-gray-400"
              tabIndex={-1}
            >
              Agregar al carrito
            </button>
          </div>

          {/* Seller */}
          <p className="text-xs text-gray-400">Vendido por juan_ventas2019</p>

          {/* Attributes — empty */}
          <div className="mt-2 border-t border-gray-100 pt-4">
            <p className="mb-3 text-sm font-medium text-gray-400">Características principales</p>
            <div className="space-y-2.5">
              {['Marca', 'Modelo', 'Procesador', 'RAM', 'Almacenamiento', 'Pantalla'].map((label) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm text-gray-400">{label}</span>
                  <div className="h-4 flex-1 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Good listing (Con Prompty) ───────────────────────────────────────────── */

function GoodListing() {
  return (
    <div className="flex flex-col">
      <MLNavbar searchText='apple macbook air m2 13" 256gb' />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-2">
        <p className="text-xs" style={{ color: '#3483fa' }}>
          Inicio &rsaquo; Computación &rsaquo; Laptops y Accesorios &rsaquo; Laptops &rsaquo; Apple
        </p>
      </div>

      {/* Product layout */}
      <div className="flex gap-0">

        {/* Thumbnail strip */}
        <div className="flex w-16 shrink-0 flex-col gap-2 border-r border-gray-100 p-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square w-full overflow-hidden rounded border-2 bg-gray-50"
              style={{ borderColor: i === 0 ? '#3483fa' : '#e5e7eb' }}
            >
              {i === 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/macbook-mock.png" alt="" className="h-full w-full object-contain" />
              )}
            </div>
          ))}
        </div>

        {/* Main image — clean studio */}
        <div className="flex w-[42%] shrink-0 items-center justify-center border-r border-gray-100 bg-white p-6">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/macbook-mock.png"
              alt="Apple MacBook Air M2"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-1 flex-col gap-3 p-6">
          {/* Condition + sales */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Nuevo</span>
            <span className="text-sm text-gray-200">|</span>
            <span className="text-sm text-gray-500">+1.200 vendidos</span>
          </div>

          {/* Title — optimized */}
          <h2 className="text-base font-medium leading-snug text-[#333]">
            Apple MacBook Air 13.6&quot; Chip M2 8 Núcleos — 8GB RAM 256GB SSD — Gris Espacial — macOS Sonoma — Teclado Español Latino
          </h2>

          {/* Reviews */}
          <div className="flex items-center gap-2">
            <Stars filled={5} />
            <span className="text-sm" style={{ color: '#3483fa' }}>4.9</span>
            <span className="text-sm text-gray-400">(2.847 opiniones)</span>
          </div>

          {/* Price */}
          <div className="mt-1 space-y-0.5">
            <p className="text-sm text-gray-400 line-through">$ 1.349.999</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-light text-[#333]">$ 949.999</p>
              <span className="text-base font-semibold" style={{ color: '#00a650' }}>30% OFF</span>
            </div>
            <p className="text-sm text-gray-500">
              en 12 cuotas de <strong>$ 79.166</strong> sin interés
            </p>
            <p className="text-xs" style={{ color: '#3483fa' }}>Ver los medios de pago</p>
          </div>

          {/* Shipping */}
          <div>
            <p className="text-sm font-medium" style={{ color: '#00a650' }}>✓ Envío gratis · Full</p>
            <p className="text-sm" style={{ color: '#00a650' }}>Llega mañana</p>
          </div>

          {/* Buy buttons */}
          <div className="mt-2 space-y-2">
            <button
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#3483fa' }}
              tabIndex={-1}
            >
              Comprar ahora
            </button>
            <button
              className="w-full rounded-lg border py-2.5 text-sm font-semibold"
              style={{ borderColor: '#3483fa', color: '#3483fa' }}
              tabIndex={-1}
            >
              Agregar al carrito
            </button>
          </div>

          {/* Attributes — filled */}
          <div className="mt-2 border-t border-gray-100 pt-4">
            <p className="mb-3 text-sm font-medium text-gray-600">Características principales</p>
            <div className="space-y-2.5">
              {[
                ['Marca',          'Apple'],
                ['Modelo',         'MacBook Air M2'],
                ['Procesador',     'Apple M2'],
                ['RAM',            '8 GB'],
                ['Almacenamiento', '256 GB SSD'],
                ['Pantalla',       '13.6" Liquid Retina IPS'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm text-gray-400">{label}</span>
                  <span className="text-sm font-medium text-[#333]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Section ──────────────────────────────────────────────────────────────── */

export default function BeforeAfterSection() {
  return (
    <section id="antes-despues" className="w-full bg-[#f5f3f1]">
      <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-32">

        {/* Section header */}
        <div className="mb-14 flex flex-col items-center gap-3 text-center sm:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-300/60 bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wide text-gray-500 backdrop-blur-sm">
            Antes y después
          </span>
          <h2 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Mismo producto, distinto resultado
          </h2>
          <p className="max-w-xl text-base text-gray-400 sm:text-lg">
            La diferencia entre un listing que vende y uno que pasa desapercibido
          </p>
        </div>

        {/* Labels */}
        <div className="mb-4 grid grid-cols-2">
          <div className="flex items-center gap-2.5 pl-1">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="text-sm font-medium text-gray-500">Sin Prompty</span>
          </div>
          <div className="flex items-center gap-2.5 pl-1">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-gray-500">Con Prompty</span>
          </div>
        </div>

        {/* Comparison card — 1 px divider via gap-px + gray bg */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 shadow-2xl shadow-gray-900/10">
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2">
            <div className="bg-white">
              <BadListing />
            </div>
            <div className="bg-white">
              <GoodListing />
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center font-mono text-xs tracking-wide text-gray-400">
          Optimización entrenada con los best sellers reales de la categoría · DSPy MIPROv2
        </p>
      </div>
    </section>
  )
}
