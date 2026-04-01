import { Role } from 'App/Domain/Enums/Role'
import { User } from '../../../Domain/Entities/User'
import UserModel from '../Models/UserModel'

export class UserMapper {
  public static toDomain(raw: UserModel): User {
    return new User(
      raw.id,
      raw.email,
      raw.fullName,
      raw.role as Role,
      raw.password
    )
  }

  public static toPersistence(domain: User): Partial<UserModel> {
    return {
      id : domain.id || undefined,
      email: domain.email,
      fullName: domain.fullName,
      role: domain.role,
      password: domain.password,
    }
  }
}