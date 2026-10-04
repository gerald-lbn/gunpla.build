import AppLayout from '~/layouts/app'
import Page from '~/components/page'
import { Form } from '@adonisjs/inertia/react'

const STATUSES = ['backlog', 'in-progress', 'on-hold', 'dropped', 'done'] as const

export default function KitsNew() {
  return (
    <Page title="Add kit">
      <Form route="kits.store">
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
                placeholder="Freedom Gundam"
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
                defaultValue="backlog"
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

            <button type="submit" className="btn btn--primary" disabled={processing}>
              {processing ? 'Adding…' : 'Add kit'}
            </button>
          </div>
        )}
      </Form>
    </Page>
  )
}

KitsNew.layout = [AppLayout]
