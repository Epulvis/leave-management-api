import { IUserRepository } from '../../Domain/Repositories/IUserRepository'
import { IUserIdentityRepository } from '../../Domain/Repositories/IUserIdentityRepository'
import { ILogger } from '../../Domain/Services/ILogger'
import { User } from '../../Domain/Entities/User'
import { UserIdentity } from '../../Domain/Entities/UserIdentity'
import { DomainError } from '../../Shared/Errors/DomainError'

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
    if (!profile.email) {
      throw new DomainError(`Provider ${profile.provider} tidak mengembalikan alamat email. Email diperlukan untuk pendaftaran.`)
    }

    // 1. Cek apakah identitas (Provider + Provider ID) sudah ada
    const existingIdentity = await this.userIdentityRepository.findByProvider(profile.provider, profile.providerId);
    
    if (existingIdentity) {
      // User sudah pernah login pakai provider ini. Ambil data User-nya.
      const user = await this.userRepository.findById(existingIdentity.userId); // Pastikan method ini ada di IUserRepository
      if (!user) throw new DomainError('Data akun pengguna tidak ditemukan.');
      return user;
    }

    // 2. Jika identitas belum ada, cek apakah email sudah terdaftar di sistem (via Register biasa atau Provider lain)
    let user = await this.userRepository.findByEmail(profile.email);

    if (!user) {
      // 3. Jika email belum ada sama sekali, buat User BARU
      user = new User(
        profile.providerId,
        profile.email,
        profile.fullName,
        'employee', // Default role
        undefined // Password null untuk OAuth
      );
      user = await this.userRepository.save(user);
      
      this.logger.info('Pengguna baru mendaftar melalui OAuth', { email: profile.email, provider: profile.provider });
    } else {
      this.logger.info('Identitas OAuth baru ditautkan ke akun yang sudah ada', { email: profile.email, provider: profile.provider });
    }

    // 4. Tautkan / Buat UserIdentity baru untuk user tersebut
    const newIdentity = new UserIdentity(
      null,
      user.id as string,
      profile.provider,
      profile.providerId,
      profile.token,
      profile.refreshToken || null
    );
    await this.userIdentityRepository.save(newIdentity);

    return user;
  }
}