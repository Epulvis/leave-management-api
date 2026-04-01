import { IUserIdentityRepository } from "App/Domain/Repositories/IUserIdentityRepository";
import { UserIdentity } from "App/Domain/Entities/UserIdentity";
import { ConflictError } from "App/Shared/Errors/ConflictError";
import { InfrastructureError } from "App/Shared/Errors/InfrastructureError";
import UserIdentityModel from "../Database/Models/UserIdentityModel";
import { UserIdentityMapper } from "../Database/Mappers/UserIdentityMapper";
import { DomainMessages, SystemMessages } from "App/Shared/Constants/ErrorDictionary";


export class LucidUserIdentityRepository implements IUserIdentityRepository {
  public async findByProvider(provider: string, providerId: string): Promise<UserIdentity | null> {
    const userIdentityModel = await UserIdentityModel.findBy("providerId", providerId) || await UserIdentityModel.findBy("provider", provider);
    if (!userIdentityModel) return null;

    return UserIdentityMapper.toDomain(userIdentityModel);
  }

  public async save(identity: UserIdentity): Promise<UserIdentity> {
    try {
        const persistenceData = UserIdentityMapper.toPersistence(identity);

        if (!identity.id) {
          persistenceData.id = crypto.randomUUID();
        }

        const userIdentityModel = new UserIdentityModel();
        userIdentityModel.fill(persistenceData);
        await userIdentityModel.save();
      
        return UserIdentityMapper.toDomain(userIdentityModel);
    } catch (error: unknown) {
        const dbError = error as any;

      if (dbError.code === "ER_DUP_ENTRY") {
        throw new ConflictError(DomainMessages.EMAIL_ALREADY_REGISTERED, {
          details: DomainMessages.DOUBLE_INDENTITY
        });
      }

      throw new InfrastructureError(SystemMessages.DATABASE_ERROR,
        {
          details: dbError.message
        }
      );        
    }
  } 
}