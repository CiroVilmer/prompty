'use client'

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const TOOL_IMAGES = {
  demo: "https://g2u-wp-prod.s3-ap-southeast-2.amazonaws.com/wp-content/uploads/2025/01/shutterstock_2328203513.jpg",
  create: "https://computerworldmexico.com.mx/wp-content/uploads/2024/09/%C2%BFQue-aparatos-tecnologicos-son-los-mas-usados-hoy-en-dia-1.png",
  more: null,
} as const

const STAT_ICONS = [
  (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10h16M2 6h16M2 14h10" />
    </svg>
  ),
  (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l5 5 7-7" />
      <circle cx="10" cy="10" r="8" />
    </svg>
  ),
  (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L10 14.4l-4.8 2.4.9-5.3L2.2 7.7l5.4-.8z" />
    </svg>
  ),
]

const STAT_VALUES = ['+100', null, '+96']

export default function DashboardPage() {
  const { t } = useLanguage()
  const { overview } = t.dashboard

  const TOOLS = [
    {
      key: "demo",
      href: "/dashboard/products/new",
      title: overview.tools.cards[0].title,
      description: overview.tools.cards[0].description,
      badge: null,
      disabled: false,
      image: TOOL_IMAGES.demo,
      gradient: "from-violet-600/50 to-indigo-700/60",
      muted: false,
    },
    {
      key: "create",
      href: null,
      title: overview.tools.cards[1].title,
      description: overview.tools.cards[1].description,
      badge: overview.tools.cards[1].badge,
      disabled: true,
      image: TOOL_IMAGES.create,
      gradient: "from-gray-700/70 to-gray-900/70",
      muted: false,
    },
    {
      key: "more",
      href: null,
      title: overview.tools.cards[2].title,
      description: overview.tools.cards[2].description,
      badge: overview.tools.cards[2].stayTuned,
      disabled: true,
      image: TOOL_IMAGES.more,
      gradient: "from-gray-100 to-gray-200",
      muted: true,
    },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{overview.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{overview.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {overview.stats.map((s, i) => (
          <div
            key={s.label}
            className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
              {STAT_ICONS[i]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-gray-400">{s.label}</p>
              {STAT_VALUES[i] ? (
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-gray-900">
                  {STAT_VALUES[i]}
                  {i === 2 && (
                    <span className="ml-1 text-sm font-normal text-gray-400">/100</span>
                  )}
                </p>
              ) : (
                <span className="mt-1 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100">
                  {s.sub}
                </span>
              )}
              <p className="mt-0.5 text-[11px] text-gray-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tools */}
      <div>
        <h2 className="mb-5 text-lg font-bold text-gray-900">{overview.tools.title}</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const card = (
              <div
                className={`group relative flex h-90 flex-col justify-end overflow-hidden rounded-2xl border ${
                  tool.muted
                    ? "border-dashed border-gray-200"
                    : "border-gray-200 shadow-sm"
                } ${tool.disabled ? "cursor-default" : "cursor-pointer"}`}
              >
                {tool.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tool.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${tool.gradient}`} />
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient}`} />
                )}

                <div className="relative z-10 p-5">
                  {tool.badge && (
                    <span className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      tool.muted
                        ? "bg-gray-200 text-gray-500"
                        : "bg-white/20 text-white backdrop-blur-sm"
                    }`}>
                      {tool.badge}
                    </span>
                  )}
                  <h3 className={`text-[15px] font-bold leading-snug ${tool.muted ? "text-gray-400" : "text-white"}`}>
                    {tool.title}
                  </h3>
                  <p className={`mt-1 text-[12px] leading-relaxed ${tool.muted ? "text-gray-400" : "text-white/80"}`}>
                    {tool.description}
                  </p>
                </div>

                {!tool.disabled && (
                  <div className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5">
                    <svg viewBox="0 0 16 16" className="size-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </div>
                )}
              </div>
            )

            return tool.href && !tool.disabled ? (
              <Link key={tool.key} href={tool.href}>
                {card}
              </Link>
            ) : (
              <div key={tool.key}>{card}</div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
