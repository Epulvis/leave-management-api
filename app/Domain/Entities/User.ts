import { Role } from "../Enums/Role";

export class User {
  constructor(
    public id: string | null,
    public email: string,
    public fullName: string,
    public role: Role,
    public password?: string
  ) {}
}