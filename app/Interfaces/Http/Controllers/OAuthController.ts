import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { OAuthLoginUseCase, OAuthProfileDTO } from '../../../UseCases/Auth/OAuthLoginUseCase'
import { LucidUserRepository } from '../../../Infrastructure/Repositories/LucidUserRepository'
import { LucidUserIdentityRepository } from '../../../Infrastructure/Repositories/LucidUserIdentityRepository'
import { AdonisLogger } from '../../../Infrastructure/Logging/AdonisLogger'
import { TechnicalError } from '../../../Shared/Errors/TechnicalError'
import { AuthorizationError } from '../../../Shared/Errors/AuthorizationError'
import ApiResponse from '../Responses/ApiResponse'
import UserModel from 'App/Infrastructure/Database/Models/UserModel'
import { ErrorCodes, SystemMessages } from 'App/Shared/Constants/ErrorDictionary'

export default class OAuthController {
  private userRepository = new LucidUserRepository()
  private identityRepository = new LucidUserIdentityRepository()
  private logger = new AdonisLogger()

  public async redirect({ ally, params}: HttpContextContract) {
    const provider = params.provider

    if (!['google', 'github', 'linkedin'].includes(provider)) {
      throw new TechnicalError(SystemMessages.BAD_REQUEST, {
        code: ErrorCodes.BAD_REQUEST,
        details: SystemMessages.BAD_REQUEST,
      })
    }

    return ally.use(provider as any).redirect()
  }

  public async callback({ ally, params, auth, response }: HttpContextContract) {
    const provider = params.provider as 'google' | 'github' | 'linkedin'
    const allyDriver = ally.use(provider)

    if (allyDriver.accessDenied()) {
      throw new AuthorizationError(SystemMessages.AUTH_OAUTH_CANCELLED, {
          code: ErrorCodes.AUTH_OAUTH_CANCELLED,
          details: SystemMessages.AUTH_OAUTH_CANCELLED,
      })
    }
    if (allyDriver.stateMisMatch()) {
      throw new TechnicalError(SystemMessages.AUTH_OAUTH_ERROR, {
          code: ErrorCodes.AUTH_OAUTH_ERROR,
          details: SystemMessages.AUTH_OAUTH_STATE_MISMATCH,
      })
    }
    
    if (allyDriver.hasError()) {
      throw new TechnicalError(SystemMessages.AUTH_OAUTH_ERROR, {
          code: ErrorCodes.AUTH_OAUTH_ERROR,
          details: allyDriver.getError(),
      })
    }

    const providerUser = await allyDriver.user()

    const profileData: OAuthProfileDTO = {
      provider: crypto.randomUUID(),
      providerId: providerUser.id,
      email: providerUser.email,
      fullName: providerUser.name || providerUser.nickName || 'Unknown User',
      token: providerUser.token.token,
      refreshToken: providerUser.token.token,
    }

    const useCase = new OAuthLoginUseCase(this.userRepository, this.identityRepository, this.logger)
    const user = await useCase.execute(profileData)
    const userModel = await UserModel.findOrFail(user.id)

    const apiToken = await auth.use('api').generate(userModel, {
      expiresIn: '7 days'
    })

    return response.status(200).json(ApiResponse.success(SystemMessages.AUTH_OAUTH_LINKED, {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
      },
      token: apiToken.token
    }))
  }
}