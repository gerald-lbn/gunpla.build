import { inject } from '@adonisjs/core'
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import Kit from '#kits/models/kit'

const DEFAULT_PAGE_SIZE = 20

@inject()
export class ExploreService {
  async listKits(params: { q?: string; page: number }): Promise<ModelPaginatorContract<Kit>> {
    const page = Math.max(1, params.page)

    let query = Kit.query()
      .where('status', 'done')
      .preload('profile')
      .preload('buildLogs')
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

    return query.paginate(page, DEFAULT_PAGE_SIZE)
  }
}
