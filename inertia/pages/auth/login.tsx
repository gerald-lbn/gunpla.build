import { useState } from 'react'
import BaseLayout from '~/layouts/base'
import { Form } from '@adonisjs/inertia/react'
import { Head, usePage } from '@inertiajs/react'
import { ArrowRight } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Field, FieldLabel, FieldError, FieldDescription } from '~/components/ui/field'
import { UserSearchDialog } from '~/components/user_search_dialog'
import { KitPhoto } from '~/components/kit_photo'
import { kitSpec, shortHandle } from '~/lib/kits'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>

const STEPS = [
  {
    title: 'Approve on your own server',
    body: 'You are sent to the server behind your handle to approve gunpla.build. Your password never reaches this site.',
  },
  {
    title: 'Log kits into your repository',
    body: 'Each kit you log is written to your repository as a record, with its photos stored beside it.',
  },
  {
    title: 'Keep them if you leave',
    body: 'Signing out, or this site going away, leaves every record where it is: on your server.',
  },
]

export default function Login() {
  const { kit } = usePage<{ kit: KitRow | null }>().props
  const [dialogOpen, setDialogOpen] = useState(false)
  const [handle, setHandle] = useState('')

  return (
    <div className="column pt-8">
      <Head title="Sign in" />
      <div className="grid gap-x-[14px] gap-y-10 lg:grid-cols-12">
        <section aria-labelledby="auth-heading" className="lg:col-span-6 lg:pr-10">
          <h1 id="auth-heading" className="text-2xl leading-8 font-semibold tracking-[-0.01em]">
            Sign in with your Bluesky handle
          </h1>
          <p className="mt-1 text-[15px] leading-6 text-muted-foreground">
            gunpla.build has no accounts of its own. It uses the handle you already have on Bluesky
            or any other AT Protocol service.
          </p>

          <Form route="oauth.login" className="mt-8 cut-lg bg-card p-5 sm:p-6">
            {({ errors, processing }) => (
              <>
                <Field data-invalid={!!errors.input}>
                  <FieldLabel htmlFor="handle">Your handle</FieldLabel>
                  <Input
                    id="handle"
                    name="input"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="yourname.bsky.social"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.trim().replace(/^@/, ''))}
                    aria-invalid={errors.input ? 'true' : undefined}
                    required
                  />
                  <FieldError>{errors.input}</FieldError>
                  <FieldDescription>
                    A handle like yourname.bsky.social, your own domain, or a DID.{' '}
                    <button
                      type="button"
                      onClick={() => setDialogOpen(true)}
                      className="text-foreground underline underline-offset-4"
                    >
                      Look it up by name
                    </button>
                  </FieldDescription>
                </Field>

                <Button
                  type="submit"
                  size="lg"
                  disabled={processing}
                  className="mt-5 w-full justify-between"
                >
                  {processing ? 'Opening your server…' : 'Continue to your server'}
                  <ArrowRight aria-hidden="true" />
                </Button>
              </>
            )}
          </Form>

          <UserSearchDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSelect={(picked) => setHandle(picked)}
          />

          <dl className="mt-8 grid gap-5">
            {STEPS.map((step) => (
              <div key={step.title}>
                <dt className="text-sm font-medium">{step.title}</dt>
                <dd className="mt-0.5 text-sm leading-6 text-muted-foreground">{step.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        {kit && (
          <figure className="lg:col-span-6">
            <KitPhoto
              src={kit.fullPhotoUrl ?? kit.photoUrl}
              alt={kit.name}
              grade={kit.grade}
              loading="eager"
              cut="cut-lg"
              className="aspect-[4/5] lg:aspect-[5/6]"
            />
            <figcaption className="mt-3 text-sm text-muted-foreground">
              <span className="text-foreground">{kit.name}</span>
              {kit.handle ? ` by @${shortHandle(kit.handle)}` : ''}
              {kitSpec(kit) ? ` · ${kitSpec(kit)}` : ''}. A kit from someone&apos;s shelf, picked at
              random.
            </figcaption>
          </figure>
        )}
      </div>
    </div>
  )
}

Login.layout = [BaseLayout]
