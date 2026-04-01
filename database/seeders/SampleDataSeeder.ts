import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import UserModel from 'App/Infrastructure/Database/Models/UserModel'
import { Role } from 'App/Domain/Enums/Role'
import { v4 as uuid } from 'uuid'

export default class SampleDataSeeder extends BaseSeeder {
  public async run(): Promise<void> {
    console.log('Creating sample employee data...')

    const employees = [
      {
        email: 'john.doe@example.com',
        fullName: 'John Doe',
        password: 'Employee@123456',
      },
      {
        email: 'jane.smith@example.com',
        fullName: 'Jane Smith',
        password: 'Employee@123456',
      },
      {
        email: 'bob.johnson@example.com',
        fullName: 'Bob Johnson',
        password: 'Employee@123456',
      },
    ]

    for (const employeeData of employees) {
      const existingUser = await UserModel.query()
        .where('email', employeeData.email)
        .first()

      if (existingUser) {
        console.log(`Employee ${employeeData.email} already exists, skipping...`)
        continue
      }

      const employee = await UserModel.create({
        id: uuid(),
        email: employeeData.email,
        password: employeeData.password,
        fullName: employeeData.fullName,
        role: Role.EMPLOYEE,
      })

      console.log(`Created employee: ${employee.fullName} (${employee.email})`)
    }

    console.log(`\nSample data creation completed!`)
    console.log('\nSample Employee Credentials:')
    employees.forEach((emp) => {
      console.log(`   • ${emp.email} / ${emp.password}`)
    })
  }
}
