import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class LeaveBalancesSchema extends BaseSchema {
  protected tableName = 'leave_balances'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.integer('period_year').notNullable()
      table.integer('total_allowance').defaultTo(12)
      table.integer('used_allowance').defaultTo(0)

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}