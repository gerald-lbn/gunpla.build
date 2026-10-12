import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { KitCommentSchema } from '#database/schema'
import Kit from '#kits/models/kit'
import Profile from '#profile/models/profile'

export default class KitComment extends KitCommentSchema {
  static readonly selfAssignPrimaryKey = false
  static readonly updatedAtColumn = ''

  @belongsTo(() => Kit)
  declare kit: BelongsTo<typeof Kit>

  @belongsTo(() => Profile, { foreignKey: 'did', localKey: 'did' })
  declare profile: BelongsTo<typeof Profile>
}
