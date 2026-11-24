import BaseLayout from '~/layouts/base'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import { ErrorPoster, type CodeBlock } from '~/components/error_poster'

/* 5 0 0 in grey runner, a red part and ink */
const CODE: CodeBlock[] = [
  { digit: '5', height: 88, tone: 'runner' },
  { digit: '0', height: 94, tone: 'shield' },
  { digit: '0', height: 72, tone: 'ink' },
]

export default function ServerError() {
  return (
    <>
      <Head title="Something broke" />
      <ErrorPoster
        code={CODE}
        title={['Something', 'broke']}
        body="The error is on our side, not yours. Try again in a moment."
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
    </>
  )
}

ServerError.layout = [BaseLayout]
