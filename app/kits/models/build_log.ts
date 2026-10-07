import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Kit from './kit.js'
import Profile from '#profile/models/profile'

export default class BuildLog extends BaseModel {
  static table = 'build_logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare uri: string

  @column()
  declare cid: string | null

  @column()
  declare did: string

  @column()
  declare kitUri: string

  @belongsTo(() => Kit, { foreignKey: 'kitUri', localKey: 'uri' })
  declare kit: BelongsTo<typeof Kit>

  @belongsTo(() => Profile, { foreignKey: 'did', localKey: 'did' })
  declare profile: BelongsTo<typeof Profile>

  @column()
  declare stage: string | null

  @column()
  declare text: string | null

  @column.dateTime()
  declare recordCreatedAt: DateTime | null

  @column.dateTime()
  declare indexedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
