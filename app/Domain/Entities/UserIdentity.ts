export class UserIdentity {
  constructor(
    public id: string | null,
    public userId: string,
    public provider: string,
    public providerId: string,
    public token: string,
    public refreshToken: string | null = null
  ) {}
}