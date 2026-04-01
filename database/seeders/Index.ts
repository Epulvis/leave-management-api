import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import AdminSeeder from './AdminSeeder'
import SampleDataSeeder from './SampleDataSeeder'

export default class IndexSeeder extends BaseSeeder {
  public async run(): Promise<void> {
    console.log('\nRunning database seeders...\n')
    
    await this.runSeeder(AdminSeeder)
    await this.runSeeder(SampleDataSeeder)
    
    console.log('\nAll seeders completed!')
  }

  private async runSeeder(seederClass: typeof BaseSeeder): Promise<void> {
    const seeder = new seederClass(this.client)
    await seeder.run()
  }
}
