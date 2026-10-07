import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'build_logs'

  async up() {
    this.schema.dropTable(this.tableName)
  }

  async down() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uri').notNullable().unique()
      table.string('cid').nullable()
      table.string('did').notNullable().index()
      table.string('kit_uri').notNullable().index()
      table.string('stage').nullable()
      table.text('text').nullable()
      table.timestamp('record_created_at').nullable()
      table.timestamp('indexed_at').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }
}
