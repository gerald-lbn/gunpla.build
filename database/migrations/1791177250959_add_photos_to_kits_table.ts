import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'kits'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('photos').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('photos')
    })
  }
}
