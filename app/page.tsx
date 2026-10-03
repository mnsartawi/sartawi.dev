"use client"

import { AnimatePresence, motion, type Variants } from "framer-motion"
import { Karla } from "next/font/google"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverPreview,
  useHoverPreview,
  type HoverPreviewContent,
} from "@/components/ui/hover-preview"
import { UploadIcon, Mail, type LucideIcon } from "lucide-react"
import { SiTypescript, SiNextdotjs, SiGo, SiDiscord, SiGithub, SiInstagram, SiTiktok } from "react-icons/si"
import type { IconType } from "react-icons"
import { ContributionsGraph } from "@/components/ui/contributions"
import { getDisplayActivity, useLanyard } from "@/lib/lanyard"
import { LanyardActivity } from "@/components/ui/lanyard"

const font = Karla({ subsets: ["latin"], display: "swap" })

const underline: Variants = {
  rest: {
    scaleX: 0,
    originX: 1,
    transition: {
      scaleX: { duration: 0.3, ease: "easeInOut" },
      originX: { duration: 0 },
    },
  },
  hover: {
    scaleX: 1,
    originX: 0,
    transition: {
      scaleX: { duration: 0.3, ease: "easeInOut" },
      originX: { duration: 0 },
    },
  },
}

function AnimatedLink({
  href,
  children,
  className = "text-primary",
  ref,
  ...props
}: {
  href: string
  children: React.ReactNode
  className?: string
  ref?: React.Ref<HTMLAnchorElement>
} & Omit<
  React.ComponentPropsWithoutRef<"a">,
  | "href"
  | "children"
  | "className"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd"
>) {
  return (
    <motion.a
      ref={ref}
      href={href}
      className={`relative inline no-underline ${className}`}
      initial="rest"
      whileHover="hover"
      animate="rest"
      {...props}
    >
      {children}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-px h-px bg-current opacity-50"
      />
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-px h-px bg-current"
        variants={underline}
      />
    </motion.a>
  )
}

const footerLinks = ["home", "github", "twitter", "rss"]

function PreviewLink({
  href,
  preview,
  children,
}: {
  href: string
  preview: HoverPreviewContent
  children: React.ReactNode
}) {
  const { show, move, hide } = useHoverPreview()

  return (
    <AnimatedLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={(e) => show(preview, e)}
      onMouseMove={move}
      onMouseLeave={hide}
    >
      {children}
    </AnimatedLink>
  )
}

