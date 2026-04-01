import { LeaveApplication } from '../Entities/LeaveApplication'
import { LeaveBalance } from '../Entities/LeaveBalance'

export interface ILeaveRepository {
  // Application
  saveApplication(application: LeaveApplication): Promise<LeaveApplication>
  findApplicationsByUserId(userId: string): Promise<LeaveApplication[]>
  findAllApplications(): Promise<LeaveApplication[]>
  findApplicationById(id: string): Promise<LeaveApplication | null>
  
  // Balance
  findBalance(userId: string, year: number): Promise<LeaveBalance | null>
  saveBalance(balance: LeaveBalance): Promise<LeaveBalance>
}