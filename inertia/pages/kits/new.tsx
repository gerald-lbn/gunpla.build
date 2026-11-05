import { useState } from 'react'
import BaseLayout from '~/layouts/base'
import Page from '~/components/page'
import { Form, Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import {
  KitDetailsFields,
  KitStatusField,
  type KitFormValues,
} from '~/components/kits/kit_form_fields'
import { KitPhotoField, type PhotoEntry, getPhotoUrl } from '~/components/kits/kit_photo_field'
import { KitPreviewAside } from '~/components/kits/kit_preview_aside'
import { FormSection } from '~/components/kits/form_section'

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
    <div className="column pt-10 md:pt-14">
      <Page
        title="Log a kit"
        description="Add a kit to your shelf, whether it's finished, on the bench or still in its box."
        back={{ route: 'shelf', label: 'My shelf' }}
      >
        <div className="grid gap-4 lg:grid-cols-12">
          <Form route="kits.store" encType="multipart/form-data" className="lg:col-span-8">
            {({ errors, processing }) => (
              <div className="flex flex-col gap-2">
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
                  description="Where this kit is right now. You can change it as the build moves along."
                >
                  <KitStatusField values={values} onChange={handleChange} errors={errors} />
                </FormSection>
                <FormSection
                  id="photos"
                  title="Photos"
                  description="Show the finished pose, the runners, the work in progress."
                >
                  <KitPhotoField photos={photos} onChange={setPhotos} error={errors.photos} />
                </FormSection>
                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" size="xl" disabled={processing}>
                    {processing ? 'Saving to your repository…' : 'Log kit'}
                  </Button>
                  <Button variant="ghost" size="xl" render={<Link route="shelf" />}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Form>

          <KitPreviewAside
            {...values}
            photoUrl={photos[0] ? getPhotoUrl(photos[0]) : null}
            photoCount={photos.length}
            className="lg:col-span-4"
          />
        </div>
      </Page>
    </div>
  )
}

KitsNew.layout = [BaseLayout]
