import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Overview",
};

/* ── Tool card image backgrounds ─────────────────────────────────────────────
   Change these paths to swap card backgrounds. Use any image in /public.
   Recommended size: 800×450px (16:9). Set to null to use the gradient fallback.
────────────────────────────────────────────────────────────────────────────── */
const TOOL_IMAGES = {
  demo: "https://g2u-wp-prod.s3-ap-southeast-2.amazonaws.com/wp-content/uploads/2025/01/shutterstock_2328203513.jpg",        // DEMO: Create Laptop Listing
  create: "https://computerworldmexico.com.mx/wp-content/uploads/2024/09/%C2%BFQue-aparatos-tecnologicos-son-los-mas-usados-hoy-en-dia-1.png",    // Create a listing (coming soon)
  more: null,                            // ¡More tools — no image needed
} as const

/* ── Stats ───────────────────────────────────────────────────────────────────── */

const STATS = [
  {
    label: "Products trained on",
    value: "+100",
    sub: "Real MELI listings",
    icon: (
      <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 10h16M2 6h16M2 14h10" />
      </svg>
    ),
  },
  {
    label: "Published products",
    value: null,
    badge: "MELI implementation soon",
    sub: "Mercado Libre integration",
    icon: (
      <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10l5 5 7-7" />
        <circle cx="10" cy="10" r="8" />
      </svg>
    ),
  },
  {
    label: "Avg. SEO score",
    value: "+96",
    sub: "Out of 100",
    icon: (
      <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L10 14.4l-4.8 2.4.9-5.3L2.2 7.7l5.4-.8z" />
      </svg>
    ),
  },
]

/* ── Tool cards ──────────────────────────────────────────────────────────────── */

const TOOLS = [
  {
    key: "demo",
    href: "/dashboard/products/new",
    title: "DEMO: Create Laptop Listing",
    description: "Create a fully optimized laptop listing powered by the DSPy pipeline.",
    badge: null,
    disabled: false,
    image: TOOL_IMAGES.demo,
    gradient: "from-violet-600/50 to-indigo-700/60",
    accent: "bg-violet-500",
  },
  {
    key: "create",
    href: null,
    title: "Create a Listing",
    description: "Any category, any product — full MELI optimization.",
    badge: "Coming soon",
    disabled: true,
    image: TOOL_IMAGES.create,
    gradient: "from-gray-700/70 to-gray-900/70",
    accent: "bg-gray-500",
  },
  {
    key: "more",
    href: null,
    title: "More tools coming",
    description: "¡More tools will be announced shortly!",
    badge: "Stay tuned",
    disabled: true,
    image: TOOL_IMAGES.more,
    gradient: "from-gray-100 to-gray-200",
    accent: "bg-gray-300",
    muted: true,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back — here&apos;s a summary of your Prompty workspace.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
              {s.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-gray-400">{s.label}</p>
              {s.value ? (
                <p className="mt-0.5 text-2xl font-bold tracking-tight text-gray-900">
                  {s.value}
                  {s.label === "Avg. SEO score" && (
                    <span className="ml-1 text-sm font-normal text-gray-400">/100</span>
                  )}
                </p>
              ) : (
                <span className="mt-1 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100">
                  {s.badge}
                </span>
              )}
              <p className="mt-0.5 text-[11px] text-gray-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tools */}
      <div>
        <h2 className="mb-5 text-lg font-bold text-gray-900">Tools</h2>

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
                {/* Background image or gradient */}
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

                {/* Content */}
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

                {/* Hover arrow — only on active cards */}
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
