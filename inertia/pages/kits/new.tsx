import { useState, useRef, useEffect } from 'react'
import AppLayout from '~/layouts/app'
import Page from '~/components/page'
import KitPreview from '~/components/kit_preview'
import { Form } from '@adonisjs/inertia/react'
import { ImagePlus, Eye, Trash2, Star } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from '~/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { DatePicker } from '~/components/ui/date_picker'

const STATUSES = ['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const

interface SelectedPhoto {
  id: string
  file: File
  previewUrl: string
}

export default function KitsNew() {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [scale, setScale] = useState('')
  const [manufacturer, setManufacturer] = useState('Bandai')
  const [acquiredAt, setAcquiredAt] = useState('')
  const [status, setStatus] = useState<string>('backlog')
  const [photos, setPhotos] = useState<SelectedPhoto[]>([])

  const hiddenFileInputRef = useRef<HTMLInputElement>(null)
  const pickerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof DataTransfer !== 'undefined' && hiddenFileInputRef.current) {
      const dt = new DataTransfer()
      for (const p of photos) dt.items.add(p.file)
      hiddenFileInputRef.current.files = dt.files
    }
  }, [photos])

  useEffect(() => {
    return () => photos.forEach((p) => URL.revokeObjectURL(p.previewUrl))
  }, [photos])

  const handleFilesAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return
    const newPhotos: SelectedPhoto[] = []
    const remainingSlots = 20 - photos.length
    for (let i = 0; i < Math.min(fileList.length, remainingSlots); i++) {
      const file = fileList[i]
      newPhotos.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }
    setPhotos((prev) => [...prev, ...newPhotos])
    e.target.value = ''
  }

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  const handleMakeCover = (id: string) => {
    setPhotos((prev) => {
      const index = prev.findIndex((p) => p.id === id)
      if (index <= 0) return prev
      const item = prev[index]
      const next = [...prev]
      next.splice(index, 1)
      next.unshift(item)
      return next
    })
  }

  const openPicker = () => pickerInputRef.current?.click()

  return (
    <Page title="Add kit" back={{ route: 'shelf', label: 'My shelf' }}>
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <Form route="kits.store" encType="multipart/form-data">
          {({ errors, processing }) => (
            <>
              <input
                ref={hiddenFileInputRef}
                type="file"
                name="photos[]"
                multiple
                className="hidden"
              />
              <input
                ref={pickerInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFilesAdded}
              />

              <FieldGroup>
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. Hi-Nu Gundam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={errors.name ? 'true' : undefined}
                    required
                  />
                  <FieldError>{errors.name}</FieldError>
                </Field>

                <Field data-invalid={!!errors.grade}>
                  <FieldLabel htmlFor="grade">Grade</FieldLabel>
                  <Input
                    id="grade"
                    name="grade"
                    type="text"
                    placeholder="HG, RG, MG, PG, MGSD…"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    aria-invalid={errors.grade ? 'true' : undefined}
                  />
                  <FieldError>{errors.grade}</FieldError>
                </Field>

                <Field data-invalid={!!errors.scale}>
                  <FieldLabel htmlFor="scale">Scale</FieldLabel>
                  <Input
                    id="scale"
                    name="scale"
                    type="text"
                    placeholder="1/144, 1/100…"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    aria-invalid={errors.scale ? 'true' : undefined}
                  />
                  <FieldError>{errors.scale}</FieldError>
                </Field>

                <Field data-invalid={!!errors.manufacturer}>
                  <FieldLabel htmlFor="manufacturer">Manufacturer</FieldLabel>
                  <Input
                    id="manufacturer"
                    name="manufacturer"
                    type="text"
                    placeholder="Bandai, SNAA…"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    aria-invalid={errors.manufacturer ? 'true' : undefined}
                  />
                  <FieldError>{errors.manufacturer}</FieldError>
                </Field>

                <Field data-invalid={!!errors.acquiredAt}>
                  <FieldLabel htmlFor="acquiredAt">Acquired date</FieldLabel>
                  <DatePicker
                    id="acquiredAt"
                    name="acquiredAt"
                    value={acquiredAt}
                    onChange={setAcquiredAt}
                    placeholder="Pick a date"
                    aria-invalid={errors.acquiredAt ? 'true' : undefined}
                  />
                  <FieldError>{errors.acquiredAt}</FieldError>
                  <FieldDescription>When you bought or received this kit.</FieldDescription>
                </Field>

                <Field data-invalid={!!errors.status}>
                  <FieldLabel htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select value={status} onValueChange={(v) => v && setStatus(v)} name="status">
                    <SelectTrigger
                      id="status"
                      className="w-full"
                      aria-invalid={errors.status ? 'true' : undefined}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.status}</FieldError>
                </Field>

                <Field data-invalid={!!errors.photos}>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Photos ({photos.length}/20)</FieldLabel>
                    {photos.length > 0 && photos.length < 20 && (
                      <Button type="button" variant="outline" size="sm" onClick={openPicker}>
                        <ImagePlus />
                        <span>Add more</span>
                      </Button>
                    )}
                  </div>

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
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {photos.map((p, idx) => {
                        const isCover = idx === 0
                        return (
                          <div
                            key={p.id}
                            className="group relative aspect-square overflow-hidden border border-border"
                          >
                            <img src={p.previewUrl} alt="" className="size-full object-cover" />
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
                                  variant="secondary"
                                  onClick={() => handleMakeCover(p.id)}
                                >
                                  <Star />
                                  <span>Set cover</span>
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="xs"
                                variant="destructive"
                                onClick={() => handleRemovePhoto(p.id)}
                              >
                                <Trash2 />
                                <span>Remove</span>
                              </Button>
                            </div>
                          </div>
                        )
                      })}
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
                  )}

                  <FieldError>{errors.photos}</FieldError>
                  <FieldDescription>
                    The first photo is used as your kit&apos;s shelf cover. Hover over a photo to
                    set it as cover or remove it.
                  </FieldDescription>
                </Field>

                <div className="flex gap-2 pt-1">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Adding…' : 'Add kit'}
                  </Button>
                </div>
              </FieldGroup>
            </>
          )}
        </Form>

        <aside className="sticky top-20 flex h-fit flex-col gap-3">
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
            photoUrl={photos[0]?.previewUrl ?? null}
            photoCount={photos.length}
          />
          <p className="text-xs text-muted-foreground">
            This card updates in real time as you fill out kit details and organize your photos.
          </p>
        </aside>
      </div>
    </Page>
  )
}

KitsNew.layout = [AppLayout]
