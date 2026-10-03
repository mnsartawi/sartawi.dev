"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { resolveAudioUrl } from "@/lib/quran-cache"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import Image from "next/image"

const pad3 = (n: number) => String(n).padStart(3, "0")

type Reciter = {
  name: string
  url: (surah: number) => string
  pic: string
  pos?: string
  bg?: string
}

const RECITERS: Reciter[] = [
  {
    name: "Maher Al Muaiqly",
    url: (s) => `https://server12.mp3quran.net/maher/${pad3(s)}.mp3`,
    pic: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Maher_Al_Mueaqly.jpg/250px-Maher_Al_Mueaqly.jpg",
    pos: "object-[50%_30%] scale-[0.75]",
    bg: "bg-white dark:bg-white",
  },
  {
    name: "Yasser Al Dosari",
    url: (s) => `https://server11.mp3quran.net/yasser/${pad3(s)}.mp3`,
    pic: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Yasser_Al-Dosari_%28cropped%29.jpg/250px-Yasser_Al-Dosari_%28cropped%29.jpg",
  },
  {
    name: "Saud Al Shuraim",
    url: (s) => `https://server7.mp3quran.net/shur/${pad3(s)}.mp3`,
    pic: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Saud_Shuraim.png",
    pos: "object-top",
  },
  {
    name: "Abdul Basit",
    url: (s) => `https://server7.mp3quran.net/basit/${pad3(s)}.mp3`,
    pic: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Abdul_Basit_Abdul_Samad_at_Centenary_Celebration_Of_Darul_Uloom_Deoband_1980.jpg/250px-Abdul_Basit_Abdul_Samad_at_Centenary_Celebration_Of_Darul_Uloom_Deoband_1980.jpg",
  },
  {
    name: "Mishary Alafasy",
    url: (s) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${s}.mp3`,
    pic: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg/250px-%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg",
  },
]

const SURAHS = [
  "Al-Fatihah", "Al-Baqarah", "Aal-e-Imran", "An-Nisa", "Al-Ma'idah",
  "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr",
  "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Taha",
  "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan",
  "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum",
  "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir",
  "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
  "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah",
  "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman",
  "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah",
  "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq",
  "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah",
  "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj",
  "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad",
  "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin",
  "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat",
  "Al-Qari'ah", "At-Takathur", "Al-Asr", "Al-Humazah", "Al-Fil",
  "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
  "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas",
]

type Track = {
  ri: number
  si: number
}

function randomSurahIndex(except?: number) {
  let si = Math.floor(Math.random() * SURAHS.length)
  while (except !== undefined && si === except) {
    si = Math.floor(Math.random() * SURAHS.length)
  }
  return si
}

function randomTrack(): Track {
  return {
    ri: Math.floor(Math.random() * RECITERS.length),
    si: randomSurahIndex(),
  }
}

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00"
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const mm =
    hours > 0 ? String(minutes).padStart(2, "0") : String(minutes)
  return `${hours > 0 ? `${hours}:` : ""}${mm}:${String(seconds).padStart(2, "0")}`
}

const iconButtonClassName =
  "flex size-6 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"

export function AudioPlayer() {
  const [open, setOpen] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [buffering, setBuffering] = useState(false)
  const [picOk, setPicOk] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [track, setTrack] = useState<Track>({ ri: 0, si: 0 })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const trackRef = useRef(track)
  const lastUrlRef = useRef<string | null>(null)
  const errorCountRef = useRef(0)
  const firstAttemptRef = useRef(true)
  const resumeCleanupRef = useRef<(() => void) | null>(null)
  const wantRef = useRef(true)
  const playingRef = useRef(playing)
  const resolveIdRef = useRef(0)
  const blobUrlRef = useRef<string | null>(null)

  trackRef.current = track
  playingRef.current = playing

  const disarmAutoplay = () => {
    firstAttemptRef.current = false
    resumeCleanupRef.current?.()
    resumeCleanupRef.current = null
  }

  useEffect(() => {
    setPicOk(true)
  }, [track.ri])

  useEffect(() => {
    setTrack(randomTrack())
  }, [])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = "metadata"
    audioRef.current = audio

    const advance = () => {
      const t = trackRef.current
      setTrack({ ri: t.ri, si: randomSurahIndex(t.si) })
    }

    const onEnded = () => advance()
    const onError = () => {
      errorCountRef.current += 1
      if (errorCountRef.current > 4) {
        errorCountRef.current = 0
        setTrack(randomTrack())
      } else {
        advance()
      }
    }
    const onWaiting = () => setBuffering(true)
    const onPlaying = () => {
      setBuffering(false)
      errorCountRef.current = 0
      firstAttemptRef.current = false
    }
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration || 0)

    audio.addEventListener("ended", onEnded)
    audio.addEventListener("error", onError)
    audio.addEventListener("waiting", onWaiting)
    audio.addEventListener("playing", onPlaying)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    return () => {
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
      audio.removeEventListener("waiting", onWaiting)
      audio.removeEventListener("playing", onPlaying)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      resumeCleanupRef.current?.()
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      audio.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!playing) {
      audio.pause()
      setBuffering(false)
      return
    }
    const attemptPlay = () => {
      setBuffering(true)
      audio.play().catch((e: unknown) => {
        // A newer play() superseded this one — it owns the outcome.
        if (e instanceof DOMException && e.name === "AbortError") return
        if (firstAttemptRef.current) {
          firstAttemptRef.current = false
          const resume = () => {
            resumeCleanupRef.current?.()
            resumeCleanupRef.current = null
            setPlaying(true)
          }
          const cleanup = () => {
            window.removeEventListener("pointerdown", resume)
            window.removeEventListener("keydown", resume)
          }
          resumeCleanupRef.current = cleanup
          window.addEventListener("pointerdown", resume)
          window.addEventListener("keydown", resume)
        }
        setPlaying(false)
        setBuffering(false)
      })
    }
    const url = RECITERS[track.ri].url(track.si + 1)
    if (lastUrlRef.current === url && audio.getAttribute("src")) {
      attemptPlay()
      return
    }
    lastUrlRef.current = url
    const id = ++resolveIdRef.current
    setBuffering(true)
    resolveAudioUrl(url).then((src) => {
      if (id !== resolveIdRef.current) return
      const a = audioRef.current
      if (!a) return
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
      if (src.startsWith("blob:")) blobUrlRef.current = src
      a.src = src
      setCurrentTime(0)
      setDuration(0)
      if (!playingRef.current) return
      attemptPlay()
    })
  }, [track, playing])

  const toggle = () => {
    disarmAutoplay()
    setPlaying((p) => !p)
  }

  const next = () => {
    const t = trackRef.current
    setTrack({ ri: t.ri, si: randomSurahIndex(t.si) })
  }

  const prev = () => {
    const t = trackRef.current
    setTrack({
      ri: t.ri,
      si: (t.si - 1 + SURAHS.length) % SURAHS.length,
    })
  }

  const surah = SURAHS[track.si]
  const reciter = RECITERS[track.ri]

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="region"
            aria-label="Audio player"
            className="fixed right-4 bottom-4 z-90 max-w-[calc(100vw-2rem)]"
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "130%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
              <div
                className={cn(
                  "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500",
                  reciter.bg,
                )}
              >
                <Music2 className="size-4" aria-hidden />
                {picOk && (
                  <img
                    src={reciter.pic}
                    alt=""
                    aria-hidden
                    draggable={false}
                    onError={() => setPicOk(false)}
                    className={`absolute inset-0 size-full object-cover ${reciter.pos ?? "object-center"}`}
                  />
                )}
                {buffering && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Spinner
                      className="[&_.spinner-blade]:bg-white"
                      aria-hidden
                    />
                  </span>
                )}
              </div>

              <div className="min-w-0 select-none flex-1">
                <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {surah}
                </p>
                <div className="flex min-w-0 items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <Select
                    value={String(track.ri)}
                    onValueChange={(v) =>
                      setTrack((t) => ({ ri: Number(v), si: t.si }))
                    }
                  >
                    <SelectTrigger
                      aria-label="Choose reciter"
                      className="h-auto w-auto min-w-0 max-w-full gap-1 rounded border-0 bg-transparent p-0 text-[11px] shadow-none focus:ring-0 focus:ring-offset-0 dark:bg-transparent [&>svg]:size-3 [&>span]:truncate"
                    >
                      {RECITERS[track.ri].name}
                    </SelectTrigger>
                    <SelectContent
                      side="top"
                      sideOffset={20}
                      className="w-69 border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      {RECITERS.map((r, i) => (
                        <SelectItem
                          key={r.name}
                          value={String(i)}
                          className="focus:bg-zinc-100 focus:text-zinc-900 dark:focus:bg-zinc-900 dark:focus:text-zinc-100"
                        >
                          <span className="flex items-center gap-2">
                            <img
                              src={r.pic}
                              alt=""
                              aria-hidden
                              draggable={false}
                              className={`size-5 shrink-0 rounded-full object-cover ${r.pos ?? ""}`}
                            />
                            {r.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="shrink-0 tabular-nums">
                    · {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  aria-label="Previous surah"
                  onClick={prev}
                  className={iconButtonClassName}
                >
                  <SkipBack className="size-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={playing ? "Pause" : "Play"}
                  onClick={toggle}
                  className={cn(
                    iconButtonClassName,
                    "text-zinc-900 dark:text-zinc-100",
                  )}
                >
                  {playing ? (
                    <Pause className="size-3.5" aria-hidden />
                  ) : (
                    <Play
                      className="size-3.5 translate-x-px"
                      aria-hidden
                    />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Next surah"
                  onClick={next}
                  className={iconButtonClassName}
                >
                  <SkipForward className="size-3.5" aria-hidden />
                </button>
              </div>

              <button
                type="button"
                aria-label="Close player"
                onClick={() => setOpen(false)}
                className={iconButtonClassName}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            aria-label="Open player"
            onClick={() => setOpen(true)}
            className="fixed right-4 bottom-4 z-90 flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 shadow-lg transition hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:text-zinc-100"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Image src="/quran.png" alt="Quran" width={20} height={20} aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
