import { IUserRepository } from '../../Domain/Repositories/IUserRepository';
import { IHashService } from '../../Domain/Services/IHashService';
import { User } from '../../Domain/Entities/User';
import { DomainMessages, ErrorCodes } from 'App/Shared/Constants/ErrorDictionary';
import { DomainError } from 'App/Shared/Errors/DomainError';
import { ILogger } from 'App/Domain/Services/ILogger';
import { LogEvents } from 'App/Shared/Constants/LogEvents';

export interface RequestMetadata {
  ipAddress: string;
  userAgent?: string;
  url: string;
}

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
    private logger: ILogger
  ) {}

  public async execute(email: string, password: string, meta: RequestMetadata): Promise<User> {
    const user = await this.findUserByEmail(email);
    
    await this.verifyPassword(user!, password);

    this.validateUserExists(user);

    this.logger.info(LogEvents.AUTH_LOGIN, {
      details: {
        id: user.id,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        url : meta.url
      }
    })

    return user!;
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  private validateUserExists(user: User | null): asserts user is User {
    if (!user || !user.password) {
      throw new DomainError(
        DomainMessages.INVALID_CREDENTIALS,
        { errorCode: ErrorCodes.AUTH_INVALID_CREDENTIALS }
      );
    }
  }

  private async verifyPassword(user: User, plainPassword: string): Promise<void> {
    if (!user.password) {
      throw new DomainError(
        DomainMessages.OAUTH_ACCOUNT_LOCAL_LOGIN,
        { errorCode: ErrorCodes.AUTH_OAUTH_REQUIRED }
      );
    }

    const isValid = await this.hashService.verify(user.password, plainPassword);
    if (!isValid) {
      throw new DomainError(
        DomainMessages.INVALID_CREDENTIALS,
        { errorCode: ErrorCodes.AUTH_INVALID_CREDENTIALS }
      );
    }
  }
}