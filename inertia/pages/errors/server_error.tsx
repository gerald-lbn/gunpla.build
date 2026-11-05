import BaseLayout from '~/layouts/base'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'

export default function ServerError() {
  return (
    <div className="column pt-8">
      <Head title="Something broke" />
      <div className="max-w-xl cut-lg bg-card p-6 sm:p-8">
        <p className="text-sm text-negative num">Error 500</p>
        <h1 className="mt-1 text-2xl leading-8 font-semibold tracking-[-0.01em]">
          gunpla.build hit an error
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
          Something went wrong on the server while loading this page. Try again in a moment; if it
          keeps happening, the cause is in the server logs.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button variant="secondary" render={<Link route="home" />}>
            See the latest builds
          </Button>
        </div>
      </div>
    </div>
  )
}

ServerError.layout = [BaseLayout]
