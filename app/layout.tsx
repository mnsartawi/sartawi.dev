import { Geist, Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import dynamic from "next/dynamic"

const AudioPlayer = dynamic(() =>
  import("@/components/ui/audio-player").then((m) => m.AudioPlayer),
)
import { Analytics } from "@vercel/analytics/next"
import ThemeToggle from "@/components/theme-toggle"

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Mohammad Salah — Full Stack Developer",
  description:
    "Personal site of Mohammad Salah (Mo), a 15-year-old Full Stack Developer based in Ras Al Khaimah, UAE.",
  icons: { icon: "/vercel.ico" },
  openGraph: {
    title: "Mohammad Salah — Full Stack Developer",
    description:
      "Personal site of Mohammad Salah (Mo), a 15-year-old Full Stack Developer based in Ras Al Khaimah, UAE.",
    type: "website",
    url: "https://sartawi.dev",
  },
}

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
        <Analytics />
      </body>
    </html>
  )
}
