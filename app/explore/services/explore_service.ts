import { inject } from '@adonisjs/core'
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import Kit from '#kits/models/kit'
import KitLike from '#kits/models/kit_like'

const DEFAULT_PAGE_SIZE = 20

export type ExploreParams = {
  q?: string
  page: number
  viewerDid?: string
}

export type ExploreResult = {
  paginator: ModelPaginatorContract<Kit>
  viewerLikedKitIds: Set<number>
}

@inject()
export class ExploreService {
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

    const paginator = await query.paginate(page, DEFAULT_PAGE_SIZE)
    const kitIds = paginator.all().map((k) => k.id)
    const viewerLikedKitIds = await KitLike.resolveViewerLikedKitIds(params.viewerDid, kitIds)

    return { paginator, viewerLikedKitIds }
  }
}
