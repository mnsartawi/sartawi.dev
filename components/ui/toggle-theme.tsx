"use client"

import React from "react"
import { MonitorCogIcon, MoonStarIcon, SunIcon } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { getThemeValue, type ThemeValue } from "@/lib/theme"

const THEME_OPTIONS = [
  {
    icon: MonitorCogIcon,
    value: "system",
  },
  {
    icon: SunIcon,
    value: "light",
  },
  {
    icon: MoonStarIcon,
    value: "dark",
  },
] satisfies Array<{
  icon: React.ComponentType<{ className?: string }>
  value: ThemeValue
}>

export function ToggleTheme() {
  const { theme, setTheme } = useTheme()
  const isMounted = React.useSyncExternalStore(
    React.useCallback(() => () => {}, []),
    () => true,
    () => false
  )

  if (!isMounted) {
    return <div className="flex h-8 w-24" />
  }

  const activeTheme = getThemeValue(theme)

  return (
    <motion.div
      key={String(isMounted)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center overflow-hidden rounded-md border bg-muted/80"
      role="radiogroup"
    >
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={cn(
            "relative flex size-7 cursor-default items-center justify-center rounded-md transition-all",
            activeTheme === option.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          role="radio"
          aria-checked={activeTheme === option.value}
          aria-label={`Switch to ${option.value} theme`}
          onClick={() => {
            setTheme(option.value)
          }}
        >
          {activeTheme === option.value && (
            <motion.div
              layoutId="theme-option"
              transition={{ type: "spring", bounce: 0.1, duration: 0.75 }}
              className="absolute inset-0 rounded-md border border-muted-foreground/50"
            />
          )}
          <option.icon className="size-3.5" />
        </button>
      ))}
    </motion.div>
  )
}
