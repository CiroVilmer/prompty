import Link from "next/link";

export default function DashboardMiniHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center justify-between border-b border-gray-200/90 bg-white/90 px-4 backdrop-blur-md supports-backdrop-filter:bg-white/80 sm:h-12 sm:px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-gray-900 transition-colors hover:text-brand-700"
        >
          Prompty
        </Link>
        <span className="hidden h-3 w-px bg-gray-200 sm:block" aria-hidden />
        <span className="hidden text-xs font-medium text-gray-500 sm:inline">
          Workspace
        </span>
      </div>
      <Link
        href="/"
        className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-800"
      >
        Home
      </Link>
    </header>
  );
}
