import { cn } from 'cn'
import { Link } from '@adonisjs/inertia/react'
import { Heart, Images, Pencil } from 'lucide-react'
import { KitPhoto } from '~/components/kit_photo'
import { StatusBadge } from '~/components/kit_preview'
import { shortHandle } from '~/lib/kits'

export type TileKit = {
  name: string
  grade: string | null
  scale: string | null
  manufacturer: string | null
  status: string
  photoUrl: string | null
  photoCount?: number
  handle?: string | null
  indexedAt?: string
  likeCount?: number
}

/**
 * A kit as it sits on a shelf: the cover photo is the object, the words under it
 * say what it is. The whole tile opens the kit; the builder link and the edit
 * button are separate targets laid over it.
 */
export function KitTile({
  kit,
  onSelect,
  fit = 'cover',
  aspect = 'aspect-[4/5]',
  showBuilder = false,
  showStatus = true,
  editRkey,
  loading,
  className,
}: {
  kit: TileKit
  onSelect: () => void
  fit?: 'cover' | 'natural'
  aspect?: string
  showBuilder?: boolean
  /** `unfinished` marks only kits that are not built yet, for feeds where most are */
  showStatus?: boolean | 'unfinished'
  editRkey?: string | null
  loading?: 'lazy' | 'eager'
  className?: string
}) {
  const name = kit.name.trim() || 'Untitled kit'
  // grade and scale ride on the photo's plate; the line under it names the maker
  const spec = kit.manufacturer ?? ''

  return (
    <article data-rise="" className={cn('group relative flex flex-col gap-3', className)}>
      <div className="relative">
        <KitPhoto
          src={kit.photoUrl}
          alt={name}
          grade={kit.grade}
          scale={kit.scale}
          fit={fit}
          loading={loading}
          className={fit === 'cover' ? aspect : undefined}
          imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        {kit.photoCount && kit.photoCount > 1 ? (
          <span className="sticker num pointer-events-none absolute right-3 bottom-3 bg-[#0b0b0c] text-white">
            <Images className="size-3.5" aria-hidden="true" />
            {kit.photoCount}
            <span className="sr-only">photos</span>
          </span>
        ) : null}
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-[17px] font-bold">
          <button
            type="button"
            onClick={onSelect}
            className="text-left after:absolute after:inset-0 group-has-[button:focus-visible]:after:rounded-[28px] group-has-[button:focus-visible]:after:outline-2 group-has-[button:focus-visible]:after:outline-offset-4 group-has-[button:focus-visible]:after:outline-ring focus-visible:outline-none"
          >
            {name}
          </button>
        </h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[17px]">
            {showBuilder && kit.handle ? (
              <>
                <Link
                  route="profile"
                  routeParams={[kit.handle]}
                  className="relative z-10 font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  @{shortHandle(kit.handle)}
                </Link>
                {spec ? ' · ' : ''}
              </>
            ) : null}
            {spec || (showBuilder ? '' : 'Maker not recorded')}
          </p>
          <div className="flex flex-none items-center gap-2">
            {typeof kit.likeCount === 'number' && kit.likeCount > 0 && (
              <span className="num inline-flex items-center gap-1 text-[15px]">
                <Heart className="size-3.5" aria-hidden="true" />
                {kit.likeCount}
                <span className="sr-only">likes</span>
              </span>
            )}
            {(showStatus === true || (showStatus === 'unfinished' && kit.status !== 'done')) && (
              <StatusBadge status={kit.status} />
            )}
          </div>
        </div>
      </div>

      {editRkey && (
        <Link
          route="kits.edit"
          routeParams={[editRkey]}
          aria-label={`Edit ${name}`}
          className="absolute top-3 right-3 z-10 inline-flex size-10 items-center justify-center rounded-full bg-[#0b0b0c] text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
        </Link>
      )}
    </article>
  )
}
