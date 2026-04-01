import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { GetAllLeavesUseCase } from '../../../UseCases/Leave/GetAllLeavesUseCase'
import { ApproveRejectLeaveUseCase } from '../../../UseCases/Leave/ApproveRejectLeaveUseCase'
import { LucidLeaveRepository } from '../../../Infrastructure/Repositories/LucidLeaveRepository'
import { AdonisLogger } from '../../../Infrastructure/Logging/AdonisLogger'
import { ExecuteLeaveValidator } from '../Validators/AdminLeaveValidator'
import ApiResponse from '../Responses/ApiResponse'
import { SystemMessages } from 'App/Shared/Constants/ErrorDictionary'
import { LeaveStatus } from 'App/Domain/Enums/LeaveStatus'

export default class AdminLeaveController {
  private leaveRepository: LucidLeaveRepository
  private logger: AdonisLogger

  constructor() {
    this.leaveRepository = new LucidLeaveRepository()
    this.logger = new AdonisLogger()
  }

  public async index({ response, auth }: HttpContextContract) {
    const user = auth.use('api').user!

    const useCase = new GetAllLeavesUseCase(this.leaveRepository, this.logger)
    const leaves = await useCase.execute(user.role)

    return response.status(200).json(ApiResponse.success(SystemMessages.LEAVE_GET_ALL_SUCCESS, leaves))
  }

  public async executeStatus({ request, response, auth, params }: HttpContextContract) {
    const user = auth.use('api').user!
    const payload = await request.validate(ExecuteLeaveValidator)
    const applicationId = params.id

    const useCase = new ApproveRejectLeaveUseCase(this.leaveRepository, this.logger)
    
    const result = await useCase.execute({
      applicationId: applicationId,
      adminId: user.id,
      adminRole: user.role,
      action: payload.action.toUpperCase() === 'APPROVE' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED
    })

    const message = payload.action === 'approve'
      ? SystemMessages.LEAVE_APPROVE_SUCCESS : SystemMessages.LEAVE_REJECT_SUCCESS

    return response.status(200).json(ApiResponse.success(message, result))
  }
}