import { ILeaveRepository } from '../../Domain/Repositories/ILeaveRepository'
import { ILogger } from '../../Domain/Services/ILogger'
import { LeaveApplication } from '../../Domain/Entities/LeaveApplication'
import { AuthorizationError } from '../../Shared/Errors/AuthorizationError'
import { ErrorCodes, SystemMessages } from 'App/Shared/Constants/ErrorDictionary';
import { LogEvents } from 'App/Shared/Constants/LogEvents';

export class GetAllLeavesUseCase {
  constructor(
    private leaveRepository: ILeaveRepository,
    private logger: ILogger
  ) {}

  public async execute(userRole: string): Promise<LeaveApplication[]> {
    this.validateAdminRole(userRole);

    const applications = await this.leaveRepository.findAllApplications();

    this.logger.info(LogEvents.LEAVE_GET_ALL_SUCCESS, {
      totalData: applications.length
    });

    return applications;
  }

  private validateAdminRole(role: string): void {
    if (role !== 'admin') {
      throw new AuthorizationError(SystemMessages.AUTH_UNAUTHORIZED, { code: ErrorCodes.AUTH_UNAUTHORIZED });
    }
  }
}