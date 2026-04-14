import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "⊞" },
  { href: "/dashboard/products/new", label: "New Product", icon: "✦" },
];

export default function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b border-gray-100">
        <Link href="/dashboard" className="text-lg font-bold text-brand-600">
          Prompty
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3 py-3">
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <span aria-hidden="true">↩</span>
          Sign out
        </Link>
      </div>
    </aside>
  );
}
