import BaseLayout from '~/layouts/base'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { ErrorPoster } from '~/components/error_poster'

export default function ServerError() {
  return (
    <div>
      <Head title="Something broke" />
      <ErrorPoster
        title="Something broke"
        body="gunpla.build hit an error on the server while loading this page. Try again in a moment; if it keeps happening, the cause is in the server logs."
        actions={
          <>
            <Button size="xl" onClick={() => window.location.reload()}>
              Try again
            </Button>
            <Button size="xl" variant="ink" render={<Link route="home" />}>
              See the latest builds
            </Button>
          </>
        }
      />
    </div>
  )
}

ServerError.layout = [BaseLayout]
