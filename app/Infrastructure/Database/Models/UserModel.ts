import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, BaseModel, beforeSave } from '@ioc:Adonis/Lucid/Orm'

export default class UserModel extends BaseModel {
  public static table = 'users'

  @column({ isPrimary: true })
  public id: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password?: string

  @column()
  public fullName: string

  @column()
  public role: 'employee' | 'admin'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: UserModel) {
    if (user.$dirty.password && user.password) {
      user.password = await Hash.make(user.password)
    }
  }
}