import { useState, useRef } from 'react'
import AuthLayout from '~/layouts/auth'
import { Form } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { Field, FieldLabel, FieldError } from '~/components/ui/field'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { UserSearchDialog } from '~/components/user_search_dialog'
import { ArrowRight, Box, Layers, Heart, Images, Search } from 'lucide-react'

export default function Login() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedHandle, setSelectedHandle] = useState('')
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (handle: string) => {
    setSelectedHandle(handle)
    setTimeout(() => hiddenInputRef.current?.closest('form')?.requestSubmit(), 0)
  }

  return (
    <section aria-labelledby="auth-heading" className="w-full max-w-6xl py-4 sm:py-8 lg:py-12">
      <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">
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

        {/* TODO: Replace the card with one of the builds */}
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 fill-mode-backwards duration-500 [animation-delay:100ms] hidden items-center justify-center lg:flex">
          <div className="w-full max-w-md border-2 border-border rounded shadow-md transition-all bg-card overflow-hidden">
            <div className="relative">
              <div className="flex h-48 items-center justify-center border-b-2 border-border bg-primary text-primary-foreground">
                {/* TODO: Replace with an actual image */}
                <Box className="size-20 stroke-[1.5]" aria-hidden="true" />
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-head text-2xl font-bold tracking-tight text-foreground">
                    RX-78-2 Gundam Ver.2.0
                  </h2>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    Bandai · 1/144 Scale
                  </p>
                </div>
                <span className="rounded inline-flex items-center outline-2 bg-primary text-primary-foreground px-2.5 py-1 text-xs shrink-0 font-bold font-head">
                  RG
                </span>
              </div>

              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Full inner frame assembled with custom panel lining, waterslide decals, and matte
                finish.
              </p>

              <ul className="flex flex-wrap justify-between gap-2 border-y-2 border-border py-3 text-xs">
                <li className="flex items-center gap-1.5 font-medium">
                  <Layers className="size-4 text-foreground" />
                  <span>14 Build logs</span>
                </li>
                <li className="flex items-center gap-1.5 font-medium">
                  <Heart className="size-4 text-foreground fill-primary" />
                  <span>142 Likes</span>
                </li>
                <li className="flex items-center gap-1.5 font-medium">
                  <Images className="size-4 text-foreground" />
                  <span>8 Photos</span>
                </li>
              </ul>

              <div className="flex items-center gap-3 pt-1">
                <Avatar className="size-11 border-2">
                  <AvatarFallback className="bg-primary text-primary-foreground font-head font-bold text-xs">
                    AR
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-bold text-foreground truncate">
                    amuro.bsky.social
                  </p>
                  <p className="font-sans text-xs text-muted-foreground truncate">
                    White Base Pilot · 42 kits on shelf
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

Login.layout = [AuthLayout]
