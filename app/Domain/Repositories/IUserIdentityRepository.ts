import { UserIdentity } from '../Entities/UserIdentity'

export interface IUserIdentityRepository {
  findByProvider(provider: string, providerId: string): Promise<UserIdentity | null>
  save(identity: UserIdentity): Promise<UserIdentity>
}