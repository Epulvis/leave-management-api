import { IUserRepository } from "../../Domain/Repositories/IUserRepository";
import { User } from "../../Domain/Entities/User";
import UserModel from "../Database/Models/UserModel";
import { UserMapper } from "../Database/Mappers/UserMapper";
import { InfrastructureError } from "App/Shared/Errors/InfrastructureError";
import { ConflictError } from "App/Shared/Errors/ConflictError";

export class LucidUserRepository implements IUserRepository {
  public async findByEmail(email: string): Promise<User | null> {
    const userModel = await UserModel.findBy("email", email);
    if (!userModel) return null;

    return UserMapper.toDomain(userModel);
  }

  public async save(user: User): Promise<User> {
    try {
      const persistenceData = UserMapper.toPersistence(user);

      if (!user.id) {
        persistenceData.id = crypto.randomUUID();
      }

      const userModel = new UserModel();
      userModel.fill(persistenceData);
      await userModel.save();
      return UserMapper.toDomain(userModel);
    } catch (error: unknown) {
      const dbError = error as any;

      if (dbError.code === "ER_DUP_ENTRY") {
        throw new ConflictError("Email sudah terdaftar.");
      }

      throw new InfrastructureError(
        "Gagal menyimpan data user ke database.",
        dbError.message,
      );
    }
  }
}
