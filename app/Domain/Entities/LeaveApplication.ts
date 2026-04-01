import { DateTime } from 'luxon';
import { LeaveStatus } from '../Enums/LeaveStatus'

export class LeaveApplication {
  constructor(
    public id: number | null,
    public userId: string,
    public startDate: DateTime,
    public endDate: DateTime,
    public totalDays: number,
    public reason: string,
    public attachmentPath: string,
    public status: LeaveStatus = LeaveStatus.PENDING,
    public approvedBy: string | null = null,
    public approvedAt: DateTime | null = null,
    public createdAt?: DateTime,
    public updatedAt?: DateTime
  ) {}
}