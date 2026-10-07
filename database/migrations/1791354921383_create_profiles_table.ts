import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('did').primary().notNullable()
      table.string('handle').notNullable().unique()
      table.string('display_name').nullable()
      table.string('avatar_url').nullable()
      table.text('description').nullable()
      table.timestamp('indexed_at').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
