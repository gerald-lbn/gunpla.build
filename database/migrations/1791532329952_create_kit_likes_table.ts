import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'kit_likes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('kit_id').unsigned().notNullable().references('kits.id').onDelete('CASCADE')
      table.string('did').notNullable()
      table.string('uri').notNullable()
      table.timestamp('created_at').notNullable()

      table.unique(['did', 'kit_id'], { indexName: 'kit_likes_did_kit_unique' })
      table.index(['kit_id'], 'kit_likes_kit_id_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
