import { useMemo, useState } from 'react'
import { cn } from 'cn'
import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowRight, Images, Plus } from 'lucide-react'
import BaseLayout from '~/layouts/base'
import { PageHeader } from '~/components/page'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Dialog, DialogContent } from '~/components/ui/dialog'
import { KitPhoto } from '~/components/kit_photo'
import { KitTile } from '~/components/kit_tile'
import { StatusBadge } from '~/components/kit_preview'
import { KitDetailPanel } from '~/components/kit_detail_panel'
import { focusClose } from '~/lib/focus'
import { Chart } from '~/components/chart'
import { kitSpec, normalizeGrade, plural, shortHandle } from '~/lib/kits'
import { timeAgo } from '~/lib/time'
import { useLiveKits } from '~/hooks/use_live_kits'
import type { InertiaProps } from '~/types'
import type { InferData } from '@adonisjs/http-transformers/types'
import type KitTransformer from '#kits/transformers/kit_transformer'

type KitRow = InferData<KitTransformer>
type PageProps = InertiaProps<{ kits: KitRow[] }>

export default function Home({ kits }: PageProps) {
  const { props } = usePage<PageProps>()
  const isSignedIn = Boolean(props.user)
  const { isLive, isUpdating, freshUri } = useLiveKits(kits)
  const [selected, setSelected] = useState<KitRow | null>(null)

  const [lead, ...earlier] = kits

  return (
    <>
      <Head title="Latest builds" />
      <div className="column pt-8">
        <PageHeader
          title="Latest builds"
          description="Gunpla kits logged by builders across the AT Protocol, newest first. Each one is a record in its builder's own repository."
          actions={
            <>
              <LiveStamp isLive={isLive} isUpdating={isUpdating} />
              {isSignedIn ? (
                <Button render={<Link route="kits.create" />}>
                  <Plus aria-hidden="true" />
                  Log a kit
                </Button>
              ) : (
                <Button render={<Link route="login" />}>Sign in to log a kit</Button>
              )}
            </>
          }
        />

        {lead ? (
          <div className="grid gap-3.5 lg:grid-cols-12">
            <LeadBuild
              kit={lead}
              isFresh={lead.uri === freshUri}
              onSelect={() => setSelected(lead)}
              className="lg:col-span-8"
            />
            <aside className="flex flex-col gap-3.5 lg:col-span-4">
              <BuildersInFeed kits={kits} />
              <GradesInFeed kits={kits} />
              {!isSignedIn && <WhereShelvesLive />}
            </aside>
          </div>
        ) : (
          <EmptyFeed isSignedIn={isSignedIn} />
        )}

        {earlier.length > 0 && (
          <section aria-labelledby="earlier-heading" className="mt-16">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 id="earlier-heading" className="text-base font-medium">
                Logged before that
                <span className="ml-2 text-sm font-normal text-muted-foreground num">
                  {plural(earlier.length, 'kit')}
                </span>
              </h2>
              <Link
                route="explore"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="hidden sm:inline">View all builds</span>
                <span className="sm:hidden">Explore</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {earlier.map((kit) => (
                <KitTile
                  key={kit.uri}
                  kit={kit}
                  showBuilder
                  showStatus="unfinished"
                  onSelect={() => setSelected(kit)}
                  className={cn(kit.uri === freshUri && 'animate-in fade-in slide-in-from-top-2')}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          className="max-h-[calc(100svh-2rem)] max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-5xl"
          showCloseButton={false}
          onOpenAutoFocus={focusClose}
        >
          {selected && <KitDetailPanel kit={selected} onClose={() => setSelected(null)} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

Home.layout = [BaseLayout]

function LiveStamp({ isLive, isUpdating }: { isLive: boolean; isUpdating: boolean }) {
  return (
    <p
      className="mr-2 inline-flex items-center gap-2 text-sm text-muted-foreground"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-2 rounded-[2px]',
          isLive ? 'bg-vfin' : 'bg-control',
          isUpdating && 'animate-pulse'
        )}
      />
      {isUpdating
        ? 'Adding a new build…'
        : isLive
          ? 'Live: new logs appear here'
          : 'Not live: refresh to see new logs'}
    </p>
  )
}

function LeadBuild({
  kit,
  isFresh,
  onSelect,
  className,
}: {
  kit: KitRow
  isFresh: boolean
  onSelect: () => void
  className?: string
}) {
  const handle = kit.author?.handle ?? kit.handle
  const spec = kitSpec(kit)

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden cut-lg bg-card',
        isFresh && 'animate-in fade-in zoom-in-[0.99]',
        className
      )}
    >
      <div className="relative flex flex-col lg:flex-1">
        <KitPhoto
          src={kit.fullPhotoUrl ?? kit.photoUrl}
          alt={kit.name}
          grade={kit.grade}
          loading="eager"
          cut={null}
          className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[440px] lg:flex-1"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
        />
        {isFresh && (
          <span className="absolute top-3 left-3 inline-flex h-6 items-center rounded-[2px] bg-vfin px-2.5 text-xs font-medium text-black">
            Just logged
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            Newest on the network · logged {timeAgo(kit.indexedAt)}
          </p>
          <h2 className="mt-1 text-xl leading-7 font-semibold">
            <button
              type="button"
              onClick={onSelect}
              className="text-left after:absolute after:inset-0 focus-visible:outline-none group-has-[button:focus-visible]:after:outline-2 group-has-[button:focus-visible]:after:-outline-offset-2 group-has-[button:focus-visible]:after:outline-ring"
            >
              {kit.name}
            </button>
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {spec && <span>{spec}</span>}
            <span className="inline-flex items-center gap-1 num">
              <Images className="size-4" aria-hidden="true" />
              {plural(kit.photoCount, 'photo')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={kit.status} />
          {handle && (
            <Link
              route="profile"
              routeParams={[handle]}
              className="cut-xs relative z-10 inline-flex h-9 items-center gap-2 bg-secondary pr-3.5 pl-1 text-sm transition-colors hover:bg-secondary-hover"
            >
              <Avatar size="sm" className="size-7">
                {kit.author?.avatarUrl && <AvatarImage src={kit.author.avatarUrl} alt="" />}
                <AvatarFallback>{shortHandle(handle).slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              @{shortHandle(handle)}
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

type BuilderRow = {
  handle: string
  displayName: string | null
  avatarUrl: string | null
  count: number
  latest: string
}

function BuildersInFeed({ kits }: { kits: KitRow[] }) {
  const builders = useMemo(() => {
    const map = new Map<string, BuilderRow>()
    for (const kit of kits) {
      const handle = kit.author?.handle ?? kit.handle
      if (!handle) continue
      const row = map.get(handle)
      if (row) {
        row.count += 1
        if (kit.indexedAt > row.latest) row.latest = kit.indexedAt
      } else {
        map.set(handle, {
          handle,
          displayName: kit.author?.displayName ?? null,
          avatarUrl: kit.author?.avatarUrl ?? null,
          count: 1,
          latest: kit.indexedAt,
        })
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || (a.latest < b.latest ? 1 : -1))
  }, [kits])

  const shown = builders.slice(0, 5)

  return (
    <section aria-labelledby="builders-heading" className="cut-lg bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="builders-heading" className="text-base font-medium">
          Builders in this feed
        </h2>
        <span className="text-sm text-muted-foreground num">
          {plural(builders.length, 'builder')}
        </span>
      </div>
      <ul className="mt-3 -mx-2">
        {shown.map((b) => (
          <li key={b.handle}>
            <Link
              route="profile"
              routeParams={[b.handle]}
              className="flex h-14 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-hover"
            >
              <Avatar size="lg">
                {b.avatarUrl && <AvatarImage src={b.avatarUrl} alt="" />}
                <AvatarFallback>{shortHandle(b.handle).slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{b.displayName || `@${b.handle}`}</p>
                <p className="truncate text-xs text-muted-foreground">
                  Last log {timeAgo(b.latest)}
                </p>
              </div>
              <span className="text-sm num">
                {b.count}
                <span className="ml-1 text-xs text-muted-foreground">
                  {b.count === 1 ? 'kit' : 'kits'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function GradesInFeed({ kits }: { kits: KitRow[] }) {
  const rows = useMemo(() => {
    const counts = new Map<string, number>()
    for (const kit of kits) {
      const grade = normalizeGrade(kit.grade) ?? 'No grade'
      counts.set(grade, (counts.get(grade) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [kits])

  return (
    <section aria-labelledby="grades-heading" className="cut-lg bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="grades-heading" className="text-base font-medium">
          Grades in this feed
        </h2>
        <span className="text-sm text-muted-foreground num">{plural(kits.length, 'kit')}</span>
      </div>
      <Chart
        className="mt-4 text-sm"
        label={`Kits per grade: ${rows.map((r) => `${r.label} ${r.value}`).join(', ')}`}
        deps={[rows]}
        draw={(el, charts) => charts.barList(el, rows, { thin: true, colour: 'var(--vfin)' })}
      />
    </section>
  )
}

function WhereShelvesLive() {
  return (
    <section aria-labelledby="where-heading" className="flex flex-1 flex-col cut-lg bg-card p-5">
      <h2 id="where-heading" className="text-base font-medium">
        Your shelf stays yours
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Sign in with the handle you use on Bluesky. Kits you log are written to your own repository,
        so they follow you to any app that reads them.
      </p>
      <dl className="mt-4 grid gap-px overflow-hidden rounded-lg bg-rule text-sm">
        <div className="flex items-center justify-between gap-4 bg-raised/40 px-3 py-2">
          <dt className="text-muted-foreground">Each kit</dt>
          <dd>one build.gunpla.kit record</dd>
        </div>
        <div className="flex items-center justify-between gap-4 bg-raised/40 px-3 py-2">
          <dt className="text-muted-foreground">Photos</dt>
          <dd className="num">up to 20 per kit</dd>
        </div>
      </dl>
      <div className="mt-auto pt-4">
        <Button variant="secondary" className="w-full" render={<Link route="login" />}>
          Sign in with Bluesky
        </Button>
      </div>
    </section>
  )
}

function EmptyFeed({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <div className="flex flex-col items-start gap-4 cut-lg bg-card p-8">
      <div>
        <h2 className="text-base font-medium">No kit has been logged yet</h2>
        <p className="mt-1 max-w-lg text-sm text-muted-foreground">
          The first kit logged anywhere on the network appears here, with its photos, as soon as its
          record reaches gunpla.build.
        </p>
      </div>
      <Button render={<Link route={isSignedIn ? 'kits.create' : 'login'} />}>
        {isSignedIn ? 'Log the first kit' : 'Sign in to log the first kit'}
      </Button>
    </div>
  )
}
