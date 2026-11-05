import BaseLayout from '~/layouts/base'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { UserSearchDialog } from '~/components/user_search_dialog'
import { ErrorPoster } from '~/components/error_poster'

interface NotFoundProps {
  handle?: string
}

export default function NotFound({ handle }: NotFoundProps) {
  const displayHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : null

  return (
    <div>
      <Head title={displayHandle ? `${displayHandle} not found` : 'Page not found'} />
      <ErrorPoster
        title={displayHandle ? 'No shelf here' : 'Not on the shelf'}
        body={
          displayHandle
            ? `${displayHandle} doesn't lead to an AT Protocol account. The handle may be mistyped, or its owner may have changed it.`
            : 'Nothing lives at this address. It may be mistyped, or the kit it pointed to was deleted from its builder’s repository.'
        }
        actions={
          <>
            <Button size="xl" render={<Link route="home" />}>
              See the latest builds
            </Button>
            {displayHandle && <UserSearchDialog trigger="field" className="h-14 w-64 bg-white" />}
          </>
        }
      />
    </div>
  )
}

NotFound.layout = [BaseLayout]
