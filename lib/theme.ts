export const THEME_VALUES = ["system", "light", "dark"] as const

export type ThemeValue = (typeof THEME_VALUES)[number]

export function getThemeValue(theme: string | undefined): ThemeValue {
  return THEME_VALUES.includes(theme as ThemeValue)
    ? (theme as ThemeValue)
    : "system"
}

export function getNextTheme(theme: string | undefined): ThemeValue {
  const activeTheme = getThemeValue(theme)
  const activeIndex = THEME_VALUES.indexOf(activeTheme)

  return THEME_VALUES[(activeIndex + 1) % THEME_VALUES.length]
}

export function isDarkTheme(theme: ThemeValue): boolean {
  if (theme === "dark") return true
  if (theme === "light") return false

  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function setThemeWithTransition(
  setTheme: (theme: ThemeValue) => void,
  theme: ThemeValue
) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches

  if (!document.startViewTransition || reduceMotion) {
    setTheme(theme)
    return
  }

  document.startViewTransition(() => {
    document.documentElement.classList.toggle("dark", isDarkTheme(theme))
    setTheme(theme)
  })
}
