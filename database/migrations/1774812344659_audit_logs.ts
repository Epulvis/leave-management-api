import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AuditLogsSchema extends BaseSchema {
  protected tableName = 'audit_logs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.uuid('user_id').references('id').inTable('users').nullable()
      table.string('action', 100).notNullable()
      table.string('entity_type', 50).notNullable()
      table.string('entity_id', 50).notNullable()
      table.json('old_values').nullable()
      table.json('new_values').notNullable()
      table.string('ip_address', 45).nullable()
      table.text('user_agent').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}