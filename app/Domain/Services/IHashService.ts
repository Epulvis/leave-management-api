export interface IHashService {
  make(plainText: string): Promise<string>
  verify(hashedText: string, plainText: string): Promise<boolean>
}