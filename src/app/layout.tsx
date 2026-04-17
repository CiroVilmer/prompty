import type { Metadata } from "next"
import { Google_Sans_Flex } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/i18n/LanguageContext"

const googleSansFlex = Google_Sans_Flex({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Prompty",
    template: "%s | Prompty",
  },
  description:
    "Prompty — AI-powered marketplace listing optimization. Turn weak product pages into data-backed listings built from real best sellers, trends, and platform rules.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    siteName: "Prompty",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={googleSansFlex.className}>
      <head>
        {/* Preload the loading screen video so it plays instantly */}
        <link rel="preload" as="video" href="/videos/logo_loading.mp4" />
        {/*
          Set body to black on initial paint — eliminates any flash of white
          before the fixed LoadingScreen overlay renders client-side.
        */}
        <style>{`body { background-color: #000; }`}</style>
      </head>
      <body className="antialiased bg-white"><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  )
}
