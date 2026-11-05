import { cn } from 'cn'
import KitPreview from '~/components/kit_preview'

interface KitPreviewAsideProps {
  name: string
  grade: string
  scale: string
  manufacturer: string
  status: string
  photoUrl?: string | null
  photoCount: number
  description?: string
  className?: string
}

/** The shelf card as it will appear, redrawn on every keystroke and photo reorder. */
export function KitPreviewAside({
  name,
  grade,
  scale,
  manufacturer,
  status,
  photoUrl,
  photoCount,
  description = 'Saved to your repository as a build.gunpla.kit record; photos upload to the same server.',
  className,
}: KitPreviewAsideProps) {
  return (
    <aside aria-labelledby="preview-heading" className={cn('h-fit lg:sticky lg:top-24', className)}>
      <h2 id="preview-heading" className="mb-4 text-lead font-bold">
        On your shelf
      </h2>
      <KitPreview
        name={name}
        grade={grade}
        scale={scale}
        manufacturer={manufacturer}
        status={status}
        photoUrl={photoUrl}
        photoCount={photoCount}
      />
      <p className="mt-4 text-[15px]">{description}</p>
    </aside>
  )
}
