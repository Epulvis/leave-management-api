import { IUserRepository } from '../../Domain/Repositories/IUserRepository'
import { User } from '../../Domain/Entities/User'
import { ConflictError } from 'App/Shared/Errors/ConflictError'

export class RegisterUseCase {
  constructor(private userRepository: IUserRepository) {}

  public async execute(data: any): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email)
    
    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    const newUser = new User(
      data.id,
      data.email,
      data.fullName,
      'employee',
      data.password
    )

    return await this.userRepository.save(newUser)
  }
}