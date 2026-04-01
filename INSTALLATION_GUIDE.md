# Panduan Instalasi dan Setup Leave Management API

## 📋 Daftar Isi
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi](#instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Setup Database](#setup-database)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Persyaratan Sistem

### Software yang Diperlukan
- **Node.js** >= 18.x
- **npm** >= 9.x atau **yarn**
- **Docker** dan **Docker Compose** (untuk development dengan container)
- **MySQL** 8.0+ (jika tidak menggunakan Docker)
- **Git**

### Spesifikasi Hardware Minimum
- RAM: 2 GB
- Storage: 500 MB untuk project + 1 GB untuk database

---

## 🚀 Instalasi

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd leave-management-api
```

### Step 2: Install Dependencies
```bash
npm install
# atau jika menggunakan yarn
yarn install
```

### Step 3: Generate APP_KEY
```bash
node ace key:generate
# Akan generate APP_KEY baru dan menyimpannya di .env
```

---

## ⚙️ Konfigurasi Environment

### Membuat File .env
Copy file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

### Variabel Environment yang Diperlukan

#### **Basic Configuration**
```env
# Port aplikasi
PORT=3333

# Host address
HOST=0.0.0.0

# Environment (development, production, test)
NODE_ENV=development

# Application Key (untuk encryption)
APP_KEY=vOrHvzM0y5-kwt_UytF4yqWMTiXrEaGQ

# Drive disk for file storage
DRIVE_DISK=local
```

#### **Database Configuration**
```env
# Koneksi database
DB_CONNECTION=mysql

# Host MySQL
MYSQL_HOST=127.0.0.1

# Port MySQL
MYSQL_PORT=3306

# User MySQL
MYSQL_USER=lucid

# Password MySQL (kosongkan jika tidak ada)
MYSQL_PASSWORD=

# Nama database
MYSQL_DB_NAME=lucid

# Root password untuk Docker/MySQL
MYSQL_ROOT_PASSWORD=root

# Nama database untuk Docker
MYSQL_DATABASE=lucid
```

#### **OAuth Configuration (Optional)**
Untuk fitur login sosial (GitHub, Google, LinkedIn):

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth  
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

#### **Docker Compose Configuration**
```env
# Docker configuration
CHOKIDAR_USEPOLLING=true
PMA_HOST=mysql_db
```

### Contoh File .env Lengkap (Development)
```env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=vOrHvzM0y5-kwt_UytF4yqWMTiXrEaGQ
DRIVE_DISK=local

DB_CONNECTION=mysql
MYSQL_HOST=mysql_db
MYSQL_PORT=3306
MYSQL_USER=lucid
MYSQL_PASSWORD=lucid123
MYSQL_DB_NAME=leave_management

MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=leave_management

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

CHOKIDAR_USEPOLLING=true
PMA_HOST=mysql_db
```

---

## 📊 Setup Database

### Opsi 1: Menggunakan Docker Compose (Recommended)

#### 1. Start Services Docker
```bash
docker-compose up -d
```

Ini akan memulai:
- **API Server** (port 3333)
- **MySQL Database** (port 3306)
- **phpMyAdmin** (port 8080)

#### 2. Tunggu Database Siap
```bash
# Cek status container
docker-compose ps

# Lihat logs aplikasi
docker-compose logs -f api
```

#### 3. Jalankan Migration
```bash
npm run dev
# Atau dalam container lain
docker-compose exec api npm run dev
```

#### 4. Akses phpMyAdmin
Buka browser dan akses:
```
http://localhost:8080
```

**Default Login:**
- Username: `root`
- Password: `root123` (sesuai MYSQL_ROOT_PASSWORD di .env)

### Opsi 2: MySQL Local Installation

#### 1. Install MySQL
**Windows:**
```bash
# Menggunakan Chocolatey
choco install mysql -y
```

**macOS:**
```bash
# Menggunakan Homebrew
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

#### 2. Buat Database dan User
```sql
CREATE DATABASE leave_management;

CREATE USER 'lucid'@'localhost' IDENTIFIED BY 'lucid123';
GRANT ALL PRIVILEGES ON leave_management.* TO 'lucid'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Update .env
```env
DB_CONNECTION=mysql
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=lucid
MYSQL_PASSWORD=lucid123
MYSQL_DB_NAME=leave_management
```

#### 4. Jalankan Migration
```bash
node ace migration:run
```

---

## 🏃 Menjalankan Aplikasi

### Development Mode

#### Option 1: Lokal dengan Watch Mode
```bash
npm run dev
```

Aplikasi akan:
- Auto-reload saat ada perubahan file
- Berjalan di `http://localhost:3333`

#### Option 2: Menggunakan Docker Compose
```bash
docker-compose up
```

#### Option 3: Production Build
```bash
npm run build
npm run start
```

### Periksa Kesehatan API

#### Health Check Endpoint
```bash
curl http://localhost:3333/health
```

### Lihat Log (Docker)
```bash
# Semua services
docker-compose logs -f

# Hanya API
docker-compose logs -f api

# Dengan follow 100 baris terakhir
docker-compose logs --tail=100 -f api
```

---

## 🗄️ Migration Database

### Menjalankan Semua Migration
```bash
node ace migration:run
```

### Melihat Status Migration
```bash
node ace migration:status
```

### Rollback Migration Terakhir
```bash
node ace migration:rollback
```

### Membuat Migration Baru
```bash
node ace make:migration create_table_name --create=table_name
```

### Migration yang Tersedia

| Tangal | Deskripsi |
|--------|-----------|
| 1774811898058_users | Tabel users (id, email, password, role, dll) |
| 1774812263674_user_identities | Tabel user identities untuk OAuth |
| 1774812330933_leave_balances | Tabel saldo leave per tahun |
| 1774812337846_leave_applications | Tabel aplikasi leave |
| 1774812344659_audit_logs | Tabel audit trail |
| 1774815972367_api_tokens | Tabel API tokens |

---

## 👤 Membuat Admin User

Setelah migration selesai, buat user admin:

### Menggunakan Seeder
```bash
node ace db:seed
```

### Atau Menggunakan REPL
```bash
node ace repl

# Di dalam REPL
const User = require('App/Infrastructure/Database/Models/UserModel').default
const { Role } = require('App/Domain/Enums/Role')
const user = new User()
user.email = 'admin@example.com'
user.password = 'Admin@123'
user.fullName = 'Administrator'
user.role = Role.ADMIN
await user.save()
```

### Atau Query SQL Langsung
```sql
INSERT INTO users (id, email, password, full_name, role, created_at, updated_at) 
VALUES (
  UUID(),
  'admin@example.com',
  '$2a$12$...',  -- password hash
  'Administrator',
  'admin',
  NOW(),
  NOW()
);
```

---

## 🧪 Testing

### Menjalankan Test
```bash
npm run test
```

### Test Coverage
```bash
node ace test --coverage
```

---

## 📝 Postman Collection

API Collection tersedia di folder `postman/collections/Leave Management API/`

### Import ke Postman
1. Buka Postman
2. Click `Import`
3. Select folder `postman/collections/Leave Management API/`
4. Import Environment: `postman/environments/Leave Management API - Local.environment.yaml`

### Environment Variables
- `{{baseUrl}}` = http://localhost:3333/api/v1
- `{{token}}` = JWT Auth token (auto-set saat login)

---

## 🔍 Troubleshooting

### Error: "Cannot find module 'reflect-metadata'"
```bash
npm install reflect-metadata --save
```

### Error: "Port 3333 already in use"
```bash
# Cari process yang menggunakan port 3333
lsof -i :3333  # macOS/Linux
netstat -ano | findstr :3333  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Atau gunakan port berbeda
PORT=3334 npm run dev
```

### Error: "Connection refused" (Database)
1. Pastikan MySQL service running
2. Cek credentials di .env
3. Cek host & port database

```bash
# Test connection
mysql -h 127.0.0.1 -u lucid -p lucid123 -D leave_management
```

### Docker: "Cannot connect to database"
```bash
# Restart Docker services
docker-compose down
docker-compose up -d

# Cek logs
docker-compose logs mysql_db
```

### Error: "Migration pending"
```bash
# Lihat status
node ace migration:status

# Jalankan pending migration
node ace migration:run
```

### Port 8080 (phpMyAdmin) Conflict
Edit `docker-compose.yml`:
```yaml
phpmyadmin:
  ports:
    - "8081:80"  # Ubah ke port lain
```

---

## ✅ Verifikasi Instalasi

Setelah semua selesai, lakukan verifikasi:

```bash
# 1. Cek API running
curl http://localhost:3333

# 2. Cek database migration
node ace migration:status

# 3. Cek user admin existence
mysql -u lucid -p leave_management
SELECT * FROM users WHERE role='admin';

# 4. Jalankan tests
npm run test
```

---

## 📚 Referensi

- [AdonisJS Documentation](https://docs.adonisjs.com)
- [Lucid ORM](https://docs.adonisjs.com/guides/lucid/orm-setup)
- [Authentication](https://docs.adonisjs.com/guides/auth/guard-setup)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Docker Documentation](https://docs.docker.com/)

---

## 📞 Support

Jika mengalami masalah:
1. Baca section Troubleshooting
2. Cek log files
3. Cek dokumentasi di folder `docs/`
4. Hubungi tim development
