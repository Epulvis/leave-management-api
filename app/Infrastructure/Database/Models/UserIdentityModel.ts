import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class UserIdentityModel extends BaseModel {
  public static table = 'user_identities'

  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public provider: string

  @column()
  public providerId: string

  @column()
  public token: string

  @column()
  public refreshToken: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}