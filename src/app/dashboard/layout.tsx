import type { Metadata } from "next";
import DashboardMiniHeader from "@/components/layout/DashboardMiniHeader";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Shell for /dashboard/* (product flow, overview). Root layout sets body to #000
 * for the landing loading screen; this wrapper paints a light canvas so nested
 * routes are not transparent over that black base.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-gray-50 text-gray-900 antialiased">
      <DashboardMiniHeader />
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
        {children}
      </div>
    </div>
  );
}
