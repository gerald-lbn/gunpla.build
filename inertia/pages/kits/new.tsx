import { useState, useRef, useEffect } from 'react'
import AppLayout from '~/layouts/app'
import Page from '~/components/page'
import KitCard from '~/components/kit_card'
import { Form, Link } from '@adonisjs/inertia/react'
import { ImagePlus, Eye, X } from 'lucide-react'

const STATUSES = ['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const

export default function KitsNew() {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [scale, setScale] = useState('')
  const [status, setStatus] = useState<string>('backlog')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setFileName(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleClearPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFileName(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  return (
    <Page title="Add kit">
      <div className="kit-form-grid">
        <Form route="kits.store" encType="multipart/form-data">
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
                  Cover photo
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
                        title="Remove photo"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="photo-uploader__label">Choose cover image</span>
                      <span className="photo-uploader__hint">
                        PNG, JPG, WebP up to 5MB (box art or finished kit)
                      </span>
                    </>
                  )}
                </div>
                {errors.photo && <span className="field__error">{errors.photo}</span>}
                <span className="field__hint">
                  The first photo on your ATProto record is used as your kit&apos;s shelf cover.
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
            status={status}
            photoUrl={previewUrl}
            isPreview
          />
          <p className="field__hint" style={{ fontSize: '12px', marginTop: 4 }}>
            This card updates in real time as you fill out the kit details and upload a photo.
          </p>
        </aside>
      </div>
    </Page>
  )
}

KitsNew.layout = [AppLayout]
