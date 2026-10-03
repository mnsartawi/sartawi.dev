const CACHE_NAME = "quran-audio-v1"
const MAX_ENTRIES = 15


export async function resolveAudioUrl(
  url: string,
  store = true,
): Promise<string> {
  try {
    if (typeof caches === "undefined") return url
    const cache = await caches.open(CACHE_NAME)
    const hit = await cache.match(url)
    if (hit) {
      return URL.createObjectURL(await hit.blob())
    }
    if (!store) return url
    fetch(url)
      .then(async (response) => {
        if (!response.ok) return
        try {
          await cache.put(url, response.clone())
          const keys = await cache.keys()
          if (keys.length > MAX_ENTRIES) {
            await Promise.all(
              keys
                .slice(0, keys.length - MAX_ENTRIES)
                .map((key) => cache.delete(key)),
            )
          }
        } catch {

        }
      })
      .catch(() => {

      })
    return url
  } catch {
    return url
  }
}
