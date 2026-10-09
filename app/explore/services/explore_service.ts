import { inject } from '@adonisjs/core'
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import Kit from '#kits/models/kit'
import KitLike from '#kits/models/kit_like'

const DEFAULT_PAGE_SIZE = 20

@inject()
export class ExploreService {
  async listKits(params: {
    q?: string
    page: number
    viewerDid?: string
  }): Promise<{ paginator: ModelPaginatorContract<Kit>; viewerLikedKitIds: Set<number> }> {
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

    const paginator = await query.paginate(page, DEFAULT_PAGE_SIZE)

    let viewerLikedKitIds = new Set<number>()
    if (params.viewerDid) {
      const kitIds = paginator.all().map((k) => k.id)
      if (kitIds.length > 0) {
        const likes = await KitLike.query().where('did', params.viewerDid).whereIn('kit_id', kitIds)
        viewerLikedKitIds = new Set(likes.map((l) => l.kitId))
      }
    }

    return { paginator, viewerLikedKitIds }
  }
}
