export class LeaveBalance {
  constructor(
    public id: number | null,
    public userId: string,
    public periodYear: number,
    public totalAllowance: number,
    public usedAllowance: number
  ) {}

  public getRemainingQuota(): number {
    return this.totalAllowance - this.usedAllowance
  }
}