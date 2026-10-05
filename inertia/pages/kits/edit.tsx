import { useState, useRef, useEffect, useMemo } from 'react'
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
import type { InertiaProps } from '~/types'

const STATUSES = ['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const

type PhotoItem = {
  cid: string
  thumbUrl: string
  fullUrl: string
}

type KitEditData = {
  rkey: string
  uri: string
  name: string
  grade: string
  scale: string
  manufacturer?: string | null
  acquiredAt?: string | null
  status: string
  photoCid?: string | null
  photoUrl?: string | null
  photos?: PhotoItem[]
}

type PageProps = InertiaProps<{ kit: KitEditData }>

type PhotoEntry =
  | { kind: 'existing'; id: string; cid: string; url: string }
  | { kind: 'new'; id: string; file: File; previewUrl: string }

export default function KitsEdit({ kit }: PageProps) {
  const [name, setName] = useState(kit.name)
  const [grade, setGrade] = useState(kit.grade)
  const [scale, setScale] = useState(kit.scale)
  const [manufacturer, setManufacturer] = useState(kit.manufacturer ?? '')
  const [acquiredAt, setAcquiredAt] = useState(kit.acquiredAt ?? '')
  const [status, setStatus] = useState<string>(kit.status)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const initialPhotos: PhotoEntry[] = useMemo(() => {
    if (kit.photos && kit.photos.length > 0) {
      return kit.photos.map((p) => ({
        kind: 'existing' as const,
        id: p.cid,
        cid: p.cid,
        url: p.thumbUrl,
      }))
    }
    if (kit.photoCid && kit.photoUrl) {
      return [{ kind: 'existing' as const, id: kit.photoCid, cid: kit.photoCid, url: kit.photoUrl }]
    }
    return []
  }, [kit.photos, kit.photoCid, kit.photoUrl])

  const [photos, setPhotos] = useState<PhotoEntry[]>(initialPhotos)

  const hiddenFileInputRef = useRef<HTMLInputElement>(null)
  const pickerInputRef = useRef<HTMLInputElement>(null)

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
    setPhotos((prev) => [...prev, ...newPhotos])
    e.target.value = ''
  }

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target && target.kind === 'new') URL.revokeObjectURL(target.previewUrl)
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

  const activeCoverUrl = photos[0]
    ? photos[0].kind === 'existing'
      ? photos[0].url
      : photos[0].previewUrl
    : null

  return (
    <Page title={`Edit ${kit.name}`} back={{ route: 'shelf', label: 'My shelf' }}>
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <Form
          className="lg:col-start-1 lg:row-start-1"
          route="kits.update"
          routeParams={[kit.rkey]}
          method="put"
          encType="multipart/form-data"
        >
          {({ errors, processing }) => (
            <>
              <input type="hidden" name="photosSubmitted" value="true" />
              {photos
                .filter(
                  (p): p is Extract<PhotoEntry, { kind: 'existing' }> => p.kind === 'existing'
                )
                .map((p) => (
                  <input key={p.id} type="hidden" name="existingPhotos[]" value={p.cid} />
                ))}
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
                        const imgUrl = p.kind === 'existing' ? p.url : p.previewUrl
                        return (
                          <div
                            key={p.id}
                            className="group relative aspect-square overflow-hidden border border-border"
                          >
                            <img src={imgUrl} alt="" className="size-full object-cover" />
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
                    {processing ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </FieldGroup>
            </>
          )}
        </Form>

        <aside className="sticky top-20 flex h-fit flex-col gap-3 lg:col-start-2 lg:row-start-1 lg:row-span-2">
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
            photoUrl={activeCoverUrl}
            photoCount={photos.length}
          />
          <p className="text-xs text-muted-foreground">
            Live preview of this kit on your shelf and in community feeds.
          </p>
        </aside>

        <div className="border border-destructive/30 p-4 lg:col-start-1 lg:row-start-2">
          <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
          <p className="mt-1 mb-4 text-xs text-muted-foreground">
            Deleting this kit permanently removes it from your shelf and deletes the record from
            your ATProto repository.
          </p>
          {!confirmDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              Delete kit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Form route="kits.destroy" routeParams={[kit.rkey]} method="delete">
                {({ processing }) => (
                  <Button type="submit" variant="destructive" size="sm" disabled={processing}>
                    {processing ? 'Deleting…' : 'Confirm delete'}
                  </Button>
                )}
              </Form>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}

KitsEdit.layout = [AppLayout]
