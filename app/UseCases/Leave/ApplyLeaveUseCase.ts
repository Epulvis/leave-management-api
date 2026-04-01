import { ILeaveRepository } from '../../Domain/Repositories/ILeaveRepository';
import { ILogger } from '../../Domain/Services/ILogger';
import { LeaveApplication } from '../../Domain/Entities/LeaveApplication';
import { LeaveBalance } from '../../Domain/Entities/LeaveBalance';
import { LeaveStatus } from '../../Domain/Enums/LeaveStatus';
import { DomainError } from '../../Shared/Errors/DomainError';
import { AuthorizationError } from '../../Shared/Errors/AuthorizationError';
import { DateTime } from 'luxon';
import { LogEvents } from 'App/Shared/Constants/LogEvents';
import { DomainMessages, ErrorCodes, SystemMessages } from 'App/Shared/Constants/ErrorDictionary';

interface ApplyLeaveDTO {
  userId: string;
  role: string;
  startDate: String | Date;
  endDate: String | Date;
  reason: string;
  attachmentPath: string;
}

export class ApplyLeaveUseCase {
  constructor(
    private leaveRepository: ILeaveRepository,
    private logger: ILogger
  ) {}

  public async execute(data: ApplyLeaveDTO): Promise<LeaveApplication> {
    this.validateRole(data.role);

    const start = this.parseDate(data.startDate);
    const end = this.parseDate(data.endDate);
    this.validateDates(start, end);

    const totalDays = this.calculateTotalDays(start, end);

    const currentYear = start.year;
    const balance = await this.getOrCreateBalance(data.userId, currentYear);

    this.validateQuota(balance);

    this.updateBalance(balance);

    const application = new LeaveApplication(
      null,
      data.userId,
      start,
      end,
      totalDays,
      data.reason,
      data.attachmentPath,
      LeaveStatus.PENDING
    );

    const savedApplication = await this.leaveRepository.saveApplication(application);
    await this.leaveRepository.saveBalance(balance);

    this.logger.info(LogEvents.LEAVE_CREATED, {
      userId: data.userId,
      details: {
        applicationId: application.id,
        totalDays,
        status: application.status
      }
    })

    return savedApplication;
  }

  private validateRole(role: string): void {
    if (role !== 'employee') {
      throw new AuthorizationError(SystemMessages.LEAVE_APPLICATION_FAILED, {
        code: SystemMessages.LEAVE_APPLICATION_FAILED
      });
    }
  }

  private parseDate(date: unknown): DateTime {
    let parsed: DateTime;

    if (typeof date === 'string') {
      parsed = DateTime.fromISO(date, { zone: 'utc' });
    } else if (date instanceof Date) {
      parsed = DateTime.fromJSDate(date, { zone: 'utc' });
    } else {
      throw new DomainError(DomainMessages.INVALID_INPUT, { errorCode: ErrorCodes.INVALID_INPUT });
    }

    if (!parsed.isValid) {
      throw new DomainError(DomainMessages.INVALID_INPUT, { errorCode: ErrorCodes.INVALID_INPUT });
    }

    return parsed.startOf('day');
  }

  private validateDates(start: DateTime, end: DateTime): void {
    if (!start.isValid || !end.isValid) {
      throw new DomainError(DomainMessages.INVALID_INPUT, { errorCode: ErrorCodes.INVALID_INPUT });
    }
    if (end < start) {
      throw new DomainError(DomainMessages.INVALID_INPUT, { errorCode: ErrorCodes.INVALID_INPUT });
    }
    if (start < DateTime.now().startOf('day')) {
      throw new DomainError(DomainMessages.INVALID_INPUT, { errorCode: ErrorCodes.INVALID_INPUT });
    }
  }

  private calculateTotalDays(start: DateTime, end: DateTime): number {
    return end.diff(start, 'days').days + 1;
  }

  private async getOrCreateBalance(userId: string, year: number): Promise<LeaveBalance> {
    let balance = await this.leaveRepository.findBalance(userId, year);
    if (!balance) {
      balance = new LeaveBalance(null, userId, year, 12, 0);
    }
    return balance;
  }

  private validateQuota(balance: LeaveBalance): void {
    const remainingQuota = balance.getRemainingQuota();
    if (remainingQuota < 0) {
      throw new DomainError(DomainMessages.LEAVE_QUOTA_EXCEEDED, { errorCode: ErrorCodes.LEAVE_QUOTA_EMPTY });
    }
  }

  private updateBalance(balance: LeaveBalance): void {
    balance.usedAllowance += 1;
  }
}