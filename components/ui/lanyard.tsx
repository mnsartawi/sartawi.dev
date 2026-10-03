"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Gamepad2 } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import {
  activityImageUrl,
  activityLabel,
  formatElapsed,
  getGameDetails,
  type LanyardActivity,
} from "@/lib/lanyard"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function LanyardActivity({
  activity,
}: {
  activity: LanyardActivity | null
}) {
  const src = activity ? activityImageUrl(activity) : null
  const start = activity?.timestamps?.start
  const [imgFailed, setImgFailed] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    setImgFailed(false)
  }, [src])
  useEffect(() => {
    if (!start) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [start])
  if (!activity) return null
  const label = activityLabel(activity)
  const game = getGameDetails(activity)
  const badge = (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="inline-flex select-none items-center gap-1.5 align-middle"
    >
      {label.before && <span>{label.before}</span>}
      {activity.name.toLowerCase() === "roblox" ? (
        <img
          src="https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Roblox_%282025%29_%28App_Icon%29.svg/120px-Roblox_%282025%29_%28App_Icon%29.svg.png"
          alt=""
          aria-hidden
          draggable={false}
          className="size-5 rounded-[5px] object-cover"
        />
      ) : src && !imgFailed ? (
        <img
          src={src}
          alt=""
          aria-hidden
          draggable={false}
          onError={() => setImgFailed(true)}
          className="size-5 rounded-[5px] object-cover"
        />
      ) : (
        <Gamepad2 className="size-5 text-muted-foreground" aria-hidden />
      )}
      {label.after && <span>{label.after}</span>}
    </motion.span>
  )
  if (!game) {
    if (activity.name.toLowerCase() === "zed" && start) {
      return (
        <Tooltip>
          <TooltipTrigger render={badge} delay={200} />
          <TooltipContent>
            <span className="tabular-nums">
              {formatElapsed(now - start)}
            </span>
          </TooltipContent>
        </Tooltip>
      )
    }
    return badge
  }
  return (
    <Tooltip>
      <TooltipTrigger render={badge} delay={200} />
      <TooltipContent>
        <span className="flex items-center gap-1.5">
          {game.image && (
            <Avatar
              size="logo"
              className="select-none"
              style={{ width: 16, height: 16, borderRadius: 5 }}
            >
              <Avatar.Image
                src={game.image}
                alt=""
                draggable={false}
                fit="contain"
              />
            </Avatar>
          )}
          {game.name}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}
