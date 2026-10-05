import { useEffect, useState, useRef } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from 'cn'
import { transmit } from '~/services/transmit'
import { Button } from '~/components/ui/button'
import { KitFeedCard } from './kit_feed_card'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>

interface LiveFeedProps {
  kits: KitRow[]
  isSignedIn: boolean
}

export function LiveFeed({ kits, isSignedIn }: LiveFeedProps) {
  const [isLive, setIsLive] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const feedContainerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [newlyInsertedUri, setNewlyInsertedUri] = useState<string | null>(null)
  const prevLatestUriRef = useRef<string | null>(kits[0]?.uri ?? null)

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
          onFinish: () => setTimeout(() => setIsUpdating(false), 800),
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
    if (kits.length > 0) {
      const latestUri = kits[0].uri
      if (prevLatestUriRef.current && prevLatestUriRef.current !== latestUri) {
        setNewlyInsertedUri(latestUri)
        feedContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        setCurrentIndex(0)
        const t = setTimeout(() => setNewlyInsertedUri(null), 4000)
        prevLatestUriRef.current = latestUri
        return () => clearTimeout(t)
      }
      prevLatestUriRef.current = latestUri
    }
  }, [kits])

  useEffect(() => {
    if (isPaused || kits.length <= 1) return

    const interval = setInterval(() => {
      const el = feedContainerRef.current
      if (!el) return

      const firstCard = el.firstElementChild as HTMLElement | null
      const cardHeight = firstCard?.offsetHeight || 0
      const gap = 12
      const step = cardHeight + gap
      const maxScroll = el.scrollHeight - el.clientHeight

      if (el.scrollTop + step >= maxScroll - 8) {
        el.scrollTo({ top: 0, behavior: 'smooth' })
        setCurrentIndex(0)
      } else {
        el.scrollBy({ top: step, behavior: 'smooth' })
        setCurrentIndex((prev) => (prev + 1) % kits.length)
      }
    }, 4500)

    return () => clearInterval(interval)
  }, [isPaused, kits.length])

  const scrollToIndex = (index: number) => {
    const el = feedContainerRef.current
    if (!el) return
    const targetCard = el.children[index] as HTMLElement | null
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      setCurrentIndex(index)
    }
  }

  const handlePrev = () => scrollToIndex((currentIndex - 1 + kits.length) % kits.length)
  const handleNext = () => scrollToIndex((currentIndex + 1) % kits.length)

  const handleScroll = () => {
    const el = feedContainerRef.current
    if (!el || kits.length === 0) return
    const firstCard = el.firstElementChild as HTMLElement | null
    const cardHeight = (firstCard?.offsetHeight || 1) + 12
    const idx = Math.round(el.scrollTop / cardHeight)
    setCurrentIndex(Math.min(Math.max(0, idx), kits.length - 1))
  }

  return (
    <div
      id="live-feed"
      className="flex w-full justify-center lg:h-136 lg:w-full lg:items-center lg:justify-stretch"
    >
      <div className="relative h-128 w-full max-w-152 shrink-0 sm:h-136 lg:w-full lg:max-w-none">
        {/* Offset solid backdrop */}
        <div className="absolute -top-2 -left-2 right-2 bottom-2 border-2 border-border bg-primary" />

        {/* Main Window Card */}
        <div className="relative flex h-full w-full flex-col overflow-hidden border-2 border-border bg-card shadow-[4px_4px_0_0_var(--border)]">
          {/* Window Header */}
          <div className="flex shrink-0 items-center justify-between border-b-2 border-border bg-muted px-3.5 py-2">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border border-border bg-destructive" />
                <span className="size-2.5 rounded-full border border-border bg-primary" />
                <span className="size-2.5 rounded-full border border-border bg-[#22c55e]" />
              </span>
              <span className="h-4 w-px shrink-0 bg-border" aria-hidden="true" />
              <span className="font-head text-[0.7rem] font-bold tracking-[0.12em] text-foreground uppercase">
                Live Builds Feed
              </span>
            </div>

            <div className="flex items-center gap-2">
              {kits.length > 1 && (
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground mr-1">
                    {currentIndex + 1}/{kits.length}
                  </span>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous build"
                    className="size-5 flex items-center justify-center border border-border bg-background hover:bg-muted font-bold text-foreground transition-colors cursor-pointer"
                  >
                    <ChevronUp className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next build"
                    className="size-5 flex items-center justify-center border border-border bg-background hover:bg-muted font-bold text-foreground transition-colors cursor-pointer"
                  >
                    <ChevronDown className="size-3" />
                  </button>
                </div>
              )}

              {isLive && (
                <span
                  className={cn(
                    'flex items-center gap-1.5 border border-border px-2 py-0.5 font-mono text-[10px] font-bold transition-colors',
                    isUpdating ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      isUpdating ? 'bg-primary-foreground animate-ping' : 'bg-[#22c55e]'
                    )}
                  />
                  {isUpdating ? 'Updating…' : 'Live'}
                </span>
              )}
            </div>
          </div>

          {/* Window Body */}
          <div
            ref={feedContainerRef}
            onScroll={handleScroll}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-muted/20 p-3 snap-y snap-mandatory scroll-smooth scroll-py-3"
          >
            {kits.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <p className="font-head text-sm font-bold text-foreground">No builds logged yet</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Be the first builder to log a kit!
                </p>
                <div className="mt-3">
                  <Button size="xs" render={<Link route={isSignedIn ? 'shelf' : 'login'} />}>
                    Log a kit
                  </Button>
                </div>
              </div>
            ) : (
              kits.map((kit) => (
                <KitFeedCard
                  key={kit.uri}
                  kit={kit}
                  isNewlyInserted={kit.uri === newlyInsertedUri}
                />
              ))
            )}
          </div>

          {/* Window Footer */}
          <div className="flex shrink-0 items-center justify-between border-t-2 border-border bg-muted px-3.5 py-2 font-mono text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>
                {kits.length} build{kits.length === 1 ? '' : 's'}
              </span>
              {kits.length > 1 && (
                <>
                  <span>·</span>
                  <span>{isPaused ? 'Paused' : 'Auto-scrolling'}</span>
                </>
              )}
            </div>
            <span className="font-head text-[10px] font-bold text-muted-foreground">
              Live via ATProto
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
