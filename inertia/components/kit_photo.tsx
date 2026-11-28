import { useMemo, useState } from 'react'
import { thumbHashToApproximateAspectRatio, thumbHashToDataURL } from 'thumbhash'
import { cn } from 'cn'
import { SpecStickers } from '~/components/stickers'

/**
 * A kit's cover photo, with the grade and scale stuck on its top-left corner as stickers,
 * the way the grade plate sits on a Gunpla box. Without a photo, or when the
 * builder's server does not answer, the frame shows an empty runner instead of a
 * broken image.
 */
export function KitPhoto({
  src,
  fallbackSrc,
  placeholder,
  alt,
  grade,
  scale,
  className,
  fit = 'cover',
  loading = 'lazy',
  imgClassName,
  cut = 'cut-md',
  plate = true,
}: {
  src?: string | null
  fallbackSrc?: string | null
  placeholder?: string | null
  alt: string
  grade?: string | null
  scale?: string | null
  className?: string
  fit?: 'cover' | 'natural'
  loading?: 'lazy' | 'eager'
  imgClassName?: string
  cut?: 'cut-xs' | 'cut-sm' | 'cut-md' | 'cut-lg' | null
  /** show the grade/scale plate in the top-left cut */
  plate?: boolean
}) {
  const [trackedSrc, setTrackedSrc] = useState(src)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  if (src !== trackedSrc) {
    setTrackedSrc(src)
    setCurrentSrc(src)
    setFailed(false)
    setLoaded(false)
  }
  const showImage = currentSrc && !failed
  const hasPlate = plate && (grade || scale)

  const blur = useMemo(() => {
    if (!placeholder) return null
    try {
      const hash = Uint8Array.from(atob(placeholder), (c) => c.charCodeAt(0))
      return { url: thumbHashToDataURL(hash), ratio: thumbHashToApproximateAspectRatio(hash) }
    } catch {
      return null
    }
  }, [placeholder])
  const blurring = Boolean(blur && showImage && !loaded)

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-raised',
        cut,
        fit === 'natural' && !showImage && 'aspect-4/5',
        className
      )}
      style={
        blurring && blur
          ? {
              backgroundImage: `url(${blur.url})`,
              backgroundSize: 'cover',
              aspectRatio: fit === 'natural' ? blur.ratio : undefined,
            }
          : undefined
      }
    >
      {showImage ? (
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (fallbackSrc && currentSrc !== fallbackSrc) {
              setCurrentSrc(fallbackSrc)
              return
            }
            setFailed(true)
          }}
          className={cn(
            fit === 'cover' ? 'absolute inset-0 size-full object-cover' : 'block h-auto w-full',
            blur && 'transition-opacity duration-500 ease-out motion-reduce:transition-none',
            blurring && 'opacity-0',
            imgClassName
          )}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-end">
          <Runner className="absolute inset-0 size-full text-control" />
          <span className="relative p-4 text-sm text-muted-foreground">
            {failed ? "The builder's server didn't return this photo" : 'No photo yet'}
          </span>
        </div>
      )}

      {hasPlate && (
        <SpecStickers
          grade={grade}
          scale={scale}
          className="pointer-events-none absolute top-3 left-3"
        />
      )}
    </div>
  )
}

/**
 * An empty runner, drawn: the frame, its sprues, and parts held on their gates.
 * Stands in for the photo a builder hasn't taken yet.
 */
function Runner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 250"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {/* frame and sprues */}
      <rect x="22" y="28" width="156" height="194" />
      <path d="M22 96h156M22 162h156M100 28v68M70 96v66M134 162v60" />
      {/* parts on their gates */}
      <g fill="var(--surface)">
        <path d="M40 46h44l6 10v24H40z" />
        <path d="M84 62h16" />
        <path d="M120 44h40v40h-40z" />
        <path d="M100 64h20" />
        <circle cx="45" cy="128" r="14" />
        <path d="M45 114V96" />
        <path d="M86 112h30l8 8v28H86z" />
        <path d="M70 130h16" />
        <path d="M140 110l20 0 0 40-20 0-6-20z" />
        <path d="M124 130h10" />
        <path d="M38 178h70v14H38z" />
        <path d="M70 162v16" />
        <path d="M150 178a12 12 0 1 1 0 24a12 12 0 1 1 0-24z" />
        <path d="M134 190h4" />
        <path d="M40 202h50v10H40z" />
        <path d="M65 192v10" />
      </g>
    </svg>
  )
}
