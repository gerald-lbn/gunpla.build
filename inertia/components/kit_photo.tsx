import { useState } from 'react'
import { cn } from 'cn'

/**
 * A kit's cover photo, cut like an armour plate. The grade and scale sit in the top
 * left cut, the way the grade logo sits on a Gunpla box. Without a photo, or when the
 * builder's server does not answer, the frame shows an empty runner instead of a
 * broken image.
 */
export function KitPhoto({
  src,
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
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed
  const hasPlate = plate && (grade || scale)

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-raised',
        cut,
        fit === 'natural' && !showImage && 'aspect-[4/5]',
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onError={() => setFailed(true)}
          className={cn(
            fit === 'cover' ? 'absolute inset-0 size-full object-cover' : 'block h-auto w-full',
            imgClassName
          )}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-end">
          <Runner className="absolute inset-0 size-full text-control" />
          <span className="relative p-4 text-xs text-muted-foreground">
            {failed ? "The builder's server didn't return this photo" : 'No photo yet'}
          </span>
        </div>
      )}

      {hasPlate && (
        <span className="pointer-events-none absolute top-0 left-0 inline-flex h-7 items-center gap-1.5 bg-black/80 pr-2.5 pl-4 text-white">
          {grade && <span className="font-brand text-[13px] font-semibold">{grade}</span>}
          {scale && <span className="text-xs text-white/70 num">{scale}</span>}
        </span>
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
