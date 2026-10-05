import { useState, useRef, useEffect } from 'react'
import AppLayout from '~/layouts/app'
import Page from '~/components/page'
import KitCard from '~/components/kit_card'
import { Form, Link } from '@adonisjs/inertia/react'
import { ImagePlus, Eye, Trash2, Star } from 'lucide-react'

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

  // Keep hidden file input in sync with state for Form submission
  useEffect(() => {
    if (typeof DataTransfer !== 'undefined' && hiddenFileInputRef.current) {
      const dt = new DataTransfer()
      for (const p of photos) {
        dt.items.add(p.file)
      }
      hiddenFileInputRef.current.files = dt.files
    }
  }, [photos])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl))
    }
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
    // Reset picker so the user can select the same file again if desired
    e.target.value = ''
  }

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) {
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

  return (
    <Page title="Add kit">
      <div className="kit-form-grid">
        <Form route="kits.store" encType="multipart/form-data">
          {({ errors, processing }) => (
            <div className="form">
              {/* Hidden file input synchronized with selected photos */}
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
                  placeholder="e.g. Hi-Nu Gundam"
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
                  placeholder="HG, RG, MG, PG, MGSD…"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
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
                  placeholder="1/144, 1/100…"
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  aria-invalid={errors.scale ? 'true' : 'false'}
                />
                {errors.scale && <span className="field__error">{errors.scale}</span>}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="manufacturer">
                  Manufacturer
                </label>
                <input
                  id="manufacturer"
                  name="manufacturer"
                  type="text"
                  className="field__input"
                  placeholder="Bandai, SNAA…"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  aria-invalid={errors.manufacturer ? 'true' : 'false'}
                />
                {errors.manufacturer && <span className="field__error">{errors.manufacturer}</span>}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="acquiredAt">
                  Acquired date
                </label>
                <input
                  id="acquiredAt"
                  name="acquiredAt"
                  type="date"
                  className="field__input"
                  value={acquiredAt}
                  onChange={(e) => setAcquiredAt(e.target.value)}
                  aria-invalid={errors.acquiredAt ? 'true' : 'false'}
                />
                {errors.acquiredAt && <span className="field__error">{errors.acquiredAt}</span>}
                <span className="field__hint">When you bought or received this kit.</span>
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
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <label className="field__label" style={{ marginBottom: 0 }}>
                    Photos ({photos.length}/20)
                  </label>
                  {photos.length > 0 && photos.length < 20 && (
                    <button
                      type="button"
                      onClick={openPicker}
                      className="btn btn--secondary btn--sm"
                      style={{ padding: '3px 8px', fontSize: '12px' }}
                    >
                      <ImagePlus size={13} /> Add more
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
                        return (
                          <div
                            key={p.id}
                            className={`photo-gallery-item ${
                              isCover ? 'photo-gallery-item--cover' : ''
                            }`}
                          >
                            <img src={p.previewUrl} alt="" className="photo-gallery-item__img" />
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
                  The first photo is used as your kit&apos;s shelf cover. Hover over a photo to set
                  it as cover or remove it.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="submit" className="btn btn--primary" disabled={processing}>
                  {processing ? 'Adding…' : 'Add kit'}
                </button>
                <Link route="dashboard" className="btn btn--secondary">
                  Cancel
                </Link>
              </div>
            </div>
          )}
        </Form>

        <aside className="preview-pane">
          <div className="preview-pane__title">
            <Eye size={13} /> Shelf card preview
          </div>
          <KitCard
            name={name}
            grade={grade}
            scale={scale}
            manufacturer={manufacturer}
            status={status}
            photoUrl={photos[0]?.previewUrl ?? null}
            photoCount={photos.length}
            isPreview
          />
          <p className="field__hint" style={{ fontSize: '12px', marginTop: 4 }}>
            This card updates in real time as you fill out kit details and organize your photos.
          </p>
        </aside>
      </div>
    </Page>
  )
}

KitsNew.layout = [AppLayout]
