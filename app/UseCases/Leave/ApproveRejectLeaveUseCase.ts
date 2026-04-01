import { ILeaveRepository } from '../../Domain/Repositories/ILeaveRepository'
import { ILogger } from '../../Domain/Services/ILogger'
import { LeaveApplication } from '../../Domain/Entities/LeaveApplication'
import { LeaveStatus } from '../../Domain/Enums/LeaveStatus'
import { AuthorizationError } from '../../Shared/Errors/AuthorizationError'
import { NotFoundError } from '../../Shared/Errors/NotFoundError'
import { DomainError } from '../../Shared/Errors/DomainError'
import { DateTime } from 'luxon'
import { LogEvents } from 'App/Shared/Constants/LogEvents'
import { ErrorCodes, SystemMessages } from 'App/Shared/Constants/ErrorDictionary'

interface ExecuteLeaveDTO {
  applicationId: string;
  adminId: string;
  adminRole: string;
  action: LeaveStatus.APPROVED | LeaveStatus.REJECTED;
}

export class ApproveRejectLeaveUseCase {
  constructor(
    private leaveRepository: ILeaveRepository,
    private logger: ILogger
  ) {}

  public async execute(data: ExecuteLeaveDTO): Promise<LeaveApplication> {
    this.validateAdminRole(data.adminRole);

    const application = await this.findApplication(data.applicationId);

    this.validateStatusIsPending(application.status);

    const newStatus = data.action === LeaveStatus.APPROVED ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
    this.updateApplicationStatus(application, newStatus, data.adminId);

    if (newStatus === LeaveStatus.REJECTED) {
      await this.refundLeaveBalance(application);
    }

    const savedApplication = await this.leaveRepository.saveApplication(application);

    this.logger.info(LogEvents.LEAVE_STATUS_UPDATED, {
      id: application.id,
      adminId: application.approvedBy,
      employeeId: application.userId,
      status: savedApplication.status
    });

    return savedApplication;
  }

  private validateAdminRole(role: string): void {
    if (role !== 'admin') {
      throw new AuthorizationError(SystemMessages.UNAUTHORIZED, { code: ErrorCodes.AUTH_UNAUTHORIZED});
    }
  }

  private async findApplication(id: string): Promise<LeaveApplication> {
    const application = await this.leaveRepository.findApplicationById(id);
    if (!application) {
      throw new NotFoundError(SystemMessages.LEAVE_APPLICATION_NOT_FOUND, { code: ErrorCodes.LEAVE_APPLICATION_NOT_FOUND });
    }
    return application;
  }

  private validateStatusIsPending(status: LeaveStatus): void {
    if (status !== LeaveStatus.PENDING) {
      throw new DomainError(SystemMessages.LEAVE_APPLICATION_NOT_PENDING, { code: ErrorCodes.LEAVE_APPLICATION_NOT_PENDING });
    }
  }

  private updateApplicationStatus(application: LeaveApplication, newStatus: LeaveStatus, adminId: string): void {
    application.status = newStatus;
    application.approvedBy = adminId;
    application.approvedAt = DateTime.now()
  }

  private async refundLeaveBalance(application: LeaveApplication): Promise<void> {
    const year = application.startDate.year;
    
    const balance = await this.leaveRepository.findBalance(application.userId, year);
    
    if (balance) {
      balance.usedAllowance -= 1;
      
      if (balance.usedAllowance < 0) balance.usedAllowance = 0;
      
      await this.leaveRepository.saveBalance(balance);
      
      this.logger.debug(LogEvents.LEAVE_BALANCE_REFUNDED, {
        userId: application.userId,
        daysRefunded: application.totalDays,
        year,
      });
    }
  }
}