import AuthLayout from '~/layouts/auth'
import { Form } from '@adonisjs/inertia/react'

export default function Login() {
  return (
    <>
      <h1 className="auth__title">Sign in</h1>
      <p className="auth__sub">Enter your Bluesky handle or DID to continue.</p>

      <Form route="oauth.login">
        {({ errors, processing }) => (
          <div className="auth__form">
            <div className="field">
              <label className="field__label" htmlFor="input">
                Handle or DID
              </label>
              <input
                id="input"
                name="input"
                type="text"
                className="field__input"
                autoComplete="username"
                placeholder="you.bsky.social"
                aria-invalid={errors.input ? 'true' : 'false'}
              />
              {errors.input && <span className="field__error">{errors.input}</span>}
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={processing}
              style={{ marginTop: 4 }}
            >
              {processing ? 'One moment…' : 'Continue'}
            </button>
          </div>
        )}
      </Form>
    </>
  )
}

Login.layout = [AuthLayout]
