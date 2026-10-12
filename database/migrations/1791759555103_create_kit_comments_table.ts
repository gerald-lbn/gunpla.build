import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'kit_comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('kit_id').unsigned().notNullable().references('kits.id').onDelete('CASCADE')
      table.string('did').notNullable()
      table.string('uri').notNullable().unique()
      table.text('text').notNullable()
      table.timestamp('created_at').notNullable()

      table.index(['kit_id', 'created_at'], 'kit_comments_kit_id_created_at_idx')
      table.index(['did'], 'kit_comments_did_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
