import { ILeaveRepository } from '../../Domain/Repositories/ILeaveRepository'
import { LeaveApplication } from '../../Domain/Entities/LeaveApplication'
import { LeaveBalance } from '../../Domain/Entities/LeaveBalance'
import LeaveApplicationModel from '../Database/Models/LeaveApplicationModel'
import LeaveBalanceModel from '../Database/Models/LeaveBalanceModel'
import { LeaveMapper } from '../Database/Mappers/LeaveMapper'
import { InfrastructureError } from '../../Shared/Errors/InfrastructureError'
import { SystemMessages } from 'App/Shared/Constants/ErrorDictionary'

export class LucidLeaveRepository implements ILeaveRepository {
  public async saveApplication(application: LeaveApplication): Promise<LeaveApplication> {
    try {
      const model = new LeaveApplicationModel()
      model.fill(LeaveMapper.toPersistence(application))
      await model.save()
      return LeaveMapper.toDomain(model)
    } catch (error: any) {
      throw new InfrastructureError(SystemMessages. LEAVE_APPLICATION_FAILED, {
        details: error.message
      })
    }
  }

  public async findApplicationsByUserId(userId: string): Promise<LeaveApplication[]> {
    const models = await LeaveApplicationModel.query().where('user_id', userId).orderBy('created_at', 'desc')
    return models.map(model => LeaveMapper.toDomain(model))
  }

  public async findBalance(userId: string, year: number): Promise<LeaveBalance | null> {
    const model = await LeaveBalanceModel.query().where('user_id', userId).where('period_year', year).first()
    if (!model) return null
    return new LeaveBalance(model.id, model.userId, model.periodYear, model.totalAllowance, model.usedAllowance)
  }

  public async saveBalance(balance: LeaveBalance): Promise<LeaveBalance> {
    try {
      const model = await LeaveBalanceModel.firstOrCreate(
        { userId: balance.userId, periodYear: balance.periodYear },
        { totalAllowance: balance.totalAllowance, usedAllowance: balance.usedAllowance }
      )
      model.usedAllowance = balance.usedAllowance
      await model.save()
      return new LeaveBalance(model.id, model.userId, model.periodYear, model.totalAllowance, model.usedAllowance)
    } catch (error: any) {
      throw new InfrastructureError(SystemMessages.LEAVE_BALANCE_UPDATED_FAILED, {
        details: error.message
      })
    }
  }

  public async findAllApplications(): Promise<LeaveApplication[]> {
    const models = await LeaveApplicationModel.query().orderBy('created_at', 'desc')
    return models.map(model => LeaveMapper.toDomain(model))
  }

  public async findApplicationById(id: string): Promise<LeaveApplication | null> {
    const model = await LeaveApplicationModel.find(id)
    if (!model) return null
    return LeaveMapper.toDomain(model)
  }
}