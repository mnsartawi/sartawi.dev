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
