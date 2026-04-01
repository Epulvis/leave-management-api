import { ILeaveRepository } from '../../Domain/Repositories/ILeaveRepository'
import { LeaveApplication } from '../../Domain/Entities/LeaveApplication'

export class GetMyLeavesUseCase {
  constructor(private leaveRepository: ILeaveRepository) {}

  public async execute(userId: string): Promise<LeaveApplication[]> {
    return await this.leaveRepository.findApplicationsByUserId(userId)
  }
}