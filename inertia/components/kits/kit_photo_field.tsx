import { useRef, useEffect } from 'react'
import { ImagePlus, Trash2, Star } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Field, FieldLabel, FieldDescription, FieldError } from '~/components/ui/field'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type PhotoEntry =
  | { kind: 'existing'; id: string; cid: string; url: string }
  | { kind: 'new'; id: string; file: File; previewUrl: string }

export function getPhotoUrl(photo: PhotoEntry): string {
  return photo.kind === 'existing' ? photo.url : photo.previewUrl
}

function SortablePhotoItem({
  photo,
  isCover,
  onMakeCover,
  onRemove,
}: {
  photo: PhotoEntry
  isCover: boolean
  onMakeCover: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      {...attributes}
      {...listeners}
      className="group relative aspect-square cursor-grab overflow-hidden border-2 border-black active:cursor-grabbing"
    >
      <img src={getPhotoUrl(photo)} alt="" className="size-full object-cover" />
      {isCover && (
        <span className="absolute top-1 left-1 bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background">
          Cover
        </span>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        {!isCover && (
          <Button
            type="button"
            size="xs"
            variant="default"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onMakeCover}
          >
            <Star />
            <span>Set cover</span>
          </Button>
        )}
        <Button
          type="button"
          size="xs"
          variant="destructive"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onRemove}
        >
          <Trash2 />
          <span>Remove</span>
        </Button>
      </div>
    </div>
  )
}

interface KitPhotoFieldProps {
  photos: PhotoEntry[]
  onChange: (photos: PhotoEntry[]) => void
  error?: string
}

export function KitPhotoField({ photos, onChange, error }: KitPhotoFieldProps) {
  const hiddenFileInputRef = useRef<HTMLInputElement>(null)
  const pickerInputRef = useRef<HTMLInputElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    if (typeof DataTransfer !== 'undefined' && hiddenFileInputRef.current) {
      const dt = new DataTransfer()
      for (const p of photos) {
        if (p.kind === 'new') dt.items.add(p.file)
      }
      hiddenFileInputRef.current.files = dt.files
    }
  }, [photos])

  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.kind === 'new') URL.revokeObjectURL(p.previewUrl)
      })
    }
  }, [photos])

  const openPicker = () => pickerInputRef.current?.click()

  const handleFilesAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return
    const newPhotos: PhotoEntry[] = []
    const remainingSlots = 20 - photos.length
    for (let i = 0; i < Math.min(fileList.length, remainingSlots); i++) {
      const file = fileList[i]
      newPhotos.push({
        kind: 'new',
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }
    onChange([...photos, ...newPhotos])
    e.target.value = ''
  }

  const handleRemovePhoto = (id: string) => {
    const target = photos.find((p) => p.id === id)
    if (target && target.kind === 'new') URL.revokeObjectURL(target.previewUrl)
    onChange(photos.filter((p) => p.id !== id))
  }

  const handleMakeCover = (id: string) => {
    const index = photos.findIndex((p) => p.id === id)
    if (index <= 0) return
    const item = photos[index]
    const next = [...photos]
    next.splice(index, 1)
    next.unshift(item)
    onChange(next)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id)
      const newIndex = photos.findIndex((p) => p.id === over.id)
      onChange(arrayMove(photos, oldIndex, newIndex))
    }
  }

  return (
    <Field data-invalid={!!error}>
      <div className="flex items-center justify-between">
        <FieldLabel>Photos ({photos.length}/20)</FieldLabel>
        {photos.length > 0 && photos.length < 20 && (
          <Button type="button" variant="outline" size="sm" onClick={openPicker}>
            <ImagePlus />
            <span>Add more</span>
          </Button>
        )}
      </div>

      <input ref={hiddenFileInputRef} type="file" name="photos[]" multiple className="hidden" />
      <input
        ref={pickerInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFilesAdded}
      />

      {photos.length === 0 ? (
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border p-10 text-center transition-colors hover:border-ring hover:bg-muted/30"
          onClick={openPicker}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openPicker()
            }
          }}
        >
          <ImagePlus className="size-7 text-muted-foreground" />
          <span className="text-sm font-medium">Choose photos</span>
          <span className="text-xs text-muted-foreground">
            PNG, JPG, WebP up to 5MB each (up to 20 photos)
          </span>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((p, idx) => (
                <SortablePhotoItem
                  key={p.id}
                  photo={p}
                  isCover={idx === 0}
                  onMakeCover={() => handleMakeCover(p.id)}
                  onRemove={() => handleRemovePhoto(p.id)}
                />
              ))}
              {photos.length < 20 && (
                <button
                  type="button"
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
                  onClick={openPicker}
                >
                  <ImagePlus className="size-5" />
                  <span className="text-xs">Add photo</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <FieldError>{error}</FieldError>
      <FieldDescription>
        The first photo is used as your kit&apos;s shelf cover. Drag to reorder, or hover over a
        photo to set it as cover or remove it.
      </FieldDescription>
    </Field>
  )
}
