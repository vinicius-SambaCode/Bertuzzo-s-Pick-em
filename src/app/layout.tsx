import type { Metadata, Viewport } from "next"
import { Inter, Bebas_Neue, Barlow_Condensed } from "next/font/google"
import { cookies } from "next/headers"
import "./globals.css"
import { Providers } from "@/components/providers/Providers"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "sonner"

const inter  = Inter({ subsets: ["latin"], variable: "--font-inter",  display: "swap" })
const bebas  = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" })
const barlow = Barlow_Condensed({ weight: ["400","600","700","800","900"], subsets: ["latin"], variable: "--font-barlow", display: "swap" })

export const metadata: Metadata = {
  title: "Copa Bertuzzo 2026",
  description: "Bolão da Copa do Mundo FIFA 2026 — Família Bertuzzo",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Copa Bertuzzo 26", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192" }, { url: "/icons/icon-512.png", sizes: "512x512" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0C0C0C" },
    { media: "(prefers-color-scheme: light)", color: "#F2F2EE" },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const savedTheme = (cookieStore.get("copa_theme")?.value ?? "dark") as "dark" | "light"

  return (
    <html lang="pt-BR"
          data-theme={savedTheme}
          className={`${inter.variable} ${bebas.variable} ${barlow.variable}`}>
      <body style={{ background: "var(--bg-1)", color: "var(--t1)" }}>
        <ThemeProvider initial={savedTheme}>
          <Providers>
            {children}
            <Toaster
              theme={savedTheme}
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  color: "var(--t1)",
                  fontFamily: "var(--font-inter)",
                },
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
