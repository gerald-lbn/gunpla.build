import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import type Kit from '#kits/models/kit'

export type ExploreParams = {
  q?: string
  grade?: string
  scale?: string
  manufacturer?: string
  builder?: string
  page: number
  viewerDid?: string
}

export type ExploreResult = {
  paginator: ModelPaginatorContract<Kit>
  viewerLikedKitIds: Set<number>
}
