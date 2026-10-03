"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import type { IconType } from "react-icons"
import { cn } from "@/lib/utils"

/** Accepts both lucide icons and react-icons (e.g. `SiGo`) components. */
export type HoverPreviewIcon = LucideIcon | IconType

export type HoverPreviewContent = {
  image: string
  title?: string
  titleIcon?: HoverPreviewIcon
  /** CSS color applied to the title icon, e.g. a brand color. */
  titleIconOverride?: string
  subtitle?: string
  /** Extra classes merged onto the subtitle, e.g. to nudge its position. */
  subtitleClassName?: string
  imageAlt?: string
}

type HoverPreviewContextValue = {
  show: (content: HoverPreviewContent, event: ReactMouseEvent) => void
  move: (event: ReactMouseEvent) => void
  hide: () => void
  registerImage: (src: string) => void
}

const HoverPreviewContext = createContext<HoverPreviewContextValue | null>(null)

function useHoverPreviewContext() {
  const ctx = useContext(HoverPreviewContext)
  if (!ctx) {
    throw new Error("HoverPreview.Trigger must be used inside <HoverPreview>")
  }
  return ctx
}

export function useHoverPreview() {
  return useHoverPreviewContext()
}

const CARD_WIDTH = 296
const CARD_GAP_Y = 20
const VIEWPORT_MARGIN = 20

function HoverPreviewRoot({
  children,
}: {
  children: ReactNode
}) {
  const [content, setContent] = useState<HoverPreviewContent | null>(null)
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const lastPoint = useRef<{
    x: number
    y: number
    anchor: { top: number; bottom: number; cx: number } | null
  }>({ x: 0, y: 0, anchor: null })
  const seenImages = useRef(new Set<string>())

  useEffect(() => {
    setMounted(true)
  }, [])

  const registerImage = useCallback((src: string) => {
    if (!src || seenImages.current.has(src)) return
    seenImages.current.add(src)
    const img = new Image()
    img.decoding = "async"
    img.src = src
  }, [])

  const place = useCallback(
    (
      clientX: number,
      clientY: number,
      anchor: { top: number; bottom: number; cx: number } | null,
    ) => {
      const card = cardRef.current
      if (!card || typeof window === "undefined") return
      lastPoint.current = { x: clientX, y: clientY, anchor }
      const height = card.offsetHeight || 250
      // Anchor to the hovered element so the card sits below the text,
      // falling back to the cursor when no anchor is available.
      const anchorTop = anchor ? anchor.top : clientY
      let x = (anchor ? anchor.cx : clientX) - CARD_WIDTH / 2
      let y = (anchor ? anchor.bottom : clientY) + CARD_GAP_Y
      x = Math.min(
        Math.max(x, VIEWPORT_MARGIN),
        window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN,
      )
      // Only flip above when the card would run off the viewport bottom.
      if (y + height > window.innerHeight - VIEWPORT_MARGIN) {
        y = anchorTop - height - CARD_GAP_Y
      }
      if (y < VIEWPORT_MARGIN) {
        y = VIEWPORT_MARGIN
      }
      card.style.left = `${x}px`
      card.style.top = `${y}px`
    },
    [],
  )

  const getAnchor = (event: ReactMouseEvent) => {
    const el = event.currentTarget as HTMLElement | null
    if (!el || typeof el.getBoundingClientRect !== "function") return null
    const rect = el.getBoundingClientRect()
    return { top: rect.top, bottom: rect.bottom, cx: rect.left + rect.width / 2 }
  }

  const show = useCallback(
    (next: HoverPreviewContent, event: ReactMouseEvent) => {
      const anchor = getAnchor(event)
      registerImage(next.image)
      setContent(next)
      setVisible(true)
      // Position after the card mounts (it enters with opacity 0, so no flash).
      requestAnimationFrame(() => place(event.clientX, event.clientY, anchor))
    },
    [place, registerImage],
  )

  const move = useCallback(
    (event: ReactMouseEvent) => {
      place(event.clientX, event.clientY, getAnchor(event))
    },
    [place],
  )

  const hide = useCallback(() => setVisible(false), [])

  const handleImageLoad = useCallback(() => {
    // Image may resolve after first placement with a wrong height estimate.
    const { x, y, anchor } = lastPoint.current
    place(x, y, anchor)
  }, [place])

  const value = useMemo(
    () => ({ show, move, hide, registerImage }),
    [show, move, hide, registerImage],
  )

  return (
    <HoverPreviewContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-hidden
            ref={cardRef}
            className="pointer-events-none fixed left-0 top-0 z-[100]"
            style={{ width: CARD_WIDTH }}
          >
            <AnimatePresence key={content?.image ?? "idle"}>
              {visible && content && (
                <motion.div
                  key={content.image}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                    <img
                      src={content.image}
                      alt={content.imageAlt ?? content.title ?? ""}
                      onLoad={handleImageLoad}
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                      className="block h-auto w-full"
                      loading="eager"
                      referrerPolicy="no-referrer"
                    />
                {(content.title || content.titleIcon || content.subtitle) && (
                  <div className="px-3 pb-3 pt-2">
                    {(content.title || content.titleIcon) && (
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-popover-foreground">
                        {content.titleIcon && (
                          <content.titleIcon
                            className="size-4 shrink-0"
                            style={{ color: content.titleIconOverride }}
                            aria-hidden
                          />
                        )}
                        {content.title}
                      </p>
                    )}
                        {content.subtitle && (
                          <p
                            className={cn(
                              "text-xs text-muted-foreground",
                              content.subtitleClassName,
                            )}
                          >
                            {content.subtitle}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </HoverPreviewContext.Provider>
  )
}

export type HoverPreviewTriggerProps = {
  preview: HoverPreviewContent
  href?: string
  className?: string
  children: ReactNode
}

function HoverPreviewTrigger({
  preview,
  href,
  className,
  children,
}: HoverPreviewTriggerProps) {
  const { show, move, hide, registerImage } = useHoverPreviewContext()

  useEffect(() => {
    registerImage(preview.image)
  }, [preview.image, registerImage])

  const handlers = {
    className: cn("cursor-pointer", className),
    onMouseEnter: (e: ReactMouseEvent) => show(preview, e),
    onMouseMove: move,
    onMouseLeave: hide,
    onBlur: hide,
  }

  if (href) {
    return (
      <a href={href} {...handlers}>
        {children}
      </a>
    )
  }

  return <span {...handlers}>{children}</span>
}

export const HoverPreview = Object.assign(HoverPreviewRoot, {
  Trigger: HoverPreviewTrigger,
})
