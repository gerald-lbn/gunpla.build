import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Kit from '#kits/models/kit'

export default class Profile extends BaseModel {
  static table = 'profiles'
  static primaryKey = 'did'
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare did: string

  @column()
  declare handle: string

  @column()
  declare displayName: string | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare description: string | null

  @column()
  declare pdsUrl: string | null

  @column.dateTime()
  declare indexedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Kit, { foreignKey: 'did', localKey: 'did' })
  declare kits: HasMany<typeof Kit>
}
