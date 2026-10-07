import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Photo = { thumbUrl: string; fullUrl: string }

function bgStyle(src: string, size: 'cover' | 'contain' = 'contain'): CSSProperties {
  if (src.startsWith('http') || src.startsWith('/')) {
    return {
      backgroundImage: `url(${src})`,
      backgroundSize: size,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return { background: src }
}

export function PhotoCarousel({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length)
  const next = () => setIndex((i) => (i + 1) % photos.length)

  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [index])

  const current = photos[index]

  return (
    <div className="flex h-full flex-col">
      {/* Main photo */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
        <div
          className="absolute inset-0 scale-110 blur-xl opacity-60"
          style={current ? bgStyle(current.thumbUrl, 'cover') : undefined}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={current ? bgStyle(current.fullUrl, 'contain') : undefined}
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute top-1/2 left-2 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded border-2 border-black bg-background/90 shadow-[2px_2px_0_0_#000] transition-all hover:translate-x-px hover:translate-y-[calc(-50%+1px)] hover:shadow-none"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute top-1/2 right-2 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded border-2 border-black bg-background/90 shadow-[2px_2px_0_0_#000] transition-all hover:-translate-x-px hover:translate-y-[calc(-50%+1px)] hover:shadow-none"
              aria-label="Next photo"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}

        {photos.length > 1 && (
          <div className="absolute bottom-2 right-2 z-10 rounded border-2 border-black bg-background/90 px-2 py-0.5 font-head text-xs font-bold shadow-[2px_2px_0_0_#000]">
            {index + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex shrink-0 gap-2 overflow-x-auto border-t-2 border-border bg-card p-2">
          {photos.map((photo, i) => (
            <button
              key={i}
              ref={(el) => {
                thumbRefs.current[i] = el
              }}
              type="button"
              onClick={() => setIndex(i)}
              className={`size-10 shrink-0 overflow-hidden rounded border-2 transition-all ${
                i === index
                  ? 'border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-border opacity-60 hover:opacity-100'
              }`}
              aria-label={`Photo ${i + 1}`}
            >
              <div className="size-full" style={bgStyle(photo.thumbUrl)} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
