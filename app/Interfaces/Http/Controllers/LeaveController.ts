import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import { ApplyLeaveValidator } from '../Validators/LeaveValidator'
import { AdonisLogger } from '../../../Infrastructure/Logging/AdonisLogger'
import { ApplyLeaveUseCase } from '../../../UseCases/Leave/ApplyLeaveUseCase'
import { GetMyLeavesUseCase } from '../../../UseCases/Leave/GetMyLeavesUseCase'
import { LucidLeaveRepository } from '../../../Infrastructure/Repositories/LucidLeaveRepository'
import ApiResponse from '../Responses/ApiResponse'
import { TechnicalError } from '../../../Shared/Errors/TechnicalError'
import { SystemMessages } from 'App/Shared/Constants/ErrorDictionary'

export default class LeaveController {
  private leaveRepository: LucidLeaveRepository

  constructor() {
    this.leaveRepository = new LucidLeaveRepository()
  }

  public async apply({ request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    
    const payload = await request.validate(ApplyLeaveValidator)

    const attachment = request.file('attachment')
    if (!attachment) {
      throw new TechnicalError(SystemMessages.LEAVE_APPLICATION_FAILED, { errorCode: SystemMessages.LEAVE_APPLICATION_FAILED })
    }

    const fileName = `${new Date().getTime()}_${attachment.clientName}`
    await attachment.move(Application.tmpPath('uploads'), {
      name: fileName,
    })
    
    const attachmentPath = `uploads/${fileName}`

    const useCase = new ApplyLeaveUseCase(this.leaveRepository, new AdonisLogger())
    
    const result = await useCase.execute({
      userId: user.id,
      role: user.role,
      startDate: payload.start_date.toJSDate(),
      endDate: payload.end_date.toJSDate(),
      reason: payload.reason,
      attachmentPath: attachmentPath
    })

    return response.status(201).json(ApiResponse.success(SystemMessages.LEAVE_APPLICATION_SUCCESS, result))
  }

  public async getMyHistory({ response, auth }: HttpContextContract) {
    const user = auth.use('api').user!

    const useCase = new GetMyLeavesUseCase(this.leaveRepository)
    const history = await useCase.execute(user.id)

    return response.status(200).json(ApiResponse.success(SystemMessages.LEAVE_GET_ALL_SUCCESS, history))
  }
}