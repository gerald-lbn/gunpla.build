import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'kits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uri').notNullable().unique()
      table.string('cid').nullable()
      table.string('did').notNullable().index()
      table.string('name').notNullable()
      table.string('grade').nullable()
      table.string('scale').nullable()
      table.string('status').notNullable().defaultTo('backlog')
      table.timestamp('record_created_at').nullable()
      table.timestamp('indexed_at').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
