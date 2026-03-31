import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { OAuthLoginUseCase, OAuthProfileDTO } from '../../../UseCases/Auth/OAuthLoginUseCase'
import { LucidUserRepository } from '../../../Infrastructure/Repositories/LucidUserRepository'
import { LucidUserIdentityRepository } from '../../../Infrastructure/Repositories/LucidUserIdentityRepository'
import { AdonisLogger } from '../../../Infrastructure/Logging/AdonisLogger'
import { TechnicalError } from '../../../Shared/Errors/TechnicalError'
import { AuthorizationError } from '../../../Shared/Errors/AuthorizationError'
import ApiResponse from '../Responses/ApiResponse'
import UserModel from 'App/Infrastructure/Database/Models/UserModel'

export default class OAuthController {
  private userRepository = new LucidUserRepository()
  private identityRepository = new LucidUserIdentityRepository()
  private logger = new AdonisLogger()

  // Endpoint: GET /api/v1/oauth/:provider/redirect
  public async redirect({ ally, params, response }: HttpContextContract) {
    const provider = params.provider

    // Validasi provider yang diizinkan
    if (!['google', 'github', 'linkedin'].includes(provider)) {
      return response.status(400).json(ApiResponse.error('Provider OAuth tidak didukung.'))
    }

    return ally.use(provider as any).redirect()
  }

  // Endpoint: GET /api/v1/oauth/:provider/callback
  public async callback({ ally, params, auth, response }: HttpContextContract) {
    const provider = params.provider as 'google' | 'github' | 'linkedin'
    const allyDriver = ally.use(provider)

    // 1. Handle error dari Provider (User menolak akses, dll)
    if (allyDriver.accessDenied()) {
      throw new AuthorizationError('Anda membatalkan proses login otorisasi.')
    }
    if (allyDriver.stateMisMatch()) {
      throw new TechnicalError('CSRF State Mismatch. Pastikan Anda mengetes langsung dari Browser (bukan Postman) dan konfigurasi cookie secure=false di localhost.')
    }
    
    if (allyDriver.hasError()) {
      throw new TechnicalError(`Google menolak otorisasi dengan error: ${allyDriver.getError()}`)
    }

    // 2. Ambil data profil dari Provider
    const providerUser = await allyDriver.user()

    // 3. Mapping data framework-specific ke Pure DTO
    const profileData: OAuthProfileDTO = {
      provider: provider,
      providerId: providerUser.id,
      email: providerUser.email,
      fullName: providerUser.name || providerUser.nickName || 'Unknown User',
      token: providerUser.token.token,
      refreshToken: providerUser.token.token,
    }

    // 4. Eksekusi Business Logic di UseCase
    const useCase = new OAuthLoginUseCase(this.userRepository, this.identityRepository, this.logger)
    const user = await useCase.execute(profileData)
    const userModel = await UserModel.findOrFail(user.id)

    // 5. Generate Access Token sistem kita (Adonis Auth)
    const apiToken = await auth.use('api').generate(userModel, {
      expiresIn: '7 days'
    })

    // 6. Kembalikan Respon (Jika ini API untuk SPA/Mobile, token dikembalikan via JSON)
    // Jika menggunakan Web tradisional, biasanya di-redirect sambil membawa cookie
    return response.status(200).json(ApiResponse.success(`Berhasil login menggunakan ${provider}`, {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: user.role
      },
      token: apiToken.token
    }))
  }
}