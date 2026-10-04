import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

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
  declare handle: string | null

  @column()
  declare kitUri: string

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
