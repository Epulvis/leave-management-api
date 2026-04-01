import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import UserModel from 'App/Infrastructure/Database/Models/UserModel'
import { Role } from 'App/Domain/Enums/Role'
import { v4 as uuid } from 'uuid'

export default class AdminSeeder extends BaseSeeder {

  public async run(): Promise<void> {
    const adminExists = await UserModel.query()
      .where('email', 'admin@example.com')
      .first()

    if (adminExists) {
      console.log('Admin user already exists, skipping...')
      return
    }

    const admin = await UserModel.create({
      id: uuid(),
      email: 'admin@example.com',
      password: 'Admin@123456',
      fullName: 'Administrator',
      role: Role.ADMIN,
    })

    console.log('Admin user created successfully!')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Role: ${admin.role}`)
    console.log('\nDefault credentials:')
    console.log('   Email: admin@example.com')
    console.log('   Password: Admin@123456')
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!')
  }
}
