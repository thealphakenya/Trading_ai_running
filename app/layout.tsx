// app/layout.tsx
import type { Metadata } from "next"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import ClientLayout from "./client-layout"
import { ThemeProvider } from "next-themes"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TradingAI - Automated Bitget Trading with AI Confidence",
  description:
    "Trade automatically on Bitget with our AI-powered system. Only executes trades when confidence exceeds your threshold, with built-in risk management and 24/7 operation.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
