import { IUserRepository } from '../../Domain/Repositories/IUserRepository';
import { IUserIdentityRepository } from '../../Domain/Repositories/IUserIdentityRepository';
import { ILogger } from '../../Domain/Services/ILogger';
import { User } from '../../Domain/Entities/User';
import { UserIdentity } from '../../Domain/Entities/UserIdentity';
import { DomainError } from '../../Shared/Errors/DomainError';
import { NotFoundError } from '../../Shared/Errors/NotFoundError';
import { DomainMessages, ErrorCodes } from '../../Shared/Constants/ErrorDictionary';
import { LogEvents } from '../../Shared/Constants/LogEvents';
import { Role } from 'App/Domain/Enums/Role';

export interface OAuthProfileDTO {
  provider: string;
  providerId: string;
  email: string | null;
  fullName: string;
  token: string;
  refreshToken?: string;
}

export class OAuthLoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private userIdentityRepository: IUserIdentityRepository,
    private logger: ILogger
  ) {}

  public async execute(profile: OAuthProfileDTO): Promise<User> {
    this.validateEmailExists(profile);

    const existingIdentity = await this.findExistingIdentity(profile);
    if (existingIdentity) {
      return await this.getUserFromIdentity(existingIdentity);
    }

    return await this.handleNewIdentity(profile);
  }

  private validateEmailExists(profile: OAuthProfileDTO): void {
    if (!profile.email) {
      throw new DomainError(
        DomainMessages.OAUTH_EMAIL_MISSING,
        {
          code: ErrorCodes.AUTH_OAUTH_EMAIL_MISSING,
          details: { provider: profile.provider },
        }
      );
    }
  }

  private async findExistingIdentity(
    profile: OAuthProfileDTO
  ): Promise<UserIdentity | null> {
    return await this.userIdentityRepository.findByProvider(
      profile.provider,
      profile.providerId
    );
  }

  private async getUserFromIdentity(identity: UserIdentity): Promise<User> {
    const user = await this.userRepository.findById(identity.userId);
    if (!user) {
      throw new NotFoundError(DomainMessages.USER_NOT_FOUND_OAUTH, {
        code: ErrorCodes.AUTH_USER_NOT_FOUND,
      });
    }
    return user;
  }

  private async handleNewIdentity(profile: OAuthProfileDTO): Promise<User> {
    let user = await this.userRepository.findByEmail(profile.email!);

    if (!user) {
      user = await this.createNewUser(profile);
      this.logger.info(LogEvents.AUTH_NEW_USER, {
        email: profile.email,
        provider: profile.provider,
      });
    } else {
      this.logger.info(LogEvents.AUTH_OAUTH_LINKED, {
        email: profile.email,
        provider: profile.provider,
      });
    }

    await this.saveIdentity(user, profile);

    return user;
  }

  private async createNewUser(profile: OAuthProfileDTO): Promise<User> {
    const user = new User(
      null,
      profile.email!,
      profile.fullName,
      Role.EMPLOYEE,
      undefined
    );
    return await this.userRepository.save(user);
  }

  private async saveIdentity(user: User, profile: OAuthProfileDTO): Promise<void> {
    const identity = new UserIdentity(
      null,
      user.id as string,
      profile.provider,
      profile.providerId,
      profile.token,
      profile.refreshToken || null
    );
    await this.userIdentityRepository.save(identity);
  }
}