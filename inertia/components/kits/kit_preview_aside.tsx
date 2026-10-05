import { cn } from 'cn'
import { Eye } from 'lucide-react'
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

export function KitPreviewAside({
  name,
  grade,
  scale,
  manufacturer,
  status,
  photoUrl,
  photoCount,
  description = 'This card updates in real time as you fill out kit details and organize your photos.',
  className,
}: KitPreviewAsideProps) {
  return (
    <aside className={cn('sticky top-20 flex h-fit flex-col gap-3', className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Eye className="size-3.5" />
        Shelf card preview
      </div>
      <KitPreview
        name={name}
        grade={grade}
        scale={scale}
        manufacturer={manufacturer}
        status={status}
        photoUrl={photoUrl}
        photoCount={photoCount}
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </aside>
  )
}
