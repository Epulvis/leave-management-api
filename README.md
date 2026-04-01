# Leave Management API - Project Documentation

## 📚 Overview

**Leave Management API** adalah sistem REST API yang komprehensif untuk manajemen cuti karyawan. Dibangun dengan **AdonisJS** (Node.js + TypeScript) menggunakan **Clean Architecture** pattern untuk maintainability dan scalability yang optimal.

### 🎯 Project Goals

✅ Menyediakan API untuk submit, approve, dan track cuti karyawan
✅ Implementasi authentication yang aman (JWT + OAuth)
✅ Role-based access control (Admin & Employee)
✅ Sistem logging dan audit trail yang comprehensive
✅ Clean code architecture untuk easy maintenance
✅ Production-ready dengan proper error handling

---

## 📖 Dokumentasi Lengkap

### 1. **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** - Setup & Deployment
   - Persyaratan sistem
   - Instalasi step-by-step
   - Konfigurasi environment variables
   - Setup database (Docker & Local)
   - Menjalankan aplikasi
   - Troubleshooting guide

### 2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Desain & Arsitektur
   - Clean Architecture layers explanation
   - Alur sistem (login, apply leave, approve leave)
   - Komponen utama (User, Leave, Balance)
   - Database design & ER Diagram
   - Authentication & Authorization
   - Error handling strategy
   - Logging implementation

### 3. **[database/seeders/README.md](./database/seeders/README.md)** - Database Seeders
   - Admin seeder untuk create default admin user
   - Sample data seeder untuk testing
   - Cara menjalankan seeders
   - Best practices

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- Docker & Docker Compose (recommended)
- MySQL 8.0+ (jika tidak pakai Docker)

### Setup dalam 5 Menit

```bash
# 1. Clone repository
git clone <repo-url>
cd leave-management-api

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Start dengan Docker Compose
docker-compose up -d

# 5. Run migrations
npm run dev

# 6. Seed admin user
docker-compose exec api node ace db:seed
```

Aplikasi siap di `http://localhost:3333`

---

## 📁 Project Structure

```
leave-management-api/
├── app/                          # Application code
│   ├── Domain/                   # Business logic layer
│   │   ├── Entities/             # Core entities (User, Leave, etc)
│   │   ├── Enums/                # Enumerations (Role, LeaveStatus)
│   │   ├── Repositories/         # Repository interfaces
│   │   └── Services/             # Service interfaces
│   ├── UseCases/                 # Application logic layer
│   │   ├── Auth/                 # Authentication use cases
│   │   └── Leave/                # Leave management use cases
│   ├── Interfaces/               # HTTP layer (Controllers, Validators)
│   │   └── Http/
│   │       ├── Controllers/
│   │       ├── Middleware/
│   │       ├── Responses/
│   │       └── Validators/
│   ├── Infrastructure/           # Technical implementation layer
│   │   ├── Database/             # ORM models & mappers
│   │   ├── Repositories/         # Repository implementations
│   │   ├── Security/             # Authentication & hashing
│   │   ├── Logging/              # Logger implementation
│   │   └── Auth/                 # OAuth configuration
│   ├── Shared/                   # Shared utilities
│   │   ├── Constants/            # Error codes, messages
│   │   └── Errors/               # Custom error classes
│   └── Exceptions/               # Global exception handler
├── config/                       # Configuration files
├── database/
│   ├── migrations/              # Database schema migrations
│   ├── seeders/                 # Database seeders
│   └── factories/               # Model factories (testing)
├── start/
│   ├── routes.ts                # Route definitions
│   └── kernel.ts                # Middleware registration
├── postman/                     # Postman collection & environments
├── tests/                       # Automated tests
├── INSTALLATION_GUIDE.md        # Setup documentation
├── ARCHITECTURE.md              # Architecture documentation
├── package.json
├── tsconfig.json
└── docker-compose.yml           # Docker configuration
```

---

## 🔧 Core Technologies

| Technology | Use Case |
|-----------|----------|
| **AdonisJS** | Web framework |
| **TypeScript** | Type safety |
| **MySQL** | Database |
| **Lucid ORM** | Database abstraction |
| **JWT** | Token-based auth |
| **Ally** | OAuth provider |
| **Luxon** | DateTime handling |

---

## 📚 Key Concepts

### Clean Architecture

Aplikasi dibagi menjadi 4 layer dengan dependencies yang jelas:

```
Interfaces (HTTP)
    ↓
Use Cases (Business Logic)
    ↓
Domain (Business Rules)
    ↓
Infrastructure (Technical Implementation)
```

**Benefits:**
- ✅ Easy to test
- ✅ Easy to maintain
- ✅ easy to extend
- ✅ Framework-agnostic business logic

### Role-Based Access Control

```
Employee:
- Register & Login
- Apply leave
- View own leave history
- View own leave balance

Admin:
- Do everything employee can do
- View all employee leaves
- Approve/Reject leaves
- Generate reports
```

### Leave Balance System

- Setiap employee mendapat 12 hari cuti per tahun
- Leave balance auto-create saat employee apply leave
- Balance otomatis di-update saat approve/reject
- Rollover policies bisa dikustomisasi

---

## 🔐 Security Features

