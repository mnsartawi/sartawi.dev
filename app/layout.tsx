import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import { AudioPlayer } from "@/components/ui/audio-player"
import ThemeToggle from "@/components/theme-toggle"

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <AudioPlayer />
          </TooltipProvider>
          <div className="fixed top-4 right-4 z-60">
            <ThemeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
