import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class LeaveBalancesModel extends BaseModel {
  public static table = 'leave_balances'

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: string

  @column()
  public periodYear: number

  @column()
  public totalAllowance: number

  @column()
  public usedAllowance: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}