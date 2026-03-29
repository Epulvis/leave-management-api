import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserIdentitiesSchema extends BaseSchema {
  protected tableName = 'user_identities'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('provider', 50).notNullable()
      table.string('provider_id', 100).notNullable()
      table.text('token').notNullable()
      table.text('refresh_token').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}