import { IUserRepository } from '../../Domain/Repositories/IUserRepository'
import { IHashService } from '../../Domain/Services/IHashService'
import { User } from '../../Domain/Entities/User'
import { AuthorizationError } from 'App/Shared/Errors/AuthorizationError'

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService
  ) {}

  public async execute(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)
    
    if (!user || !user.password) {
      throw new AuthorizationError('Invalid credentials')
    }

    const isPasswordValid = await this.hashService.verify(user.password, password)
    
    if (!isPasswordValid) {
      throw new AuthorizationError('Invalid credentials')
    }

    return user
  }
}