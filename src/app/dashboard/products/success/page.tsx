'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const MOCK_LISTING = {
  title:
    'Apple MacBook Air 13.6" Chip M2 8 Núcleos — 8GB RAM 256GB SSD — Gris Espacial — macOS Sonoma — Teclado Español Latino',
  price: '$ 949.999',
  category: 'Computación > Laptops y Accesorios > Laptops > Apple',
  mlId: 'MLA-1234567890',
  url: 'https://articulo.mercadolibre.com.ar/MLA-1234567890',
  image: '/macbook-mock.png',
  attributes: [
    ['Marca', 'Apple'],
    ['Modelo', 'MacBook Air M2'],
    ['Procesador', 'Apple M2'],
    ['RAM', '8 GB'],
    ['Almacenamiento', '256 GB SSD'],
  ] as [string, string][],
}

export default function ProductSuccessPage() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div
        className={`flex w-full max-w-2xl flex-col items-center gap-8 transition-all duration-700 ${
          show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Success icon */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50">
            <svg
              viewBox="0 0 24 24"
              className="size-8 text-emerald-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Your listing is live!
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-gray-500">
            Your product has been published to Mercado Libre and is now visible
            to buyers.
          </p>
        </div>

        {/* Listing summary card */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex gap-5 p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MOCK_LISTING.image}
              alt=""
              className="size-24 shrink-0 rounded-lg border border-gray-100 bg-gray-50 object-contain p-2"
            />
            <div className="flex flex-1 flex-col gap-1.5">
              <h2 className="text-sm font-medium leading-snug text-gray-900">
                {MOCK_LISTING.title}
              </h2>
              <p className="text-lg font-semibold text-gray-900">
                {MOCK_LISTING.price}
              </p>
              <p className="text-xs text-gray-400">{MOCK_LISTING.category}</p>
            </div>
          </div>

          {/* Attributes */}
          <div className="border-t border-gray-100 px-5 py-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
              {MOCK_LISTING.attributes.map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-[11px] text-gray-400">{label}</span>
                  <span className="text-xs font-medium text-gray-700">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Listing link */}
          <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
            <span className="text-xs text-gray-400">ID:</span>
            <span className="font-mono text-xs text-gray-600">
              {MOCK_LISTING.mlId}
            </span>
            <a
              href={MOCK_LISTING.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 text-xs font-medium text-[#3483fa] transition-colors hover:text-[#2968c8]"
            >
              View on Mercado Libre
              <svg
                viewBox="0 0 16 16"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 3h8v8M13 3L3 13" />
              </svg>
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <a
            href="/dashboard/products/new"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-gray-700 active:translate-y-px"
          >
            <span>✦</span>
            Create another listing
          </a>
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
