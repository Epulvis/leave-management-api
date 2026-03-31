export class User {
  constructor(
    public id: string,
    public email: string,
    public fullName: string,
    public role: 'employee' | 'admin',
    public password?: string
  ) {}

  public isAdmin(): boolean {
    return this.role === 'admin';
  }
}