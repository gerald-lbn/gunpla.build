import { useState, useMemo } from 'react'
import BaseLayout from '~/layouts/base'
import Page from '~/components/page'
import { Form, Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import type { InertiaProps } from '~/types'
import {
  KitDetailsFields,
  KitStatusField,
  type KitFormValues,
} from '~/components/kits/kit_form_fields'
import { KitPhotoField, type PhotoEntry, getPhotoUrl } from '~/components/kits/kit_photo_field'
import { KitPreviewAside } from '~/components/kits/kit_preview_aside'
import { FormSection } from '~/components/kits/form_section'

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

export default function KitsEdit({ kit }: PageProps) {
  const [values, setValues] = useState<KitFormValues>({
    name: kit.name,
    grade: kit.grade,
    scale: kit.scale,
    manufacturer: kit.manufacturer ?? '',
    acquiredAt: kit.acquiredAt ?? '',
    status: kit.status,
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleChange = (field: keyof KitFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }))

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

  return (
    <div className="column pt-10 md:pt-14">
      <Page
        title={`Edit ${kit.name}`}
        description="Changes are written back to the kit's record in your repository."
        back={{ route: 'shelf', label: 'My shelf' }}
      >
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-8">
            <Form
              route="kits.update"
              routeParams={[kit.rkey]}
              method="put"
              encType="multipart/form-data"
            >
              {({ errors, processing }) => (
                <div className="flex flex-col gap-2">
                  <input type="hidden" name="photosSubmitted" value="true" />
                  {photos
                    .filter(
                      (p): p is Extract<PhotoEntry, { kind: 'existing' }> => p.kind === 'existing'
                    )
                    .map((p) => (
                      <input key={p.id} type="hidden" name="existingPhotos[]" value={p.cid} />
                    ))}
                  <FormSection
                    id="details"
                    title="The kit"
                    description="As printed on the box. Only the name is required."
                  >
                    <KitDetailsFields values={values} onChange={handleChange} errors={errors} />
                  </FormSection>
                  <FormSection
                    id="status"
                    title="Build status"
                    description="Where this kit is right now."
                  >
                    <KitStatusField values={values} onChange={handleChange} errors={errors} />
                  </FormSection>
                  <FormSection
                    id="photos"
                    title="Photos"
                    description="Removed photos are dropped from the record when you save."
                  >
                    <KitPhotoField photos={photos} onChange={setPhotos} error={errors.photos} />
                  </FormSection>
                  <div className="flex items-center gap-2 pt-2">
                    <Button type="submit" size="xl" disabled={processing}>
                      {processing ? 'Saving to your repository…' : 'Save changes'}
                    </Button>
                    <Button variant="ghost" size="xl" render={<Link route="shelf" />}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Form>

            <section
              aria-labelledby="delete-heading"
              className="mt-16 flex flex-col gap-5 rounded-[28px] bg-shield p-5 text-on-colour sm:flex-row sm:items-center sm:justify-between sm:p-8"
            >
              <div className="max-w-md">
                <h2 id="delete-heading" className="text-lead font-bold">
                  Delete this kit
                </h2>
                <p className="mt-1 text-[17px]">
                  Removes &ldquo;{kit.name}&rdquo; from your shelf and deletes its record from your
                  repository. This cannot be undone.
                </p>
              </div>
              {!confirmDelete ? (
                <Button type="button" variant="ink" onClick={() => setConfirmDelete(true)}>
                  Delete kit
                </Button>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-on-colour hover:bg-white/40"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Keep it
                  </Button>
                  <Form route="kits.destroy" routeParams={[kit.rkey]} method="delete">
                    {({ processing }) => (
                      <Button type="submit" variant="ink" disabled={processing}>
                        {processing ? 'Deleting…' : `Delete ${kit.name}`}
                      </Button>
                    )}
                  </Form>
                </div>
              )}
            </section>
          </div>

          <KitPreviewAside
            {...values}
            photoUrl={photos[0] ? getPhotoUrl(photos[0]) : null}
            photoCount={photos.length}
            description="How this kit appears on your shelf and in feeds once saved."
            className="lg:col-span-4"
          />
        </div>
      </Page>
    </div>
  )
}

KitsEdit.layout = [BaseLayout]
