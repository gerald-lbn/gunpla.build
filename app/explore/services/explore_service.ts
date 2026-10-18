import db from '@adonisjs/lucid/services/db'
import Kit from '#kits/models/kit'
import KitLike from '#kits/models/kit_like'
import type { ExploreParams, ExploreResult } from '#types/explore'

const DEFAULT_PAGE_SIZE = 20

export default class ExploreService {
  async listShowcaseBuilds(params: ExploreParams): Promise<ExploreResult> {
    const page = Math.max(1, params.page)

    let query = Kit.query()
      .where('status', 'done')
      .preload('profile')
      .withCount('kitLikes', (q) => q.as('kit_likes_count'))
      .orderBy('indexed_at', 'desc')

    if (params.q) {
      const term = params.q.toLowerCase().trim()
      query = query.where((builder) => {
        builder
          .whereRaw('LOWER(name) LIKE ?', [`%${term}%`])
          .orWhereHas('profile', (profileQuery) => {
            profileQuery.whereRaw('LOWER(handle) LIKE ?', [`%${term}%`])
          })
          .orWhereRaw('LOWER(grade) LIKE ?', [`%${term}%`])
      })
    }

    if (params.grade) query = query.where('grade', params.grade)
    if (params.scale) query = query.where('scale', params.scale)
    if (params.manufacturer) query = query.where('manufacturer', params.manufacturer)
    if (params.builder) {
      query = query.whereHas('profile', (profileQuery) => {
        profileQuery.where('handle', params.builder!)
      })
    }

    const paginator = await query.paginate(page, DEFAULT_PAGE_SIZE)
    const kitIds = paginator.all().map((k) => k.id)
    const viewerLikedKitIds = await KitLike.resolveViewerLikedKitIds(params.viewerDid, kitIds)

    return { paginator, viewerLikedKitIds }
  }

  async listDistinctFilterValues(
    type: 'grade' | 'scale' | 'manufacturer' | 'builder',
    q?: string
  ): Promise<string[]> {
    if (type === 'builder') {
      if (!q || q.length < 2) return []
      const rows = await db
        .from('profiles')
        .join('kits', 'kits.did', '=', 'profiles.did')
        .select('profiles.handle')
        .whereRaw('profiles.handle LIKE ?', [`%${q}%`])
        .groupBy('profiles.handle')
        .orderBy('profiles.handle', 'asc')
      return rows.map((r: { handle: string }) => r.handle)
    }

    const column = type as 'grade' | 'scale' | 'manufacturer'
    const rows = await Kit.query()
      .select(column)
      .whereNotNull(column)
      .groupBy(column)
      .orderBy(column, 'asc')
    return rows.map((r) => r[column] as string)
  }
}
