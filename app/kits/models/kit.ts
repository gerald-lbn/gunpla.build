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
  declare manufacturer: string | null

  @column()
  declare status: string

  @column()
  declare photoCid: string | null

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | string[] | null) => {
      if (!value) return null
      if (Array.isArray(value)) return value
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? (parsed as string[]) : null
      } catch {
        return null
      }
    },
  })
  declare photos: string[] | null

  @column.dateTime()
  declare acquiredAt: DateTime | null

  @column.dateTime()
  declare recordCreatedAt: DateTime | null

  @column.dateTime()
  declare indexedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static async hasKitsFor(did: string): Promise<boolean> {
    const result = await Kit.query().where('did', did).count('* as total').first()
    return Number(result?.$extras?.total ?? 0) > 0
  }

  static async randomFeatured(): Promise<Kit | null> {
    return Kit.query().whereNotNull('photoCid').orderByRaw('RANDOM()').first()
  }
}
