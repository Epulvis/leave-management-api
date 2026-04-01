# Database Seeders

Folder ini berisi script untuk populate database dengan data awal (seed data). Seeders sangat berguna untuk development dan testing.

## 📋 Daftar Seeders

### 1. AdminSeeder
Membuat user admin default untuk akses admin panel.

**Functionalitas:**
- ✅ Membuat admin user jika belum ada
- ✅ Prevents duplikasi (checks if admin already exists)
- ✅ Menampilkan credentials yang dibuat

**Data yang dibuat:**
```
Email: admin@example.com
Password: Admin@123456
Role: admin
```

### 2. SampleDataSeeder
Membuat sample employee data untuk testing dan development.

**Functionalitas:**
- ✅ Membuat 3 sample employees
- ✅ Membuat leave balance untuk setiap employee (tahun current)
- ✅ Prevents duplikasi

**Data yang dibuat:**
```
1. john.doe@example.com / Employee@123456
2. jane.smith@example.com / Employee@123456
3. bob.johnson@example.com / Employee@123456

Setiap employee mendapat:
- Leave Quota: 12 hari per tahun
- Initial Used: 0
- Initial Remaining: 12
```

### 3. IndexSeeder
Master seeder yang menjalankan semua seeder dalam urutan yang benar.

---

## 🚀 Cara Menggunakan

### Setup Seeder (Hanya 1x)

#### 1. Jalankan Migration Terlebih Dahulu
```bash
node ace migration:run
```

#### 2. Jalankan Semua Seeders
```bash
node ace db:seed
```

Akan menjalankan `IndexSeeder` yang memanggil:
- AdminSeeder
- SampleDataSeeder

#### 3. Jalankan Seeder Spesifik
```bash
# Hanya admin seeder
node ace db:seed --files="AdminSeeder.ts"

# Hanya sample data seeder
node ace db:seed --files="SampleDataSeeder.ts"
```

### Dalam Docker

```bash
# Dari host machine
docker-compose exec api node ace db:seed

# Atau
docker-compose exec api node ace db:seed --files="AdminSeeder.ts"
```

---

## 📊 Hasil Seeding

Setelah seeder berhasil dijalankan:

### Database State
```
users table:
├─ admin@example.com (admin)
├─ john.doe@example.com (employee)
├─ jane.smith@example.com (employee)
└─ bob.johnson@example.com (employee)

leave_balances table:
├─ john.doe: 12 days (current year)
├─ jane.smith: 12 days (current year)
└─ bob.johnson: 12 days (current year)
```

### Testing Endpoints
Gunakan credentials dari seeding untuk test API:

```bash
# Test Admin Login
curl -X POST http://localhost:3333/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123456"
  }'

# Test Employee Login
curl -X POST http://localhost:3333/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Employee@123456"
  }'
```

---

## ⚠️ Important Notes

### Default Passwords
Semua seeder menggunakan default passwords untuk convenience:
- Admin: `Admin@123456`
- Employees: `Employee@123456`

**JANGAN GUNAKAN DEFAULT PASSWORDS DI PRODUCTION!**

### Fresh Start (Reset Database)
Untuk reset database dan re-seed dari awal:

```bash
# Rollback semua migrations
node ace migration:rollback --batch 0

# Re-run migrations
node ace migration:run

# Re-seed data
node ace db:seed
```

### Mencegah Duplikasi
Seeder dirancang untuk prevent duplikasi:
- Checks jika admin sudah ada
- Checks jika employee sudah ada
- Tidak akan membuat duplicate leave balance

Aman untuk dijalankan berkali-kali.

---

## 🔧 Membuat Seeder Baru

### Template
```bash
node ace make:seeder MyNewSeeder
```

### Struktur
```typescript
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class MyNewSeeder extends BaseSeeder {
  public async run(): Promise<void> {
    // Seeding logic here
  }
}
```

### Contoh: Seeder untuk Leave Applications
```typescript
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import LeaveApplicationModel from 'App/Infrastructure/Database/Models/LeaveApplicationModel'
import { DateTime } from 'luxon'

export default class LeaveApplicationSeeder extends BaseSeeder {
  public async run(): Promise<void> {
    const users = await UserModel.all()
    
    for (const user of users) {
      if (user.role === 'employee') {
        await LeaveApplicationModel.create({
          userId: user.id,
          startDate: DateTime.now().plus({ days: 10 }).toFormat('yyyy-MM-dd'),
          endDate: DateTime.now().plus({ days: 14 }).toFormat('yyyy-MM-dd'),
          totalDays: 5,
          reason: 'Annual vacation',
          status: 'pending'
        })
      }
    }
  }
}
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'AdminSeeder'"
```bash
# Ensure TypeScript is compiled
npm run build

