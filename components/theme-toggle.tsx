"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Avoid hydration mismatch but still show a placeholder
  if (!mounted) {
    return (
      <div className="h-9 w-24 rounded-full bg-muted flex items-center px-3 gap-2">
        <div className="h-4 w-4 rounded-full bg-background/50" />
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group flex items-center gap-2 rounded-full px-3 py-1.5 font-medium transition-all",
        "bg-muted hover:bg-muted/80 border border-border shadow-sm",
        "active:scale-95"
      )}
      aria-label="Toggle theme"
    >
      <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
        <Sun className={cn(
          "h-4 w-4 text-amber-500 transition-all duration-300",
          isDark ? "translate-y-[150%] opacity-0" : "translate-y-0 opacity-100"
        )} />
        <Moon className={cn(
          "absolute h-4 w-4 text-blue-400 transition-all duration-300",
          isDark ? "translate-y-0 opacity-100" : "translate-y-[-150%] opacity-0"
        )} />
      </div>
      <span className="text-xs font-semibold text-foreground">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  )
}
