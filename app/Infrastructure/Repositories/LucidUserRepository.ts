import { IUserRepository } from '../../Domain/Repositories/IUserRepository'
import { User } from '../../Domain/Entities/User'
import UserModel from '../Database/Models/UserModel'
import { UserMapper } from '../Database/Mappers/UserMapper'

export class LucidUserRepository implements IUserRepository {
  public async findByEmail(email: string): Promise<User | null> {
    const userModel = await UserModel.findBy('email', email)
    if (!userModel) return null

    return UserMapper.toDomain(userModel)
  }

  public async save(user: User): Promise<User> {
    const persistenceData = UserMapper.toPersistence(user)
    
    if (!user.id) {
      persistenceData.id = crypto.randomUUID()
    }

    const userModel = new UserModel()
    userModel.fill(persistenceData)
    await userModel.save()

    return UserMapper.toDomain(userModel)
  }
}