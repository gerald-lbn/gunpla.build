import { useState, useEffect, useRef } from 'react'
import { cn } from 'cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Photo = { thumbUrl: string; fullUrl: string }

/**
 * The build's photos on black, shown whole (never cropped) so panel lines and
 * decals read as the builder shot them. Arrow keys step through them.
 */
export function PhotoCarousel({ photos, alt }: { photos: Photo[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const count = photos.length

  const prev = () => setIndex((i) => (i - 1 + count) % count)
  const next = () => setIndex((i) => (i + 1) % count)

  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [index])

  const current = photos[index]

  if (!current) {
    return (
      <div className="flex h-full items-center justify-center bg-black p-6 text-center text-sm text-faint">
        This build has no photos yet.
      </div>
    )
  }

  return (
    <div
      className="flex h-full flex-col bg-black"
      onKeyDown={(e) => {
        if (count < 2) return
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
      }}
    >
      <div className="relative min-h-0 flex-1">
        <img
          key={current.fullUrl}
          src={current.fullUrl}
          alt={count > 1 ? `${alt}, photo ${index + 1} of ${count}` : alt}
          className="absolute inset-0 size-full object-contain"
        />

        {count > 1 && (
          <>
            <CarouselButton side="left" onClick={prev} label="Previous photo">
              <ChevronLeft className="size-5" aria-hidden="true" />
            </CarouselButton>
            <CarouselButton side="right" onClick={next} label="Next photo">
              <ChevronRight className="size-5" aria-hidden="true" />
            </CarouselButton>
            <span className="absolute bottom-3 left-3 inline-flex h-6 items-center rounded-[2px] bg-black/70 px-2.5 text-xs font-medium text-white num">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex shrink-0 gap-2 overflow-x-auto p-3">
          {photos.map((photo, i) => (
            <button
              key={photo.thumbUrl + i}
              ref={(el) => {
                thumbRefs.current[i] = el
              }}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={cn(
                'size-12 shrink-0 overflow-hidden rounded-sm transition-opacity',
                i === index ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'
              )}
            >
              <img src={photo.thumbUrl} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CarouselButton({
  side,
  onClick,
  label,
  children,
}: {
  side: 'left' | 'right'
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'cut-xs absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center bg-black/60 text-white transition-[background-color,transform] hover:bg-black/85 active:scale-95',
        side === 'left' ? 'left-3' : 'right-3'
      )}
    >
      {children}
    </button>
  )
}
