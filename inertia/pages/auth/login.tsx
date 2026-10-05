import { useState, useRef } from 'react'
import AuthLayout from '~/layouts/auth'
import { Form } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Button } from '~/components/ui/button'
import { Field, FieldLabel, FieldError } from '~/components/ui/field'
import { UserSearchDialog } from '~/components/user_search_dialog'
import KitPreview from '~/components/kit_preview'
import { ArrowRight, Search } from 'lucide-react'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>

export default function Login() {
  const { kit } = usePage<{ kit: KitRow | null }>().props
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedHandle, setSelectedHandle] = useState('')
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (handle: string) => {
    setSelectedHandle(handle)
    setTimeout(() => hiddenInputRef.current?.closest('form')?.requestSubmit(), 0)
  }

  return (
    <section aria-labelledby="auth-heading" className="w-full max-w-6xl py-4 sm:py-8 lg:py-12">
      <div className="grid w-full items-center gap-12 lg:min-h-[36rem] lg:grid-cols-2 lg:gap-20">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 fill-mode-backwards duration-500 flex max-w-lg flex-col justify-center">
          <h1
            id="auth-heading"
            className="font-head text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight tracking-tight text-foreground"
          >
            Open your Gunpla hangar.
          </h1>

          <p className="font-sans mb-8 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Sign in to track your kits, log your build progress, and share your shelf with the
            community.
          </p>

          <Form route="oauth.login" className="space-y-4">
            {({ errors, processing }) => (
              <>
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="handle-trigger"
                    className="font-head text-sm font-bold text-foreground"
                  >
                    Bluesky Handle or DID
                  </FieldLabel>
                  <button
                    id="handle-trigger"
                    type="button"
                    onClick={() => setDialogOpen(true)}
                    aria-haspopup="dialog"
                    className="flex h-12 w-full items-center gap-3 border-2 bg-card px-4 text-left shadow-sm transition-colors hover:bg-muted"
                  >
                    <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span
                      className={
                        selectedHandle
                          ? 'font-sans text-base text-foreground'
                          : 'font-sans text-base text-muted-foreground'
                      }
                    >
                      {selectedHandle || 'handle.bsky.social'}
                    </span>
                  </button>
                  <input ref={hiddenInputRef} type="hidden" name="input" value={selectedHandle} />
                  {errors.input && (
                    <FieldError className="text-sm font-semibold text-destructive mt-1">
                      {errors.input}
                    </FieldError>
                  )}
                </Field>

                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full justify-between h-13 px-6 text-base sm:text-lg font-head font-bold shadow-md hover:shadow-lg active:shadow-none bg-primary text-primary-foreground hover:bg-primary-hover border-2 border-border"
                >
                  <span>{processing ? 'Connecting…' : 'Continue with Bluesky'}</span>
                  <ArrowRight className="ms-2 size-5 shrink-0" aria-hidden="true" />
                </Button>
              </>
            )}
          </Form>

          <UserSearchDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSelect={handleSelect}
          />
        </div>

        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 fill-mode-backwards duration-500 [animation-delay:100ms] hidden items-center justify-center lg:flex">
          <div className="w-full max-w-sm">
            <KitPreview
              name={kit?.name ?? 'RX-78-2 Gundam Ver. 2.0'}
              grade={kit?.grade ?? 'RG'}
              scale={kit?.scale ?? '1/144'}
              manufacturer={kit?.manufacturer ?? 'Bandai'}
              status={kit?.status ?? 'done'}
              photoUrl={kit?.photoUrl}
              photoCount={kit?.photoCount}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

Login.layout = [AuthLayout]
