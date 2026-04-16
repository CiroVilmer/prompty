import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import Footer from "@/components/sections/Footer";

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
      <Navbar />
      {/* pt-24 clears the fixed navbar (py-4 outer + h-12 logo + buffer) */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-24 pb-8 sm:px-6 sm:pt-28">
        {children}
      </main>
      <Footer />
    </div>
  );
}
