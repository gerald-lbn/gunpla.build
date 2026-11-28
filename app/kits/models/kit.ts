import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { KitSchema } from '#database/schema'
import Profile from '#profile/models/profile'
import KitLike from '#kits/models/kit_like'
import KitComment from '#kits/models/kit_comment'

export default class Kit extends KitSchema {
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

  @belongsTo(() => Profile, { foreignKey: 'did', localKey: 'did' })
  declare profile: BelongsTo<typeof Profile>

  @hasMany(() => KitLike)
  declare kitLikes: HasMany<typeof KitLike>

  @hasMany(() => KitComment)
  declare comments: HasMany<typeof KitComment>

  static async hasKitsFor(did: string): Promise<boolean> {
    const result = await Kit.query().where('did', did).count('* as total').first()
    return Number(result?.$extras?.total ?? 0) > 0
  }

  /**
   * How many kits are on a builder's shelf.
   */
  static async countFor(did: string): Promise<number> {
    const result = await Kit.query().where('did', did).count('* as total').first()
    return Number(result?.$extras?.total ?? 0)
  }

  static async storedCoverPlaceholder(uri: string, coverCid: string): Promise<string | null> {
    const kit = await Kit.findBy('uri', uri)
    if (kit?.photos?.[0] !== coverCid) {
      return null
    }
    return kit.coverPlaceholder
  }

  static async randomFeatured(): Promise<Kit | null> {
    return Kit.query().whereNotNull('photos').orderByRaw('RAND()').first()
  }
}
