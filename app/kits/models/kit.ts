import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Kit extends BaseModel {
  static table = 'kits'

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
  declare name: string

  @column()
  declare grade: string | null

  @column()
  declare scale: string | null

  @column()
  declare status: string

  @column()
  declare photoCid: string | null

  @column.dateTime()
  declare recordCreatedAt: DateTime | null

  @column.dateTime()
  declare indexedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