# Then run seeder
node ace db:seed
```

### Error: "Table does not exist"
```bash
# Run migrations first
node ace migration:run

# Then seed
node ace db:seed
```

### Error: "Duplicate entry" untuk admin email
```bash
# Admin sudah ada, bisa di-skip atau hapus record:
DELETE FROM users WHERE email = 'admin@example.com';
node ace db:seed --files="AdminSeeder.ts"
```

### Ingin mengganti default password?
Edit seeder file dan ubah password di database:

```typescript
// Di AdminSeeder.ts, ubah:
password: 'YourNewPassword123'  // Ganti password
```

Atau update langsung di database setelah seed:
```sql
UPDATE users SET password = PASSWORD('NewPassword123') 
WHERE email = 'admin@example.com';
```

---

## 📚 Best Practices

### 1. Selalu Run Migrations Dulu
```bash
node ace migration:run
node ace db:seed
```

### 2. Use IndexSeeder untuk Multiple Seeders
Jangan jalankan seeders satu-satu, gunakan IndexSeeder:
```bash
node ace db:seed  # Runs IndexSeeder automatically
```

### 3. Idempotent Seeders
Seeder harus safe untuk dijalankan berkali-kali:
```typescript
// ✅ GOOD: Check before insert
const exists = await User.findBy('email', 'admin@example.com')
if (!exists) {
  await User.create(...)
}

// ❌ BAD: Always insert
await User.create(...)  // Will fail second time
```

### 4. Add Logging untuk Debugging
```typescript
console.log('✅ Created user:', user.email)
console.log('⚠️  User already exists:', email)
```

### 5. Use Transaction untuk Data Consistency
```typescript
Database.transaction(async (trx) => {
  const user = await User.create(..., { client: trx })
  await user.related('leaves').create(..., { client: trx })
})
```

---

## 🔍 Verify Data Seeded

### Check via SQL Query
```bash
# Access database
mysql -u lucid -p leave_management

# Check users
SELECT id, email, role FROM users;

# Check leave balances
SELECT * FROM leave_balances;
```

### Check via phpMyAdmin
1. Open http://localhost:8080
2. Login dengan credentials MySQL
3. Navigate to database
4. View tables

### Check via API
```bash
# Get all users (if endpoint exists)
curl -H "Authorization: Bearer {token}" http://localhost:3333/api/v1/users

# Check leave balances
curl -H "Authorization: Bearer {token}" http://localhost:3333/api/v1/leaves/balance
```

---

## 📝 Seed Data Management

### Development Workflow
```
1. npm install
   ↓
2. cp .env.example .env
   ↓
3. node ace migration:run
   ↓
4. node ace db:seed
   ↓
5. npm run dev
   ↓
Start developing with pre-populated data!
```

### Testing Workflow
```
1. npm run test          # Runs tests
2. After test finish, database might be polluted
3. node ace migration:rollback --batch 0
4. node ace migration:run
5. node ace db:seed
6. Ready for next test run
```

---

## 💡 Tips

### Rapid Development
Buat multiple seeder untuk different scenarios:
- `AdminSeeder.ts` - Admin user only
- `SampleDataSeeder.ts` - Employees + balances
- `LeaveApplicationSeeder.ts` - Sample leave data
- `TestDataSeeder.ts` - Edge cases for testing

Jalankan sesuai kebutuhan:
```bash
node ace db:seed --files="AdminSeeder.ts"
# vs
node ace db:seed --files="LeaveApplicationSeeder.ts"
```

### Debugging Seeder
```bash
# Add breakpoints di seeder
# Run dengan inspect
node --inspect-brk ace db:seed

# Open chrome://inspect di browser Chrome
```

---

## 📞 Support

Jika ada masalah:
1. Cek file seeder sudah di folder `database/seeders/`
2. Ensure migration sudah dijalankan
3. Check database connection di .env
4. Review error messages di console output
