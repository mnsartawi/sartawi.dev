"use client"

import { useEffect, useState } from "react"

export type LanyardActivity = {
  id: string
  name: string
  type: number
  state?: string
  details?: string
  application_id?: string
  assets?: {
    large_image?: string
    large_text?: string
    small_image?: string
  } | null
  timestamps?: {
    start?: number
    end?: number
  } | null
  emoji?: { name: string } | null
}

export function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes)
  return `${hours > 0 ? `${hours}:` : ""}${mm}:${String(seconds).padStart(2, "0")}`
}

export type LanyardPresence = {
  discord_status: string
  activities: LanyardActivity[]
}

type HelloMessage = {
  op: 1
  d: { heartbeat_interval: number }
}

type EventMessage = {
  op: 0
  t: "INIT_STATE" | "PRESENCE_UPDATE"
  d: Record<string, LanyardPresence> | LanyardPresence
}

export function getDisplayActivity(
  activities: LanyardActivity[],
): LanyardActivity | null {
  return (
    activities.find((a) => a.type !== 4 && a.assets?.large_image) ??
    activities.find((a) => a.type !== 4) ??
    null
  )
}

export function activityImageUrl(
  activity: LanyardActivity,
): string | null {  const image = activity.assets?.large_image
  if (!image) return null
  if (image.startsWith("mp:")) {
    return `https://media.discordapp.net/${image.slice(3)}`
  }
  if (image.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${image.slice("spotify:".length)}`
  }
  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`
  }
  return null
}

export type GameDetails = {
  name: string
  image: string | null
}

export function getGameDetails(
  activity: LanyardActivity,
): GameDetails | null {
  if (activity.name.toLowerCase() !== "roblox") return null
  const image = activityImageUrl(activity)
  if (!image) return null
  return { name: activity.details || activity.state || "In game", image }
}

export type ActivityDisplay = {
  before: string
  after: string
  iconFirst: boolean
}

function plain(text: string): ActivityDisplay {
  return { before: "", after: text, iconFirst: true }
}

export function activityLabel(activity: LanyardActivity): ActivityDisplay {
  const name = activity.name
  if (name.toLowerCase() === "zed") {
    const strip = (s: string) =>
      s
        .trim()
        .replace(/^\s*in\s+/i, "")
        .replace(/^\s*working\s+on\s+/i, "")
    const details = strip(activity.details ?? "")
    const state = strip(activity.state ?? "")
    if (/^\s*(idle|idling)\s*$/i.test(state)) {
      return { before: "Currently Idling in", after: name, iconFirst: false }
    }
    let focus = details || state
    if (details && state && !details.includes(state)) {
      focus = `${details}/${state}`
    }
    if (!focus) return plain(`Currently in ${name}`)
    return { before: "Currently working on", after: focus, iconFirst: false }
  }
  if (name.toLowerCase() === "roblox") {
    return { before: "Playing", after: "Roblox", iconFirst: false }
  }
  switch (activity.type) {
    case 0:
      return plain(`Playing ${name}`)
    case 1:
      return plain(`Streaming ${name}`)
    case 2:
      return plain(`Listening to ${name}`)
    case 3:
      return plain(`Watching ${name}`)
    case 5:
      return plain(`Competing in ${name}`)
    default:
      return plain(name)
  }
}

export function useLanyard(userId: string) {
  const [presence, setPresence] = useState<LanyardPresence | null>(null)

  useEffect(() => {
    let socket: WebSocket | null = null
    let heartbeat: ReturnType<typeof setInterval> | null = null
    let reconnect: ReturnType<typeof setTimeout> | null = null
    let closed = false

    const cleanup = () => {
      if (heartbeat) clearInterval(heartbeat)
      if (reconnect) clearTimeout(reconnect)
      heartbeat = null
      reconnect = null
      if (socket) {
        socket.close()
        socket = null
      }
    }

    const connect = () => {
      if (closed) return
      socket = new WebSocket("wss://api.lanyard.rest/socket")

      socket.addEventListener("message", (event) => {
        let message: HelloMessage | EventMessage
        try {
          message = JSON.parse(String(event.data))
        } catch {
          return
        }

        if (message.op === 1) {
          if (heartbeat) clearInterval(heartbeat)
          heartbeat = setInterval(() => {
            socket?.send(JSON.stringify({ op: 3 }))
          }, message.d.heartbeat_interval)
          socket?.send(
            JSON.stringify({ op: 2, d: { subscribe_to_ids: [userId] } }),
          )
          return
        }

        if (message.op === 0) {
          if (message.t === "INIT_STATE") {
            const state = (message.d as Record<string, LanyardPresence>)[
              userId
            ]
            if (state) setPresence(state)
          } else if (message.t === "PRESENCE_UPDATE") {
            setPresence(message.d as LanyardPresence)
          }
        }
      })

      socket.addEventListener("close", () => {
        if (heartbeat) clearInterval(heartbeat)
        heartbeat = null
        if (!closed) {
          reconnect = setTimeout(connect, 3000)
        }
      })
    }

    connect()

    return () => {
      closed = true
      cleanup()
    }
  }, [userId])

  return presence
}
