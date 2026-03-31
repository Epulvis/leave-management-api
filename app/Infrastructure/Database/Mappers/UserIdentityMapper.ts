import { UserIdentity } from '../../../Domain/Entities/UserIdentity'
import UserIdentityModel from '../Models/UserIdentityModel'

export class UserIdentityMapper {
  public static toDomain(raw: UserIdentityModel): UserIdentity {
    return new UserIdentity(
      raw.id,
      raw.userId,
      raw.provider,
      raw.providerId,
      raw.token,
      raw.refreshToken
    )
  }

  public static toPersistence(domain: UserIdentity): Partial<UserIdentityModel> {
    return {
      userId: domain.userId,
      provider: domain.provider,
      providerId: domain.providerId,
      token: domain.token,
      refreshToken: domain.refreshToken,
    }
  }
}