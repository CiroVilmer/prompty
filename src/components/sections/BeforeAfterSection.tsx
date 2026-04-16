'use client'

function MLNavbar({ searchText }: { searchText?: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 bg-[#fff159] px-3 py-2 sm:px-4 sm:py-2.5">
      <span className="shrink-0 text-xs font-extrabold tracking-tight text-[#333] sm:text-sm">
        mercado<span style={{ color: '#3483fa' }}>libre</span>
      </span>
      <div className="flex flex-1 items-center gap-2 rounded-sm border border-[#e8d800] bg-white px-2 py-1 sm:px-3 sm:py-1.5">
        <span className="flex-1 truncate text-xs text-gray-400">
          {searchText ?? 'Buscar en Mercado Libre'}
        </span>
        <svg viewBox="0 0 16 16" className="size-3 shrink-0 text-gray-400 sm:size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5l3 3" strokeLinecap="round" />
        </svg>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
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
        <svg key={i} viewBox="0 0 10 10" className="size-3 sm:size-3.5" fill={i < filled ? '#3483fa' : '#e5e7eb'}>
          <path d="M5 0l1.5 3.1 3.5.5-2.5 2.4.6 3.5L5 7.8 1.9 9.5l.6-3.5L0 3.6l3.5-.5z" />
        </svg>
      ))}
    </div>
  )
}

