import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Plus } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { rise } from '~/hooks/use_rise'

/**
 * The poster's line again at the end of a list, on V-fin yellow, next to a kit still on its
 * runners: the build that is not on the shelf yet.
 */
export function ShelfItPanel({ id = 'shelf-it-title' }: { id?: string }) {
  const { props } = usePage()
  const isSignedIn = Boolean(props.user)

  return (
    <section
      aria-labelledby={id}
      className="mt-40 grid overflow-hidden rounded-[28px] bg-vfin text-on-colour max-md:mt-24 lg:grid-cols-12"
    >
      <div className="flex flex-col justify-between gap-12 p-6 md:p-10 lg:col-span-7">
        <h2
          id={id}
          {...rise(0)}
          className="display text-[18vw] md:text-[12vw] lg:text-[8.4vw] 2xl:text-[121px]"
        >
          Built one?
          <br />
          Shelf it.
        </h2>
        <div {...rise(1)}>
          <p className="max-w-[40ch] text-lead/snug">
            Log it with its grade, scale and photos, and it joins the wall the moment its record
            reaches gunpla.build.
          </p>
          {isSignedIn ? (
            <Button size="xl" className="mt-8 max-md:w-full" render={<Link route="kits.create" />}>
              <Plus className="size-5" aria-hidden="true" />
              Log a kit
            </Button>
          ) : (
            <Button size="xl" className="mt-8 max-md:w-full" render={<Link route="login" />}>
              Sign in with Bluesky
            </Button>
          )}
        </div>
      </div>
      <img
        {...rise(2)}
        src="/found/gunpla-multi-color-sprue.jpg"
        width={1600}
        height={1200}
        loading="lazy"
        decoding="async"
        alt="A Gunpla runner moulded in two colours, blue and green, with the part letters a and b on its gates."
        className="aspect-4/3 size-full object-cover lg:col-span-5 lg:aspect-auto"
      />
    </section>
  )
}
