import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { transmit } from '~/services/transmit'

/**
 * Keeps the feed's `kits` prop live: every message on the `kits` channel reloads
 * just that prop (debounced), and the newest kit is flagged for a few seconds when
 * a new one arrives at the top.
 */
export function useLiveKits(kits: { uri: string }[]) {
  const [isLive, setIsLive] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [freshUri, setFreshUri] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const latestRef = useRef<string | null>(kits[0]?.uri ?? null)

  useEffect(() => {
    const subscription = transmit.subscription('kits')
    subscription
      .create()
      .then(() => setIsLive(true))
      .catch(() => setIsLive(false))

    const stop = subscription.onMessage(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setIsUpdating(true)
        router.reload({
          only: ['kits'],
          onFinish: () => setTimeout(() => setIsUpdating(false), 600),
        })
      }, 400)
    })

    return () => {
      stop()
      subscription.delete()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const latest = kits[0]?.uri ?? null
    if (latest && latestRef.current && latestRef.current !== latest) {
      latestRef.current = latest
      setFreshUri(latest)
      const t = setTimeout(() => setFreshUri(null), 5000)
      return () => clearTimeout(t)
    }
    latestRef.current = latest
  }, [kits])

  return { isLive, isUpdating, freshUri }
}
