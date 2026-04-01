import { IUserRepository } from '../../Domain/Repositories/IUserRepository'
import { User } from '../../Domain/Entities/User'
import { DomainError } from 'App/Shared/Errors/DomainError';
import { ErrorCodes, SystemMessages } from 'App/Shared/Constants/ErrorDictionary';
import { Role } from 'App/Domain/Enums/Role';
import { LogEvents } from 'App/Shared/Constants/LogEvents';
import { ILogger } from 'App/Domain/Services/ILogger';

export interface AuthProfileDTO {
  email: string;
  password: string;
  fullName: string;
}

export interface RequestMetadata {
  ipAddress: string;
  userAgent?: string;
  url: string;
}

export class RegisterUseCase {
  constructor(private userRepository: IUserRepository, private logger: ILogger) {}

  public async execute(data: AuthProfileDTO, meta: RequestMetadata): Promise<User> {
    this.validateEmailExists(data);

    this.logger.info(LogEvents.AUTH_NEW_USER, {
      details: {
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        url : meta.url
      }
    })

    return await this.saveUser(data);
  }

  private async validateEmailExists(data: AuthProfileDTO): Promise<void> {
    const existingUser = await this.findUserByEmail(data.email)

    if (existingUser) {
      throw new DomainError(
        SystemMessages.AUTH_EMAIL_ALREADY_REGISTERED,
        {
          code: ErrorCodes.AUTH_USER_ALREADY_EXISTS,
          details: { email: data.email },
        }
      );
    }
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }
  
  private async saveUser(data: AuthProfileDTO): Promise<User> {
    const newUser = new User(
      null,
      data.email,
      data.fullName,
      Role.EMPLOYEE,
      data.password
    );
    return await this.userRepository.save(newUser);
  }
}