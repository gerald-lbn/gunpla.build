import { useState, useRef, useEffect, useMemo } from 'react'
import AppLayout from '~/layouts/app'
import Page from '~/components/page'
import KitCard from '~/components/kit_card'
import { Form, Link } from '@adonisjs/inertia/react'
import { ImagePlus, Eye, Trash2, Star } from 'lucide-react'
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
      return [
        {
          kind: 'existing' as const,
          id: kit.photoCid,
          cid: kit.photoCid,
          url: kit.photoUrl,
        },
      ]
    }
    return []
  }, [kit.photos, kit.photoCid, kit.photoUrl])

  const [photos, setPhotos] = useState<PhotoEntry[]>(initialPhotos)

  const hiddenFileInputRef = useRef<HTMLInputElement>(null)
  const pickerInputRef = useRef<HTMLInputElement>(null)

  // Keep hidden file input in sync with new photos for form submission
  useEffect(() => {
    if (typeof DataTransfer !== 'undefined' && hiddenFileInputRef.current) {
      const dt = new DataTransfer()
      for (const p of photos) {
        if (p.kind === 'new') {
          dt.items.add(p.file)
        }
      }
      hiddenFileInputRef.current.files = dt.files
    }
  }, [photos])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.kind === 'new') {
          URL.revokeObjectURL(p.previewUrl)
        }
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
      if (target && target.kind === 'new') {
        URL.revokeObjectURL(target.previewUrl)
      }
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

  const openPicker = () => {
    pickerInputRef.current?.click()
  }

  const activeCoverUrl = photos[0]
    ? photos[0].kind === 'existing'
      ? photos[0].url
      : photos[0].previewUrl
    : null

  return (
    <Page title={`Edit ${kit.name}`}>
      <div className="kit-form-grid">
        <div>
          <Form
            route="kits.update"
            routeParams={[kit.rkey]}
            method="put"
            encType="multipart/form-data"
          >
            {({ errors, processing }) => (
              <div className="form">
                {/* Flag indicating photo list was managed */}
                <input type="hidden" name="photosSubmitted" value="true" />

                {/* Retained existing photo CIDs in order */}
                {photos
                  .filter(
                    (p): p is Extract<PhotoEntry, { kind: 'existing' }> => p.kind === 'existing'
                  )
                  .map((p) => (
                    <input key={p.id} type="hidden" name="existingPhotos[]" value={p.cid} />
                  ))}

                {/* Hidden file input synchronized with new photos */}
                <input
                  ref={hiddenFileInputRef}
                  type="file"
                  name="photos[]"
                  multiple
                  style={{ display: 'none' }}
                  aria-invalid={errors.photos ? 'true' : 'false'}
                />

                {/* Picker input to select photos */}
                <input
                  ref={pickerInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFilesAdded}
                />

                <div className="field">
                  <label className="field__label" htmlFor="name">
                    Name <span aria-hidden>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="field__input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    required
                  />
                  {errors.name && <span className="field__error">{errors.name}</span>}
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="grade">
                    Grade
                  </label>
                  <input
                    id="grade"
                    name="grade"
                    type="text"
                    className="field__input"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="HG, RG, MG, PG, MGSD…"
                    aria-invalid={errors.grade ? 'true' : 'false'}
                  />
                  {errors.grade && <span className="field__error">{errors.grade}</span>}
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="scale">
                    Scale
                  </label>
                  <input
                    id="scale"
                    name="scale"
                    type="text"
                    className="field__input"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    placeholder="1/144"
                    aria-invalid={errors.scale ? 'true' : 'false'}
                  />
                  {errors.scale && <span className="field__error">{errors.scale}</span>}
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="status">
                    Status <span aria-hidden>*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="field__input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    aria-invalid={errors.status ? 'true' : 'false'}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.status && <span className="field__error">{errors.status}</span>}
                </div>

                <div className="field">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <label className="field__label" style={{ marginBottom: 0 }}>
                      Photos ({photos.length}/20)
                    </label>
                    {photos.length < 20 && (
                      <button
                        type="button"
                        onClick={openPicker}
                        className="btn btn--secondary btn--sm"
                        style={{ padding: '3px 8px', fontSize: '12px' }}
                      >
                        <ImagePlus size={13} /> Add photos
                      </button>
                    )}
                  </div>

                  {photos.length === 0 ? (
                    <div
                      className="photo-uploader"
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
                      <ImagePlus size={26} style={{ color: 'var(--muted)' }} />
                      <span className="photo-uploader__label">Choose photos</span>
                      <span className="photo-uploader__hint">
                        PNG, JPG, WebP up to 5MB each (up to 20 photos)
                      </span>
                    </div>
                  ) : (
                    <div className="photo-gallery-uploader">
                      <div className="photo-gallery-grid">
                        {photos.map((p, idx) => {
                          const isCover = idx === 0
                          const imgUrl = p.kind === 'existing' ? p.url : p.previewUrl
                          return (
                            <div
                              key={p.id}
                              className={`photo-gallery-item ${
                                isCover ? 'photo-gallery-item--cover' : ''
                              }`}
                            >
                              <img src={imgUrl} alt="" className="photo-gallery-item__img" />
                              {isCover && (
                                <span className="photo-gallery-item__cover-badge mono">Cover</span>
                              )}
                              <div className="photo-gallery-item__actions">
                                {!isCover && (
                                  <button
                                    type="button"
                                    className="photo-gallery-item__btn"
                                    onClick={() => handleMakeCover(p.id)}
                                    title="Set as shelf cover"
                                  >
                                    <Star size={12} /> Set cover
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="photo-gallery-item__btn photo-gallery-item__btn--remove"
                                  onClick={() => handleRemovePhoto(p.id)}
                                  title="Remove photo"
                                >
                                  <Trash2 size={12} /> Remove
                                </button>
                              </div>
                            </div>
                          )
                        })}

                        {photos.length < 20 && (
                          <button
                            type="button"
                            className="photo-gallery-add"
                            onClick={openPicker}
                            title="Add more photos"
                          >
                            <ImagePlus size={20} />
                            <span className="photo-gallery-add__text">Add photo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {errors.photos && <span className="field__error">{errors.photos}</span>}
                  <span className="field__hint">
                    The first photo is used as your kit&apos;s shelf cover. Hover over a photo to
                    set it as cover or remove it.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn--primary" disabled={processing}>
                    {processing ? 'Saving…' : 'Save changes'}
                  </button>
                  <Link route="dashboard" className="btn btn--secondary">
                    Cancel
                  </Link>
                </div>
              </div>
            )}
          </Form>

          <div className="danger-box">
            <h3 className="danger-box__title">Danger Zone</h3>
            <p className="danger-box__desc">
              Deleting this kit permanently removes it from your shelf and deletes the record from
              your ATProto repository.
            </p>

            {!confirmDelete ? (
              <button
                type="button"
                className="btn btn--danger-outline btn--sm"
                onClick={() => setConfirmDelete(true)}
              >
                Delete kit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Form route="kits.destroy" routeParams={[kit.rkey]} method="delete">
                  {({ processing }) => (
                    <button type="submit" className="btn btn--danger btn--sm" disabled={processing}>
                      {processing ? 'Deleting…' : 'Confirm delete'}
                    </button>
                  )}
                </Form>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="preview-pane">
          <div className="preview-pane__title">
            <Eye size={13} /> Shelf card preview
          </div>
          <KitCard
            name={name}
            grade={grade}
            scale={scale}
            status={status}
            photoUrl={activeCoverUrl}
            photoCount={photos.length}
            isPreview
          />
          <p className="field__hint" style={{ fontSize: '12px', marginTop: 4 }}>
            Live preview of this kit on your shelf and in community feeds.
          </p>
        </aside>
      </div>
    </Page>
  )
}

KitsEdit.layout = [AppLayout]
