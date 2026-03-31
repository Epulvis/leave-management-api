import Hash from '@ioc:Adonis/Core/Hash'
import { IHashService } from '../../Domain/Services/IHashService'

export class AdonisHashService implements IHashService {
  public async make(plainText: string): Promise<string> {
    return await Hash.make(plainText)
  }

  public async verify(hashedText: string, plainText: string): Promise<boolean> {
    return await Hash.verify(hashedText, plainText)
  }
}