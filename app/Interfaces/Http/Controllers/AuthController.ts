import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AdonisHashService } from '../../../Infrastructure/Security/AdonisHashService'
import { RegisterValidator, LoginValidator } from '../Validators/AuthValidator'
import { RegisterUseCase } from '../../../UseCases/Auth/RegisterUseCase'
import { LoginUseCase } from '../../../UseCases/Auth/LoginUseCase'
import { LucidUserRepository } from '../../../Infrastructure/Repositories/LucidUserRepository'
import UserModel from '../../../Infrastructure/Database/Models/UserModel'
import ApiResponse from '../Responses/ApiResponse'


export default class AuthController {
  private userRepository: LucidUserRepository

  constructor() {
    this.userRepository = new LucidUserRepository()
  }

  public async register({ request, response }: HttpContextContract) {
    try {
      const payload = await request.validate(RegisterValidator)
      
      const useCase = new RegisterUseCase(this.userRepository)
      
      // Mapping field dari request ke DTO yang diharapkan UseCase
      const user = await useCase.execute({
        email: payload.email,
        password: payload.password,
        fullName: payload.full_name
      })

      return response.status(201).json(ApiResponse.success('User registered successfully', {
        id: user.id,
        email: user.email,
        full_name: user.fullName
      }))

    } catch (error) {
      if (error.messages) {
        // Handle validation errors
        return response.status(422).json(ApiResponse.error('Validation failed', error.messages))
      }
      return response.status(400).json(ApiResponse.error(error.message))
    }
  }

  public async login({ request, response, auth }: HttpContextContract) {
    const payload = await request.validate(LoginValidator)
    
    const hashService = new AdonisHashService()
    const useCase = new LoginUseCase(this.userRepository, hashService)
    
    const userDomain = await useCase.execute(payload.email, payload.password)
    const userModel = await UserModel.findOrFail(userDomain.id)

    const token = await auth.use('api').generate(userModel, {
      expiresIn: '7 days'
    })

    return response.status(200).json(ApiResponse.success('Login successful', {
      user: { 
        id: userDomain.id, 
        email: userDomain.email, 
        fullName: userDomain.fullName, 
        role: userDomain.role 
      },
      token: token.token
    }))
  }
}