✅ **Password Hashing** - Bcrypt untuk secure password storage
✅ **JWT Tokens** - Token-based stateless authentication
✅ **OAuth Integration** - Google, GitHub, LinkedIn login
✅ **Input Validation** - Server-side validation untuk semua input
✅ **Authorization** - Role-based route protection
✅ **CORS** - Configurable cross-origin requests
✅ **Rate Limiting** - Can be added via middleware

---

## 📊 Database Schema

### Main Tables

**users**
```
id (UUID, PK)
email (VARCHAR, UNIQUE)
password (VARCHAR, hashed)
full_name (VARCHAR)
role (ENUM: employee, admin)
created_at, updated_at
```

**leave_applications**
```
id (INT, PK)
user_id (FK → users)
start_date (DATE)
end_date (DATE)
total_days (INT)
reason (TEXT)
status (ENUM: pending, approved, rejected)
approved_by (FK → users, nullable)
approved_at (TIMESTAMP, nullable)
created_at, updated_at
```

**leave_balances**
```
id (INT, PK)
user_id (FK → users)
year (INT)
total_quota (INT)
used (INT)
remaining (INT)
created_at, updated_at
```

**user_identities**
```
id (INT, PK)
user_id (FK → users)
provider (VARCHAR)
provider_id (VARCHAR)
email (VARCHAR)
verified_at (TIMESTAMP, nullable)
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/register` - Register user
- `POST /api/v1/login` - Login user
- `GET /api/v1/oauth/:provider/redirect` - OAuth redirect
- `GET /api/v1/oauth/:provider/callback` - OAuth callback

### Leaves (Protected)
- `POST /api/v1/leaves/apply` - Apply leave (Employee)
- `GET /api/v1/leaves/history` - Get my leaves (Employee)
- `GET /api/v1/admin/leaves` - Get all leaves (Admin)
- `PATCH /api/v1/admin/leaves/:id/execute` - Approve/Reject (Admin)

---

## 📋 Getting Started with Different Scenarios

### Scenario 1: Development Setup
```bash
# Setup dengan Docker (Recommended)
cp .env.example .env
docker-compose up -d

# Atau local MySQL
npm install
node ace migration:run
npm run dev

# Create admin user
node ace db:seed
```

### Scenario 2: Run Tests
```bash
npm run test
```

### Scenario 3: Production Build
```bash
npm run build
npm run start
```

### Scenario 4: Create Seeder untuk Data Custom
```bash
# Create new seeder
node ace make:seeder CustomSeeder

# Run custom seeder
node ace db:seed --files="CustomSeeder.ts"
```

---

## 🎓 Development Workflow

### 1. Understanding the Codebase
- Baca [ARCHITECTURE.md](./ARCHITECTURE.md) untuk memahami structure
- Explore `app/UseCases/Auth/RegisterUseCase.ts` untuk contoh use case
- Lihat `app/Interfaces/Http/Controllers/AuthController.ts` untuk contoh controller

### 2. Making Changes
- Modify entities di `app/Domain/Entities/`
- Update use cases di `app/UseCases/`
- Update controllers di `app/Interfaces/Http/Controllers/`
- Always make DB migrations untuk schema changes

### 3. Testing Changes
```bash
npm run test
```

### 4. Building for Production
```bash
npm run build
```

---

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Find and kill process
lsof -i :3333
kill -9 <PID>

# Or change port in .env
PORT=3334 npm run dev
```

### Database Connection Error
```bash
# Check .env credentials
# Test connection
mysql -h 127.0.0.1 -u lucid -p leave_management

# Check MySQL is running
docker-compose logs mysql_db
```

### Migration Pending
```bash
node ace migration:status
node ace migration:run
```

### Cannot Find Module
```bash
npm install
npm run build
```

## 📖 Referensi & Resources

- **AdonisJS**: https://docs.adonisjs.com
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Domain-Driven Design**: https://martinfowler.com/bliki/DomainDrivenDesign.html
- **REST API Design**: https://restfulapi.net/
- **JWT Authentication**: https://jwt.io/introduction

---

## 👥 Team & Support

### Contributing
1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add some feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open Pull Request

### Issues & Questions
- Cek [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) Troubleshooting section
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) untuk design questions
- Check existing issues di repository

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Core authentication (Email/Password + OAuth)
- ✅ Leave application management
- ✅ Leave balance tracking
- ✅ Admin approval workflow
- ✅ Role-based access control
- ✅ Comprehensive API documentation
- ✅ Database seeders

### Planned Features
- 🚀 Email notifications
- 🚀 Leave analytics dashboard
- 🚀 Advanced reporting
- 🚀 Holiday management
- 🚀 Bulk import/export
- 🚀 Mobile app (React Native)

---

## 📄 License

Proprietary - All rights reserved

---

## 🗂️ Documentation Map

```
docs/
├── INSTALLATION_GUIDE.md     👈 Start here for setup
├── ARCHITECTURE.md           👈 Read for system design
├── PROJECT_SUMMARY.md        👈 You are here
├── database/seeders/README.md 👈 For database setup
├── postman/                  👈 API collection
└── [Implementation Guides]
```

---

Last Updated: 2024
For the latest documentation, always refer to the files in this repository.
