// Server Component — no 'use client' needed for static shell
export default function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
      <div className="flex items-center gap-2">
        {/* Breadcrumb / page title injected by page */}
        <span className="text-sm text-gray-400">Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        {/* TODO: replace with real user avatar / dropdown */}
        <div
          aria-label="User menu"
          className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700"
        >
          U
        </div>
      </div>
    </header>
  );
}
