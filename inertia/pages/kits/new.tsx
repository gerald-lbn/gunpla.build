import { useState } from 'react'
import BaseLayout from '~/layouts/base'
import Page from '~/components/page'
import { Form } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { FieldGroup } from '~/components/ui/field'
import { KitFormFields, type KitFormValues } from '~/components/kits/kit_form_fields'
import { KitPhotoField, type PhotoEntry, getPhotoUrl } from '~/components/kits/kit_photo_field'
import { KitPreviewAside } from '~/components/kits/kit_preview_aside'

export default function KitsNew() {
  const [values, setValues] = useState<KitFormValues>({
    name: '',
    grade: '',
    scale: '',
    manufacturer: 'Bandai',
    acquiredAt: '',
    status: 'backlog',
  })
  const [photos, setPhotos] = useState<PhotoEntry[]>([])

  const handleChange = (field: keyof KitFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }))

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
      <Page title="Add kit" back={{ route: 'shelf', label: 'My shelf' }}>
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <Form route="kits.store" encType="multipart/form-data">
            {({ errors, processing }) => (
              <FieldGroup>
                <KitFormFields values={values} onChange={handleChange} errors={errors} />
                <KitPhotoField photos={photos} onChange={setPhotos} error={errors.photos} />
                <div className="flex gap-2 pt-1">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Adding…' : 'Add kit'}
                  </Button>
                </div>
              </FieldGroup>
            )}
          </Form>

          <KitPreviewAside
            {...values}
            photoUrl={photos[0] ? getPhotoUrl(photos[0]) : null}
            photoCount={photos.length}
          />
        </div>
      </Page>
    </main>
  )
}

KitsNew.layout = [BaseLayout]