function RollingNumber({ value }: { value: string }) {
  const chars = value.split("")

  return (
    <span className="inline-flex tabular-nums">
      {chars.map((char, i) => (
        <span
          key={i}
          className="relative inline-block overflow-hidden"
          style={{ lineHeight: 1 }}
        >
          <motion.span
            key={char}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="inline-block"
          >
            {char}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

const labels = ["year", "day", "month", "week", "hour"] as const

function Age() {
  const birthDate = new Date("2011-09-17T00:00:00+04:00")
  const [now, setNow] = useState(() => new Date())
  const [mode, setMode] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const elapsed = now.getTime() - birthDate.getTime()
  const millisecondsPerHour = 60 * 60 * 1000
  const millisecondsPerDay = 24 * millisecondsPerHour
  const millisecondsPerYear = 365.2425 * millisecondsPerDay

  const years = elapsed / millisecondsPerYear
  const days = elapsed / millisecondsPerDay
  const months = years * 12
  const weeks = days / 7
  const hours = elapsed / millisecondsPerHour

  const integers = [
    Math.floor(years),
    Math.floor(days),
    Math.floor(months),
    Math.floor(weeks),
    Math.floor(hours),
  ]

  const precise = [
    years.toFixed(6),
    days.toFixed(5),
    months.toFixed(8),
    weeks.toFixed(8),
    hours.toFixed(3),
  ]

  const display = integers[mode]
  const label = labels[mode]
  const preciseDisplay = precise[mode]

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <motion.button
            type="button"
            onClick={() => setMode((current) => (current + 1) % labels.length)}
            className="cursor-help"
          >
            <RollingNumber value={String(display)} /> {label} old
          </motion.button>
        }
      />
      <TooltipContent className="whitespace-nowrap">
        <RollingNumber value={preciseDisplay} /> {label} old
      </TooltipContent>
    </Tooltip>
  )
}

type Project = {
  title: string
  name: string
  logo: string | { light: string; dark: string } | LucideIcon
  href: string
  logoClassName?: string
}

function ProjectLogo({
  logo,
  name,
  logoClassName,
}: {
  logo: Project["logo"]
  name: string
  logoClassName?: string
}) {
  if (typeof logo === "string") {
    return (
      <Image
        src={logo}
        alt={`${name} logo`}
        draggable={false}
        fill
        sizes="32px"
        className={`object-contain ${logoClassName ?? ""}`}
      />
    )
  }
  if ("light" in logo) {
    return (
      <>
        <Image
          src={logo.light}
          alt={`${name} logo`}
          draggable={false}
          fill
          sizes="32px"
          className={`object-contain block dark:hidden ${logoClassName ?? ""}`}
        />
        <Image
          src={logo.dark}
          alt=""
          draggable={false}
          fill
          sizes="32px"
          className={`object-contain hidden dark:block ${logoClassName ?? ""}`}
        />
      </>
    )
  }
  const Icon = logo
  return <Icon aria-hidden className={logoClassName ?? "size-5"} />
}

type Social = {
  label: string
  href: string
  Icon: IconType | LucideIcon
  favicon?: string
  hoverClassName?: string
}

const socials: Social[] = [
  {
    label: "GitHub",
    href: "https://github.com/mnsartawi",
    Icon: SiGithub,
    hoverClassName: "hover:text-black dark:hover:text-white",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/v7xmhd",
    Icon: SiInstagram,
  },
  {
    label: "Discord",
    href: "https://discord.com/users/718185533460840450",
    Icon: SiDiscord,
    hoverClassName: "hover:text-[#5865F2]",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@m.s7v",
    Icon: SiTiktok,
  },
  {
    label: "Email",
    href: "mailto:me@sartawi.dev",
    Icon: Mail,
    hoverClassName: "hover:text-primary",
  },
]

export default function Page() {
  const presence = useLanyard("718185533460840450")
  const activity = getDisplayActivity(presence?.activities ?? [])
  const projects: Project[] = [
    {
      title: "untap",
      name: "untap",
      logo: "/untap.png",
      href: "https://github.com/mnsartawi/untap",
    },
    {
      title: "clak",
      name: "clak",
      logo: { light: "/clak-light.png", dark: "/clak-dark.png" },
      href: "https://github.com/mnsartawi/clak",
    },
    {
      title: "cdn",
      name: "cdn",
      logo: UploadIcon,
      logoClassName: "w-4 h-4 mx-0.5 mt-0.5",
      href: "https://cdn.sartawi.dev/index.html",
    },
    {
      title: "quranbuddy",
      name: "quranbuddy",
      logo: "https://qb.sartawi.dev/favicon.ico",
      logoClassName: "w-9 h-9 -translate-y-0.5",
      href: "https://qb.sartawi.dev",
    },
    {
      title: "38-0",
      name: "38-0",
      logo: "/38-0.png",
      logoClassName: "w-9 -translate-y-0.5 h-9",
      href: "http://discord.gg/realsports",
    },
  ]

  return (
    <motion.div
      className={`${font.className} mx-auto flex min-h-screen w-full max-w-200 flex-col px-4 py-20 leading-7 max-sm:py-10`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.7 } }}
      exit={{ opacity: 0 }}
    >
      <main className="flex-1">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="pfp" className="h-6 w-6 select-none">
              <Image src="/vercel.ico" alt="" draggable={false} fill sizes="24px" className="object-contain" />
            </Avatar>
            <h1 className="text-[15px] font-semibold select-none">
              Mohammad Salah
            </h1>
          </div>
          <div className="relative flex -translate-x-18 -translate-y-0.5 items-center gap-0.5">
            {socials.map(({ label, href, Icon, favicon, hoverClassName }) => {
              const external = href.startsWith("http")
              return (
                <Tooltip key={label}>
                  <TooltipTrigger
                    delay={200}
                    render={
                      <a
                        href={href}
                        aria-label={label}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className={`group relative flex size-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors ${hoverClassName ?? "hover:text-foreground"}`}
                      >
                        <Icon
                          className={`size-4 transition-opacity ${favicon ? "group-hover:opacity-0" : ""}`}
                          aria-hidden
                        />
                        {favicon && (
                          <img
                            src={favicon}
                            alt=""
                            aria-hidden
                            draggable={false}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                            className="absolute size-4 rounded-[4px] object-contain opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        )}
                      </a>
                    }
                  />
                  <TooltipContent
                    side="bottom"
                    icon={favicon ?? Icon}
                    iconClassName={
                      label === "Discord"
                        ? "text-[#5865F2]"
                        : label === "Email"
                          ? "text-primary"
                          : undefined
                    }
                  >
                    {label}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <p>
            <HoverPreview>
              I&apos;m{" "}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="cursor-help underline decoration-dotted underline-offset-4">
                      Mo
                    </span>
                  }
                />
                <TooltipContent>
                  /muːˈhɑːməd/; Arabic: مُحَمَّد, romanized: Muḥammad, lit.
                  &apos;praiseworthy&apos;; Arabic pronunciation: [mʊˈħæm.mæd]
                </TooltipContent>
              </Tooltip>
              , a{" "}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <AnimatedLink
                      href="https://en.wikipedia.org/wiki/Front_end_and_back_end"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Full Stack Developer
                    </AnimatedLink>
                  }
                />
                <TooltipContent icon="/wikpedia.ico">
                  en.wikipedia.org
                </TooltipContent>
              </Tooltip>
              , <Age /> focused on{" "}
              <SiTypescript
                aria-label="TypeScript"
                className="mx-1 mr-1 inline-block h-[1.25em] w-[1.25em] -translate-x-0.5 -translate-y-0.5 text-[#3178C6]"
              />
              <PreviewLink
                href="https://www.typescriptlang.org/"
                preview={{
                  image: "/typescript.png",
                  title: "TypeScript",
                  titleIcon: SiTypescript,
                  titleIconOverride: "#3178C6",
                  subtitle:
                    "TypeScript is a strongly typed programming language that builds on JavaScript",
                  subtitleClassName: "translate-y-1",
                }}
              >
                TypeScript
              </PreviewLink>
              ,{" "}
              <SiNextdotjs
                aria-label="Next.js"
                className="mx-1 mr-1 inline-block h-[1.25em] w-[1.25em] -translate-y-0.5"
              />
              <PreviewLink
                href="https://nextjs.org/"
                preview={{
                  image: "/nextjs.png",
                  title: "Next.js",
                  titleIcon: SiNextdotjs,
                  subtitle: "The React Framework for the Web",
                }}
              >
                Next.js
              </PreviewLink>{" "}
              <span className="whitespace-nowrap">
                and{" "}
                <SiGo
                  aria-label="Golang"
                  className="mx-0.5 mr-1 inline-block h-[1.5em] w-[1.5em] -translate-x-0.5 -translate-y-0.5 text-[#00ADD8]"
                />
                <PreviewLink
                  href="https://go.dev/"
                  preview={{
                    image: "/go.png",
                    title: "Go",
                    titleIcon: SiGo,
                    titleIconOverride: "#00ADD8",
                    subtitle:
                      "An open-source programming language supported by Google",
                  }}
                >
                  Golang
                </PreviewLink>
                ,
              </span>
              <br />
              building modern backend and frontend systems.
            </HoverPreview>
          </p>

          <p>
            I&apos;m currently working on{" "}
            <span className="inline-flex align-middle">
              <Avatar
                size="logo"
                className="select-none"
                style={{ backgroundColor: "var(--card)" }}
              >
                <Image
                  src="/clak-light.png"
                  alt="clak logo"
                  draggable={false}
                  fill
                  sizes="24px"
                  className="object-contain block scale-110 dark:hidden"
                />
                <Image
                  src="/clak-dark.png"
                  alt=""
                  draggable={false}
                  fill
                  sizes="24px"
                  className="object-contain hidden scale-110 dark:block"
                />
              </Avatar>
            </span>{" "}
            <Tooltip>
              <TooltipTrigger
                render={<AnimatedLink href="#">clak</AnimatedLink>}
              />
              <TooltipContent
                icon={{ light: "/clak-dark.png", dark: "/clak-light.png" }}
                iconClassName="size-6"
                className="max-w-md whitespace-nowrap"
              >
                <span>
                  Mechanical keyboard sounds emulator{" "}
                  <img
                    src="/tauri.png"
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="inline-block h-[1.1em] w-[1.1em] object-contain align-[-0.15em]"
                  />{" "}
                  tauri app
                </span>
              </TooltipContent>
            </Tooltip>{" "}
            and{" "}
            <span className="inline-flex align-middle">
              <Avatar
                size="logo"
                className="select-none"
                style={{ backgroundColor: "var(--card)" }}
              >
                <Image
                  src="/38-0.png"
                  alt="38-0 logo"
                  draggable={false}
                  fill
                  sizes="24px"
                  className="object-contain scale-90"
                />
              </Avatar>
            </span>{" "}
            <Tooltip>
              <TooltipTrigger
                render={<AnimatedLink href="#">38-0</AnimatedLink>}
              />
              <TooltipContent icon="/38-0.png" iconClassName="size-5">
                <span className="ml-1.5">
                  <span className="mr-1 inline-flex items-center gap-1 align-middle text-[0.85em]">
                    <SiDiscord className="size-4 text-[#5865F2]" />
                  </span>
                  Discord bot for the RFL community, based on the 38-0 Premier
                  League game
                </span>
              </TooltipContent>
            </Tooltip>
            .
          </p>

          <p className="text-muted-foreground">
            Currently in{" "}
            <img
              src="https://flagcdn.com/64x48/ae.png"
              alt=""
              aria-hidden
              draggable={false}
              className="mx-0.5 mr-1.5 inline-block h-[1em] w-auto rounded-[1px] align-[-0.15em]"
            />
            <Tooltip>
              <TooltipTrigger
                render={
                  <AnimatedLink
                    href="https://maps.apple/p/aIy_QN0KdJh_M_"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ras Al Khaimah, UAE
                  </AnimatedLink>
                }
              />
              <TooltipContent icon="/maps.png">maps.apple.com</TooltipContent>
            </Tooltip>
            <AnimatePresence>
              {activity ? (
                <span key="activity">
                  ,{" "}
                  <span className="ml-1">
                    <LanyardActivity activity={activity} />
                  </span>
                </span>
              ) : (
                <span key="idle">.</span>
              )}
            </AnimatePresence>
          </p>
        </div>
        <section className="mt-10">
          <h1 className="text-sm font-semibold text-foreground">projects</h1>

          <div className="mt-3 flex flex-col gap-4.5">
            {projects.map(({ title, name, logo, href, logoClassName }) => (
              <div key={name} className="flex gap-5 text-[14px] leading-5">
                <div className="flex flex-col">
                  <p>
                    <span className="inline-flex align-middle">
                      <Avatar
                        size="logo"
                        className="h-8 w-8 select-none"
                        style={{ backgroundColor: "var(--card)" }}
                      >
                        <ProjectLogo
                          logo={logo}
                          name={name}
                          logoClassName={logoClassName}
                        />
                      </Avatar>
                    </span>{" "}
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex align-middle text-sm leading-5 text-foreground hover:underline"
                          >
                            {title}
                          </a>
                        }
                      />
                      <TooltipContent
                        icon={
                          href.includes("github.com")
                            ? SiGithub
                            : href.includes("discord.gg")
                              ? SiDiscord
                              : logo
                        }
                        iconClassName={
                          href.includes("discord.gg")
                            ? "size-3.5 text-[#5865F2]"
                            : href.includes("github.com")
                              ? "size-3.5"
                              : "size-4"
                        }
                      >
                        {href.includes("github.com")
                          ? "github.com"
                          : href.includes("discord.gg")
                            ? "discord.gg"
                            : href
                                .replace(/^https?:\/\//, "")
                                .replace(/\/index\.html\/?$/, "")}
                      </TooltipContent>
                    </Tooltip>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <ContributionsGraph username="mnsartawi" />
        </section>
      </main>
    </motion.div>
  )
}
