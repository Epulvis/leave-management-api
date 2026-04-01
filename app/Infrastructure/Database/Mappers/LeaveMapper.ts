import { LeaveApplication } from '../../../Domain/Entities/LeaveApplication'
import LeaveApplicationModel from '../Models/LeaveApplicationModel'
import { LeaveStatus } from '../../../Domain/Enums/LeaveStatus'

export class LeaveMapper {
  public static toDomain(raw: LeaveApplicationModel): LeaveApplication {
    return new LeaveApplication(
      raw.id,
      raw.userId,
      raw.startDate, 
      raw.endDate,
      raw.totalDays,
      raw.reason,
      raw.attachmentPath,
      raw.status as LeaveStatus,
      raw.approvedBy,
      raw.approvedAt,
      raw.createdAt,
      raw.updatedAt
    )
  }

  public static toPersistence(domain: LeaveApplication): Partial<LeaveApplicationModel> {
    return {
      userId: domain.userId,
      startDate: domain.startDate,
      endDate: domain.endDate,
      totalDays: domain.totalDays,
      reason: domain.reason,
      attachmentPath: domain.attachmentPath,
      status: domain.status,
      approvedBy: domain.approvedBy,
      approvedAt: domain.approvedAt,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt
    }
  }
}