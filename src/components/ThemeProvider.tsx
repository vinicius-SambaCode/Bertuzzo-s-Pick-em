"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { Sun, Moon } from "lucide-react"

type Theme = "dark" | "light"

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
})

export function ThemeProvider({ children, initial = "dark" }: {
  children: React.ReactNode
  initial?: Theme
}) {
  const [theme, setTheme] = useState<Theme>(initial)

  useEffect(() => {
    const saved = (document.cookie.match(/copa_theme=([^;]+)/)?.[1] ?? initial) as Theme
    setTheme(saved)
    document.documentElement.setAttribute("data-theme", saved)
  }, [initial])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark"
      document.documentElement.setAttribute("data-theme", next)
      document.cookie = `copa_theme=${next}; path=/; max-age=31536000; SameSite=Lax`
      return next
    })
  }, [])

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function useTheme() { return useContext(ThemeCtx) }

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className={`touch-target flex items-center justify-center rounded-xl transition-all ${className}`}
      style={{
        minHeight: 44, minWidth: 44,
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        color: "var(--t2)",
      }}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}
