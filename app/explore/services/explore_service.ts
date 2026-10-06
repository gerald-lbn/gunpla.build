import Kit from '#kits/models/kit'
import BuildLog from '#kits/models/build_log'
import { getBlobUrl } from '#kits/helpers/atproto'

const DEFAULT_PAGE_SIZE = 20

const STATUS_MAP: Record<string, 'completed' | 'building' | 'backlog'> = {
  'done': 'completed',
  'in-progress': 'building',
  'backlog': 'backlog',
  'on-hold': 'backlog',
  'dropped': 'backlog',
}

// Reference entry — always pinned first on page 1 with no search
const RX78 = {
  id: 0,
  name: 'RX-78-2 Gundam',
  grade: 'PG',
  scale: '1/60',
  manufacturer: 'Bandai',
  status: 'completed' as const,
  builderHandle: 'zeonic.bsky.social',
  photos: [
    'linear-gradient(135deg,#1a1a2e,#0f3460)',
    'linear-gradient(160deg,#0f3460,#16213e)',
    'linear-gradient(110deg,#16213e,#1a1a2e)',
  ],
  notes:
    'Went with OOB colors but added a satin top coat for depth. Panel lines with Tamiya enamel, cleaned with lighter fluid.',
  buildLog: [
    {
      date: 'Jan 2024',
      stage: 'Unboxing & inventory',
      text: 'All parts accounted for, no warping on the large frame pieces.',
    },
    {
      date: 'Feb 2024',
      stage: 'Inner frame assembly',
      text: 'The PG frame is incredibly detailed. Took 3 sessions just for the legs.',
    },
    {
      date: 'Mar 2024',
      stage: 'Panel lining',
      text: 'Tamiya panel liner black on dark parts, gray on white. Cleaned up with a cotton swab.',
    },
    {
      date: 'Apr 2024',
      stage: 'Top coat & finish',
      text: 'Satin Mr. Super Clear. Very happy with the final sheen.',
    },
  ],
}

export class ExploreService {
  async listKits(page: number, q: string) {
    let query = Kit.query().orderBy('indexedAt', 'desc')

    if (q) {
      query = query.where((builder) => {
        builder
          .whereRaw('LOWER(name) LIKE ?', [`%${q}%`])
          .orWhereRaw('LOWER(handle) LIKE ?', [`%${q}%`])
          .orWhereRaw('LOWER(grade) LIKE ?', [`%${q}%`])
      })
    }

    const paginator = await query.paginate(page, DEFAULT_PAGE_SIZE)
    const kitModels = paginator.all()

    const kitUris = kitModels.map((k) => k.uri)
    const buildLogs =
      kitUris.length > 0
        ? await BuildLog.query().whereIn('kitUri', kitUris).orderBy('recordCreatedAt', 'asc')
        : []

    const logsByKit = new Map<string, BuildLog[]>()
    for (const log of buildLogs) {
      const arr = logsByKit.get(log.kitUri) ?? []
      arr.push(log)
      logsByKit.set(log.kitUri, arr)
    }

    const kits = kitModels.map((kit) => {
      const photoCids: string[] = kit.photos ?? []
      if (photoCids.length === 0 && kit.photoCid) photoCids.push(kit.photoCid)

      const photos = photoCids.map((cid) => getBlobUrl(kit.did, cid, 'full'))
      const logs = logsByKit.get(kit.uri) ?? []

      return {
        id: kit.id,
        name: kit.name,
        grade: kit.grade ?? '',
        scale: kit.scale ?? '',
        manufacturer: kit.manufacturer ?? '',
        status: (STATUS_MAP[kit.status] ?? 'backlog') as 'completed' | 'building' | 'backlog',
        builderHandle: kit.handle ?? kit.did,
        photos,
        notes: '',
        buildLog: logs.map((log) => ({
          date: log.recordCreatedAt?.toFormat('MMM yyyy') ?? '',
          stage: log.stage ?? '',
          text: log.text ?? '',
        })),
      }
    })

    const allKits = page === 1 && !q ? [RX78, ...kits] : kits

    return { kits: allKits, hasMore: paginator.hasMorePages }
  }
}
