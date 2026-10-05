import { useState, useRef, useEffect } from 'react'
import AppLayout from '~/layouts/app'
import Page from '~/components/page'
import KitCard from '~/components/kit_card'
import { Form, Link } from '@adonisjs/inertia/react'
import { ImagePlus, Eye, X } from 'lucide-react'
import type { InertiaProps } from '~/types'

const STATUSES = ['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const

type KitEditData = {
  rkey: string
  uri: string
  name: string
  grade: string
  scale: string
  status: string
  photoCid?: string | null
  photoUrl?: string | null
}

type PageProps = InertiaProps<{ kit: KitEditData }>

export default function KitsEdit({ kit }: PageProps) {
  const [name, setName] = useState(kit.name)
  const [grade, setGrade] = useState(kit.grade)
  const [scale, setScale] = useState(kit.scale)
  const [status, setStatus] = useState<string>(kit.status)
  const [previewUrl, setPreviewUrl] = useState<string | null>(kit.photoUrl ?? null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      // If preview was an object URL, revoke it
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setFileName(null)
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(kit.photoUrl ?? null)
    }
  }

  const handleClearPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFileName(null)
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(kit.photoUrl ?? null)
  }

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
                    placeholder="HG, RG, MG, PG, MGSD..."
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
                  <label className="field__label" htmlFor="photo">
                    Update cover photo
                  </label>
                  <div className={`photo-uploader ${fileName ? 'photo-uploader--active' : ''}`}>
                    <input
                      ref={fileInputRef}
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="photo-uploader__input"
                      onChange={handlePhotoChange}
                      aria-invalid={errors.photo ? 'true' : 'false'}
                    />
                    <ImagePlus size={24} style={{ color: 'var(--muted)' }} />
                    {fileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 1 }}>
                        <span className="photo-uploader__label mono" style={{ fontSize: '12px' }}>
                          {fileName}
                        </span>
                        <button
                          type="button"
                          onClick={handleClearPhoto}
                          className="iconbtn"
                          style={{ width: 24, height: 24 }}
                          title="Reset photo"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="photo-uploader__label">
                          {kit.photoUrl ? 'Replace cover photo' : 'Choose cover image'}
                        </span>
                        <span className="photo-uploader__hint">
                          PNG, JPG, WebP up to 5MB (leave empty to keep current photo)
                        </span>
                      </>
                    )}
                  </div>
                  {errors.photo && <span className="field__error">{errors.photo}</span>}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="submit" className="btn btn--primary" disabled={processing}>
                    {processing ? 'Saving...' : 'Save changes'}
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
                      {processing ? 'Deleting...' : 'Confirm delete'}
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
            photoUrl={previewUrl}
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
