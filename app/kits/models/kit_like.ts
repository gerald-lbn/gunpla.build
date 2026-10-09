import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { KitLikeSchema } from '#database/schema'
import Kit from '#kits/models/kit'

export default class KitLike extends KitLikeSchema {
  static readonly selfAssignPrimaryKey = false
  static readonly updatedAtColumn = ''

  @belongsTo(() => Kit)
  declare kit: BelongsTo<typeof Kit>
}
