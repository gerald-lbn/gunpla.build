import { useState, useMemo } from 'react'
import BaseLayout from '~/layouts/base'
import Page from '~/components/page'
import { Form } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { FieldGroup } from '~/components/ui/field'
import type { InertiaProps } from '~/types'
import { KitFormFields, type KitFormValues } from '~/components/kits/kit_form_fields'
import { KitPhotoField, type PhotoEntry, getPhotoUrl } from '~/components/kits/kit_photo_field'
import { KitPreviewAside } from '~/components/kits/kit_preview_aside'

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
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
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
                <FieldGroup>
                  <KitFormFields values={values} onChange={handleChange} errors={errors} />
                  <KitPhotoField photos={photos} onChange={setPhotos} error={errors.photos} />
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </FieldGroup>
              </>
            )}
          </Form>

          <KitPreviewAside
            {...values}
            photoUrl={photos[0] ? getPhotoUrl(photos[0]) : null}
            photoCount={photos.length}
            description="Live preview of this kit on your shelf and in community feeds."
            className="lg:col-start-2 lg:row-start-1 lg:row-span-2"
          />

          <div className="border-2 border-black bg-destructive/10 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:col-start-1 lg:row-start-2">
            <h3 className="font-head text-sm font-bold text-destructive">Danger Zone</h3>
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
    </main>
  )
}

KitsEdit.layout = [BaseLayout]
