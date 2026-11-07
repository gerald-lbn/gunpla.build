import { useState } from 'react'
import BaseLayout from '~/layouts/base'
import { Form } from '@adonisjs/inertia/react'
import { Head, usePage } from '@inertiajs/react'
import { ArrowRight } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Field, FieldLabel, FieldError } from '~/components/ui/field'
import { KitPhoto } from '~/components/kit_photo'
import { kitSpec, shortHandle } from '~/lib/kits'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>

export default function Login() {
  const { kit } = usePage<{ kit: KitRow | null }>().props
  const [handle, setHandle] = useState('')

  return (
    <div>
      <Head title="Sign in" />
      <div className="overflow-hidden">
        <div className="column grid gap-x-4 gap-y-16 pt-12 pb-16 md:pt-16 lg:grid-cols-12 lg:pb-20">
          <section aria-labelledby="auth-heading" className="lg:col-span-7">
            <h1
              id="auth-heading"
              className="display text-[18vw] md:text-[13vw] lg:text-[8.4vw] 2xl:text-[121px]"
            >
              <span className="mask-line">
                <span>Sign in with</span>
              </span>
              <span className="mask-line">
                <span>Bluesky</span>
              </span>
            </h1>
            <p className="after-mask mt-8 max-w-[40ch] text-lead/snug">
              gunpla.build has no accounts of its own. It uses the handle you already have on
              Bluesky.
            </p>

            <Form route="oauth.login" className="after-mask mt-10 max-w-xl">
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
                      placeholder="alice.bsky.social"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.trim().replace(/^@/, ''))}
                      aria-invalid={errors.input ? 'true' : undefined}
                      required
                      className="h-14 rounded-full px-6 text-body"
                    />
                    <FieldError>{errors.input}</FieldError>
                  </Field>

                  <Button
                    type="submit"
                    size="xl"
                    disabled={processing}
                    className="mt-6 max-md:w-full"
                  >
                    {processing ? 'Signing in…' : 'Sign in'}
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </Button>
                </>
              )}
            </Form>
          </section>

          <figure className="self-center lg:col-span-5 lg:pl-6">
            {kit ? (
              <>
                <div className="relative mx-auto w-[86%] max-w-[440px] lg:w-full">
                  <div className="rotate-[4deg] overflow-hidden rounded-[28px]">
                    <KitPhoto
                      src={kit.fullPhotoUrl ?? kit.photoUrl}
                      alt={kit.name}
                      grade={kit.grade}
                      scale={kit.scale}
                      loading="eager"
                      className="aspect-4/5"
                      imgClassName="drift"
                    />
                  </div>
                </div>
                <figcaption className="mx-auto mt-10 w-[86%] max-w-[440px] text-[17px] lg:w-full">
                  <span className="block text-lead/tight font-bold">{kit.name}</span>
                  {[kit.handle && `@${shortHandle(kit.handle)}`, kitSpec(kit)]
                    .filter(Boolean)
                    .join(' · ')}
                  {kit.handle || kitSpec(kit) ? '. ' : ''}A kit from someone&apos;s shelf, picked at
                  random.
                </figcaption>
              </>
            ) : (
              <img
                src="/found/gunpla-model-sprues.jpg"
                width={1600}
                height={1029}
                alt="Runners of a Real Grade Zaku II in two greens, the parts still on their gates."
                className="mx-auto aspect-4/5 w-[86%] max-w-[440px] rotate-[4deg] rounded-[28px] object-cover lg:w-full"
              />
            )}
          </figure>
        </div>
      </div>
    </div>
  )
}

Login.layout = [BaseLayout]
