import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AdonisHashService } from '../../../Infrastructure/Security/AdonisHashService'
import { RegisterValidator, LoginValidator } from '../Validators/AuthValidator'
import { RegisterUseCase } from '../../../UseCases/Auth/RegisterUseCase'
import { LoginUseCase } from '../../../UseCases/Auth/LoginUseCase'
import { LucidUserRepository } from '../../../Infrastructure/Repositories/LucidUserRepository'
import UserModel from '../../../Infrastructure/Database/Models/UserModel'
import ApiResponse from '../Responses/ApiResponse'
import { ILogger } from 'App/Domain/Services/ILogger'
import { AdonisLogger } from 'App/Infrastructure/Logging/AdonisLogger'
import { ErrorCodes, SystemMessages } from 'App/Shared/Constants/ErrorDictionary'
import { ValidationError } from 'App/Shared/Errors/ValidationError'


export default class AuthController {
  private userRepository: LucidUserRepository
  private customLogger: ILogger = new AdonisLogger()

  constructor() {
    this.userRepository = new LucidUserRepository()
  }

  public async register({ request, response }: HttpContextContract) {
    try {
      const payload = await request.validate(RegisterValidator)
      
      const useCase = new RegisterUseCase(this.userRepository, this.customLogger)
      
      const user = await useCase.execute({
        email: payload.email,
        password: payload.password,
        fullName: payload.full_name
      }, {
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
        url: request.url()

      })

      return response.status(201).json(ApiResponse.success(SystemMessages.AUTH_REGISTER_SUCCESS, {
        id: user.id,
        email: user.email,
        full_name: user.fullName
      }))

    } catch (error) {
      if (error.messages) {
        throw new ValidationError(SystemMessages.VALIDATION_FAILED, {
          code: ErrorCodes.VALIDATION_ERROR,
          details: error.messages,
        })
      }
      throw new ValidationError(SystemMessages.BAD_REQUEST, {
        code: ErrorCodes.BAD_REQUEST,
        details: error.message,
      })
    }
  }

  public async login({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(LoginValidator)

    console.log(request)
    const requestMeta = {
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
      url: request.url()
    }
    
    const hashService = new AdonisHashService()
    const useCase = new LoginUseCase(this.userRepository, hashService, this.customLogger)
    
    const userDomain = await useCase.execute(payload.email, payload.password, requestMeta)
    const userModel = await UserModel.findOrFail(userDomain.id)

    const token = await auth.use('api').generate(userModel, {
      expiresIn: '7 days'
    })

    return response.status(200).json(ApiResponse.success(SystemMessages.AUTH_LOGIN_SUCCESS, {
      user: { 
        id: userDomain.id, 
        email: userDomain.email, 
        fullName: userDomain.fullName, 
      },
      token: token.token
    }))
  }
}