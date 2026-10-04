import AppLayout from '~/layouts/app'
import Page from '~/components/page'
import { Form, Link } from '@adonisjs/inertia/react'
import type { InertiaProps } from '~/types'

const STATUSES = ['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const

type KitEditData = {
  rkey: string
  uri: string
  name: string
  grade: string
  scale: string
  status: string
}

type PageProps = InertiaProps<{ kit: KitEditData }>

export default function KitsEdit({ kit }: PageProps) {
  return (
    <Page title={`Edit ${kit.name}`}>
      <Form route="kits.update" routeParams={[kit.rkey]} method="put">
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
                defaultValue={kit.name}
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
                defaultValue={kit.grade}
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
                defaultValue={kit.scale}
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
                defaultValue={kit.status}
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
    </Page>
  )
}

KitsEdit.layout = [AppLayout]
