import { Link } from '@adonisjs/inertia/react'

interface HeroCopyProps {
  isSignedIn: boolean
}

export function HeroCopy({ isSignedIn }: HeroCopyProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center lg:mx-0 lg:max-w-none lg:items-start lg:text-start">
      <h1 className="font-head text-4xl leading-[1.05] font-bold tracking-tight uppercase sm:text-5xl lg:leading-[0.98] xl:text-6xl">
        <span>
          BUILD, TRACK & LOG WITH{' '}
          <span className="inline-block border-2 border-black bg-primary px-2 text-primary-foreground shadow-[3px_3px_0_0_var(--border)]">
            GUNPLA.BUILD
          </span>
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-base font-medium text-balance text-foreground/80 sm:mt-5 sm:text-lg">
        The internet&apos;s Gunpla shelf. Log your builds from runner clipping to final topcoat,
        snap photos of your progress, and show off your backlog.
      </p>

      <div className="mt-7 flex w-full flex-col items-stretch gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:items-center">
        <Link
          route={isSignedIn ? 'shelf' : 'login'}
          className="font-head inline-flex h-12 w-full cursor-pointer items-center justify-center border-2 border-black bg-primary px-8 text-base font-bold tracking-wider text-primary-foreground uppercase shadow-[4px_4px_0_0_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[6px_6px_0_0_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none sm:h-14 sm:w-auto sm:px-10 sm:text-lg"
        >
          {isSignedIn ? 'Go to my shelf' : 'Start your shelf'}
        </Link>
      </div>
    </div>
  )
}
