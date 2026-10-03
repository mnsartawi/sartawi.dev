"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"
import type { LucideIcon } from "lucide-react"
import type { IconType } from "react-icons"

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  image,
  imageAlt,
  icon: Icon,
  iconClassName,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    image?: string
    imageAlt?: string
    icon?: LucideIcon | IconType | string | { light: string; dark: string }
    iconClassName?: string
  }) {
  const hasImage = Boolean(image)

  // `icon` accepts a Lucide component, an image URL, or a light/dark
  // image pair (each rendered at icon size).
  const iconImgClassName = cn(
    "size-3.5 shrink-0 object-contain",
    iconClassName,
  )
  const renderIcon =
    typeof Icon === "string" ? (
      <img
        src={Icon}
        alt=""
        aria-hidden
        className={iconImgClassName}
      />
    ) : Icon && typeof Icon === "object" && "light" in Icon ? (
      <>
        <img
          src={Icon.light}
          alt=""
          aria-hidden
          className={`${iconImgClassName} block dark:hidden`}
        />
        <img
          src={Icon.dark}
          alt=""
          aria-hidden
          className={`${iconImgClassName} hidden dark:block`}
        />
      </>
    ) : Icon ? (
      <Icon className={cn("size-3.5 shrink-0", iconClassName)} aria-hidden />
    ) : null
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 w-fit max-w-xs origin-(--transform-origin) rounded-md bg-foreground text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            hasImage
              ? "flex flex-col items-stretch p-1.5"
              : "inline-flex items-center gap-1.5 px-3 py-1.5",
            className
          )}
          {...props}
        >
          {hasImage ? (
            <>
              <img
                src={image}
                alt={imageAlt ?? ""}
                className="block h-32 w-56 rounded-[4px] object-cover"
              />
              {(renderIcon || children) && (
                <span className="inline-flex items-center gap-1.5 px-1.5 pt-2 pb-0.5">
                  {renderIcon}
                  {children}
                </span>
              )}
            </>
          ) : (
            <>
              {renderIcon}
              {children}
            </>
          )}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
