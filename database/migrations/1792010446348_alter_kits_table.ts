import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'kits'

  async up() {
    const hasColumn = await this.schema.hasColumn(this.tableName, 'photo_cid')
    if (!hasColumn) return

    this.defer(async (db) => {
      const rows = await db
        .from(this.tableName)
        .whereNull('photos')
        .whereNotNull('photo_cid')
        .select('id', 'photo_cid')

      for (const row of rows) {
        await db
          .from(this.tableName)
          .where('id', row.id)
          .update({ photos: JSON.stringify([row.photo_cid]) })
      }
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('photo_cid')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('photo_cid').nullable()
    })
  }
}
