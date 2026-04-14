import type { Metadata } from "next"
import { Google_Sans_Flex } from "next/font/google"
import "./globals.css"

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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${googleSansFlex.className}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
