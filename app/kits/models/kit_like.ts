import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { KitLikeSchema } from '#database/schema'
import Kit from '#kits/models/kit'

export default class KitLike extends KitLikeSchema {
  static readonly selfAssignPrimaryKey = false
  static readonly updatedAtColumn = ''

  @belongsTo(() => Kit)
  declare kit: BelongsTo<typeof Kit>

  static async resolveViewerLikedKitIds(
    viewerDid: string | undefined,
    kitIds: number[]
  ): Promise<Set<number>> {
    if (!viewerDid || kitIds.length === 0) {
      return new Set<number>()
    }
    const likes = await KitLike.query().where('did', viewerDid).whereIn('kit_id', kitIds)
    return new Set(likes.map((l) => l.kitId))
  }
}