function BadListing() {
  return (
    <div className="flex flex-col">
      <MLNavbar searchText="macbook" />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-1.5 sm:px-5 sm:py-2">
        <p className="text-xs text-gray-400">Inicio &rsaquo; Computación</p>
      </div>

      {/* Product layout — stacked on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row">

        {/* Thumbnail strip — desktop only */}
        <div className="hidden sm:flex w-16 shrink-0 flex-col gap-2 border-r border-gray-100 p-3">
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

        {/* Main image */}
        <div className="flex w-full shrink-0 items-center justify-center border-b border-gray-100 bg-stone-100 p-4 sm:w-[42%] sm:border-b-0 sm:border-r sm:p-6">
          <div className="relative aspect-square w-full max-w-[180px] overflow-hidden rounded-lg sm:max-w-none">
            <div
              className="absolute inset-0 bg-stone-200"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-18deg, transparent, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 20px)',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/macbook-mock.png"
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-contain opacity-55"
              style={{ filter: 'contrast(0.75) brightness(0.8) saturate(0.4)', mixBlendMode: 'multiply' }}
            />
            <div className="absolute bottom-2 left-2 rounded bg-black/35 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
              Phone photo
            </div>
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-1 flex-col gap-2.5 p-4 sm:gap-3 sm:p-6">
          <p className="text-xs italic text-gray-300 sm:text-sm">Condition not specified</p>

          <h2 className="text-sm leading-snug text-gray-600 sm:text-base">
            used macbook works great selling to upgrade accepting trades open to offers free shipping
          </h2>

          <div className="flex items-center gap-2">
            <Stars filled={0} />
            <span className="text-xs text-gray-300 sm:text-sm">No ratings</span>
          </div>

          <div className="mt-1 space-y-0.5">
            <p className="text-2xl font-light text-[#333] sm:text-3xl">$ 1.150.000</p>
            <p className="text-xs text-[#3483fa] sm:text-sm">See payment methods</p>
          </div>

          <div>
            <p className="text-xs text-[#00a650] sm:text-sm">Free shipping</p>
            <p className="text-xs text-gray-400">Arrives in 5 to 7 business days</p>
          </div>

          <div className="mt-1 space-y-2 sm:mt-2">
            <button className="w-full rounded-lg border border-gray-200 bg-gray-100 py-2 text-xs text-gray-400 sm:py-2.5 sm:text-sm" tabIndex={-1}>
              Buy now
            </button>
            <button className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs text-gray-400 sm:py-2.5 sm:text-sm" tabIndex={-1}>
              Add to cart
            </button>
          </div>

          <p className="text-xs text-gray-400">Sold by juan_ventas2019</p>

          <div className="mt-1 border-t border-gray-100 pt-3 sm:mt-2 sm:pt-4">
            <p className="mb-2 text-xs font-medium text-gray-400 sm:mb-3 sm:text-sm">Main features</p>
            <div className="space-y-2">
              {['Brand', 'Model', 'Processor', 'RAM', 'Storage', 'Display'].map((label) => (
                <div key={label} className="flex items-center gap-2 sm:gap-3">
                  <span className="w-20 shrink-0 text-xs text-gray-400 sm:w-28 sm:text-sm">{label}</span>
                  <div className="h-3.5 flex-1 rounded bg-gray-100 sm:h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoodListing() {
  return (
    <div className="flex flex-col">
      <MLNavbar searchText='apple macbook air m2 13" 256gb' />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-1.5 sm:px-5 sm:py-2">
        <p className="text-xs" style={{ color: '#3483fa' }}>
          Inicio &rsaquo; Computación &rsaquo; Laptops &rsaquo; Apple
        </p>
      </div>

      {/* Product layout — stacked on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row">

        {/* Thumbnail strip — desktop only */}
        <div className="hidden sm:flex w-16 shrink-0 flex-col gap-2 border-r border-gray-100 p-3">
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

        {/* Main image */}
        <div className="flex w-full shrink-0 items-center justify-center border-b border-gray-100 bg-white p-4 sm:w-[42%] sm:border-b-0 sm:border-r sm:p-6">
          <div className="aspect-square w-full max-w-[180px] overflow-hidden rounded-lg bg-white sm:max-w-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/macbook-mock.png" alt="Apple MacBook Air M2" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-1 flex-col gap-2.5 p-4 sm:gap-3 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 sm:text-sm">New</span>
            <span className="text-xs text-gray-200 sm:text-sm">|</span>
            <span className="text-xs text-gray-500 sm:text-sm">+1,200 sold</span>
          </div>

          <h2 className="text-sm font-medium leading-snug text-[#333] sm:text-base">
            Apple MacBook Air 13.6&quot; M2 Chip 8-Core — 8GB RAM 256GB SSD — Space Gray
          </h2>

          <div className="flex items-center gap-2">
            <Stars filled={5} />
            <span className="text-xs sm:text-sm" style={{ color: '#3483fa' }}>4.9</span>
            <span className="text-xs text-gray-400 sm:text-sm">(2.847)</span>
          </div>

          <div className="mt-1 space-y-0.5">
            <p className="text-xs text-gray-400 line-through sm:text-sm">$ 1.349.999</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-light text-[#333] sm:text-3xl">$ 949.999</p>
              <span className="text-sm font-semibold sm:text-base" style={{ color: '#00a650' }}>30% OFF</span>
            </div>
            <p className="text-xs text-gray-500 sm:text-sm">
              in 12 × <strong>$ 79.166</strong> interest-free
            </p>
            <p className="text-xs" style={{ color: '#3483fa' }}>See payment methods</p>
          </div>

          <div>
            <p className="text-xs font-medium sm:text-sm" style={{ color: '#00a650' }}>✓ Free shipping · Full</p>
            <p className="text-xs sm:text-sm" style={{ color: '#00a650' }}>Arrives tomorrow</p>
          </div>

          <div className="mt-1 space-y-2 sm:mt-2">
            <button
              className="w-full rounded-lg py-2 text-xs font-semibold text-white sm:py-2.5 sm:text-sm"
              style={{ backgroundColor: '#3483fa' }}
              tabIndex={-1}
            >
              Buy now
            </button>
            <button
              className="w-full rounded-lg border py-2 text-xs font-semibold sm:py-2.5 sm:text-sm"
              style={{ borderColor: '#3483fa', color: '#3483fa' }}
              tabIndex={-1}
            >
              Add to cart
            </button>
          </div>

          <div className="mt-1 border-t border-gray-100 pt-3 sm:mt-2 sm:pt-4">
            <p className="mb-2 text-xs font-medium text-gray-600 sm:mb-3 sm:text-sm">Main features</p>
            <div className="space-y-2">
              {[
                ['Brand',     'Apple'],
                ['Model',     'MacBook Air M2'],
                ['Processor', 'Apple M2'],
                ['RAM',       '8 GB'],
                ['Storage',   '256 GB SSD'],
                ['Display',   '13.6" Liquid Retina'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center gap-2 sm:gap-3">
                  <span className="w-20 shrink-0 text-xs text-gray-400 sm:w-28 sm:text-sm">{label}</span>
                  <span className="text-xs font-medium text-[#333] sm:text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BeforeAfterSection() {
  return (
    <section id="antes-despues" className="w-full bg-[#f5f3f1]">
      <div className="mx-auto max-w-[1440px] px-6 py-16 sm:px-10 sm:py-28 lg:px-16 lg:py-32">

        {/* Section header */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-300/60 bg-white/70 px-4 py-1.5 text-xs font-medium tracking-wide text-gray-500 backdrop-blur-sm">
            Before &amp; after
          </span>
          <h2 className="max-w-2xl text-balance text-2xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Same product, different result
          </h2>
          <p className="max-w-xl text-sm text-gray-400 sm:text-lg">
            The difference between a listing that sells and one that goes unnoticed
          </p>
        </div>

        {/* Labels — stack on mobile, side-by-side on desktop */}
        <div className="mb-3 flex flex-col gap-1.5 sm:mb-4 sm:grid sm:grid-cols-2">
          <div className="flex items-center gap-2.5 pl-1">
            <span className="size-2 rounded-full bg-red-400 sm:size-2.5" />
            <span className="text-xs font-medium text-gray-500 sm:text-sm">Without Prompty</span>
          </div>
          <div className="flex items-center gap-2.5 pl-1">
            <span className="size-2 rounded-full bg-emerald-500 sm:size-2.5" />
            <span className="text-xs font-medium text-gray-500 sm:text-sm">With Prompty</span>
          </div>
        </div>

        {/* Comparison card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 shadow-2xl shadow-gray-900/10">
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2">
            <div className="bg-white"><BadListing /></div>
            <div className="bg-white"><GoodListing /></div>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-xs tracking-wide text-gray-400 sm:mt-8">
          Optimization trained on real category best sellers · DSPy MIPROv2
        </p>
      </div>
    </section>
  )
}
