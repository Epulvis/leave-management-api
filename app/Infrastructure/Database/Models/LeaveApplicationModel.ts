import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class LeaveApplicationModel extends BaseModel {
  public static table = 'leave_applications'

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: string

  @column.date()
  public startDate: DateTime

  @column.date()
  public endDate: DateTime

  @column()
  public totalDays: number

  @column()
  public reason: string

  @column()
  public attachmentPath: string

  @column()
  public status: string

  @column()
  public approvedBy: string | null

  @column.dateTime()
  public approvedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}