# Dokumentasi Arsitektur Leave Management API

## 📋 Daftar Isi
- [Gambaran Umum](#gambaran-umum)
- [Arsitektur Umum](#arsitektur-umum)
- [Clean Architecture Layers](#clean-architecture-layers)
- [Alur Sistem](#alur-sistem)
- [Komponen Utama](#komponen-utama)
- [Database Design](#database-design)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)
- [Logging System](#logging-system)

---

## 🎯 Gambaran Umum

**Leave Management API** adalah sistem manajemen cuti yang dibangun dengan:
- **Framework**: AdonisJS (Node.js)
- **Language**: TypeScript
- **Database**: MySQL 8.0
- **Architecture Pattern**: Clean Architecture
- **Authentication**: JWT + OAuth (Google, GitHub, LinkedIn)

### Fitur Utama
✅ Manajemen authentikasi (register, login, OAuth)
✅ Aplikasi cuti (submit, approve, reject)
✅ Tracking saldo cuti per tahun
✅ Role-based access control (RBAC)
✅ Audit trail
✅ File upload untuk attachment

---

## 🏗️ Arsitektur Umum

Sistem menggunakan **Clean Architecture** dengan pemisahan yang jelas antara business logic dan technical concerns.

```
┌─────────────────────────────────────────────────────┐
│              HTTP Clients (Web, Mobile)             │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│          Interfaces Layer (Controllers)             │
│  - AuthController, LeaveController, etc.            │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│            Use Cases Layer (Business Logic)         │
│  - RegisterUseCase, ApplyLeaveUseCase, etc.         │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           Domain Layer (Entities & Rules)           │
│  - User, LeaveApplication, LeaveBalance             │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│         Infrastructure Layer (Implementation)       │
│  - Database, Security, Logging, etc.                │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│      External Services (MySQL, OAuth Providers)     │
└─────────────────────────────────────────────────────┘
```

---

## 📚 Clean Architecture Layers

### 1️⃣ **Domain Layer** (`app/Domain/`)
Layer paling dalam yang berisi business rules dan entity.

```
Domain/
├── Entities/           # Core business objects
│   ├── User.ts
│   ├── LeaveApplication.ts
│   ├── LeaveBalance.ts
│   └── UserIdentity.ts
├── Enums/              # Business enumerations
│   ├── Role.ts         # employee, admin
│   └── LeaveStatus.ts  # pending, approved, rejected
├── Repositories/       # Repository interfaces (contracts)
│   ├── IUserRepository.ts
│   ├── ILeaveRepository.ts
│   └── IUserIdentityRepository.ts
├── Services/           # Service interfaces
│   ├── IHashService.ts
│   ├── ILogger.ts
│   └── IMailService.ts
└── ValueObjects/       # Value objects (optional)
```

**Karakteristik:**
- Tidak memiliki dependencies ke layer lain
- Pure business logic, tidak ada framework-specific code
- Mudah di-test tanpa dependencies external
- Reusable di project lain

### 2️⃣ **Use Cases Layer** (`app/UseCases/`)
Layer yang berisi aplikasi business logic (application rules).

```
UseCases/
├── Auth/
│   ├── RegisterUseCase.ts
│   ├── LoginUseCase.ts
│   └── OAuthLoginUseCase.ts
└── Leave/
    ├── ApplyLeaveUseCase.ts
    ├── ApproveRejectLeaveUseCase.ts
    ├── GetMyLeavesUseCase.ts
    └── GetAllLeavesUseCase.ts
```

**Karakteristik:**
- Mengorkestrasi Domain entities dan Repository calls
- Berisi business logic yang aplikasi-spesifik
- Tidak peduli dengan HTTP, Database, Framework
- Fokus pada "what" bukan "how"

**Contoh - RegisterUseCase:**
```typescript
export class RegisterUseCase {
  async execute(data: AuthProfileDTO): Promise<User> {
    // 1. Validasi email belum terdaftar
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) throw new DomainError('Email already exists');
    
    // 2. Buat entitas User baru
    const newUser = new User(
      null,
      data.email,
      data.fullName,
      Role.EMPLOYEE,
      data.password
    );
    
    // 3. Simpan ke repository
    return await this.userRepository.save(newUser);
  }
}
```

### 3️⃣ **Interfaces Layer** (`app/Interfaces/`)
Layer yang menangani HTTP requests dan responses (adapters).

```
Interfaces/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.ts
│   │   ├── LeaveController.ts
│   │   └── AdminLeaveController.ts
│   ├── Middleware/
│   │   ├── Auth.ts
│   │   └── RequestLogger.ts
│   ├── Responses/
│   │   └── ApiResponse.ts
│   └── Validators/
│       ├── AuthValidator.ts
│       ├── LeaveValidator.ts
│       └── AdminLeaveValidator.ts
└── Console/
    └── Commands/
```

**Karakteristik:**
- Mengonversi HTTP request → DTO
- Memanggil Use Case
- Mengkonversi response → HTTP response
- Menangani input validation

**Flow Tipikal Controller:**
```typescript
export class AuthController {
  async register({ request, response }: HttpContextContract) {
    // 1. Extract & validate request
    const payload = await request.validate(RegisterValidator);
    
    // 2. Call use case
    const useCase = new RegisterUseCase(this.userRepository);
    const user = await useCase.execute(payload);
    
    // 3. Return response
    return response.status(201).json(ApiResponse.success({...}));
  }
}
```

### 4️⃣ **Infrastructure Layer** (`app/Infrastructure/`)
Layer yang implementasi technical concerns.

```
Infrastructure/
├── Database/
│   ├── Models/
│   │   ├── UserModel.ts         # Lucid ORM models
│   │   ├── LeaveApplicationModel.ts
│   │   └── LeaveBalanceModel.ts
│   ├── Mappers/
│   │   ├── UserMapper.ts        # Map Model ↔ Entity
│   │   ├── LeaveMapper.ts
│   │   └── UserIdentityMapper.ts
│   └── Migrations/              # Database schema
├── Repositories/
│   ├── LucidUserRepository.ts   # Implementasi Repository
│   ├── LucidLeaveRepository.ts
│   └── LucidUserIdentityRepository.ts
├── Security/
│   └── AdonisHashService.ts     # Password hashing
├── Logging/
│   └── AdonisLogger.ts
├── Auth/
│   └── OAuth implementations
└── Cache/
    └── Caching strategies
```

**Karakteristik:**
- Implementasi konkret dari interfaces di Domain layer
- Menggunakan external libraries (Lucid ORM, Hash service, etc.)
- Database queries di sini
- Easy to replace dengan implementasi lain

**Mapper Pattern (Penting):**
```typescript
export class UserMapper {
  // Convert Lucid Model → Domain Entity
  static toDomain(userModel: UserModel): User {
    return new User(
      userModel.id,
      userModel.email,
      userModel.fullName,
      userModel.role,
    );
  }
  
  // Convert Domain Entity → Database Model
  static toPersistence(user: User): UserModel {
    const model = new UserModel();
    model.email = user.email;
    model.fullName = user.fullName;
    model.role = user.role;
    return model;
  }
}
```

### 5️⃣ **Shared Layer** (`app/Shared/`)
Utilities, constants, dan error definitions yang dibagikan.

```
Shared/
├── Constants/
│   ├── ErrorDictionary.ts       # Error codes & messages
│   ├── LogEvents.ts             # Log event types
│   └── ValidationMessages.ts
├── Errors/                      # Custom error classes
│   ├── BaseError.ts
│   ├── DomainError.ts
│   ├── ValidationError.ts
│   ├── AuthorizationError.ts
│   ├── NotFoundError.ts
│   └── InfrastructureError.ts
└── Utils/
```

---

## 🔄 Alur Sistem

### 1. Register Flow

```
┌──────────────┐
│ HTTP Request │
│ POST /register
└──────┬───────┘
       │ validate input
       ▼
┌──────────────────────┐
│ AuthController       │
│ .register()          │
└──────┬───────────────┘
       │ instantiate use case
       ▼
┌──────────────────────────────┐
│ RegisterUseCase              │
│ .execute(authProfileDTO)     │
└──────┬───────────────────────┘
       │ validate email not exists
       ▼
┌──────────────────────┐
│ IUserRepository      │
│ .findByEmail()       │
└──────┬───────────────┘
       │
       ▼ [email not found]
┌──────────────────────┐
│ Create User Entity   │
│ new User(...)        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│ LucidUserRepository          │
│ .save(user)                  │
│ (implements IUserRepository) │
└──────┬───────────────────────┘
       │ create UserModel instance
       ▼
┌──────────────────────┐
│ UserModel            │
│ (Lucid ORM)          │
└──────┬───────────────┘
       │ insert into users table
       ▼
┌──────────────────────┐
│ MySQL Database       │
└──────┬───────────────┘
       │ return persisted model
       ▼
┌──────────────────────┐
│ UserMapper           │
│ .toDomain(model)     │
└──────┬───────────────┘
       │ return User entity
       ▼
┌──────────────────────┐
│ ApiResponse          │
│ .success(user)       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ HTTP Response 201    │
│ {user data}          │
└──────────────────────┘
```

### 2. Apply Leave Flow

```
┌──────────────┐
│ HTTP Request │
│ POST /leaves/apply
└──────┬───────┘
       │ validate input (dates, reason, etc)
       ▼
┌──────────────────────┐
│ LeaveController      │
│ .apply()             │
└──────┬───────────────┘
       │ check auth
       ▼
┌──────────────────────┐
│ ApplyLeaveUseCase    │
│ .execute()           │
└──────┬───────────────┘
       │ validate role is employee
       ▼
┌──────────────────────┐
│ Parse & validate     │
│ dates                │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Get/Create LeaveBalance      │
│ for current year             │
└──────┬───────────────────────┘
       │ check quota available
       ▼
┌──────────────────────┐
│ Create LeaveApplication
│ (PENDING status)     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│ ILeaveRepository             │
│ .saveApplication()           │
│ .saveBalance()               │
└──────┬───────────────────────┘
       │ insert leave_applications & update balance
       ▼
┌──────────────────────┐
│ MySQL Database       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Log Event            │
│ (LEAVE_CREATED)      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ ApplyLeaveUseCase    │
│ returns LeaveApp     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ HTTP Response 201    │
│ {leave application}  │
└──────────────────────┘
```

### 3. Approve/Reject Leave Flow

```
┌──────────────┐
│ HTTP Request │
│ PATCH /admin/leaves/:id/execute
└──────┬───────┘
       │ validate input (action, notes)
       ▼
┌──────────────────────────────┐
│ AdminLeaveController         │
│ .executeStatus()             │
└──────┬───────────────────────┘
       │ check auth + admin role
       ▼
┌──────────────────────────────────┐
│ ApproveRejectLeaveUseCase        │
│ .execute()                       │
└──────┬───────────────────────────┘
       │ validate leave exists
       ▼
┌──────────────────────────────┐
│ Update LeaveApplication      │
│ (APPROVED/REJECTED status)   │
└──────┬───────────────────────┘
       │ [if REJECTED]
       ├─→ Refund balance
       │
       │ [if APPROVED]
       └─→ Keep balance deducted
       ▼
┌──────────────────────┐
│ Save updated status  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Log Event            │
│ (LEAVE_APPROVED/     │
│  LEAVE_REJECTED)     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ HTTP Response 200    │
│ {updated leave}      │
└──────────────────────┘
```

---

## 💻 Komponen Utama

### 1. User Management

**Entity: User**
```typescript
class User {
  id: string               // UUID
  email: string           // Unique
  fullName: string
  role: Role              // employee | admin
  password?: string       // Optional (jika OAuth)
}
```

**Repository: IUserRepository**
```typescript
interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<User>
  update(user: User): Promise<User>
  delete(id: string): Promise<void>
}
```

### 2. Leave Application Management

**Entity: LeaveApplication**
```typescript
class LeaveApplication {
  id: number | null
  userId: string
  startDate: DateTime
  endDate: DateTime
  totalDays: number
  reason: string
  attachmentPath: string
  status: LeaveStatus       // pending | approved | rejected
  approvedBy: string | null
  approvedAt: DateTime | null
}
```

**Entity: LeaveBalance**
```typescript
class LeaveBalance {
  id: number | null
  userId: string
  year: number
  totalQuota: number        // Total saldo cuti
  used: number              // Sudah digunakan
  remaining: number         // Sisa saldo
}
```

### 3. Authentication

**Supports:**
- ✅ Email/Password Registration & Login
- ✅ JWT Token-based Authentication
- ✅ OAuth (Google, GitHub, LinkedIn)
- ✅ Role-based Access Control (RBAC)

**JWT Token Structure:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "employee",
  "iat": 1699000000,
  "exp": 1699086400
}
```

### 4. File Upload

**Upload Location:** `tmp/uploads/`
**Supported:** Attachments untuk leave applications

**Controller Method:**
```typescript
async apply({ request, response, auth }: HttpContextContract) {
  const file = request.file('attachment');
  const filePath = await file.move('./tmp/uploads/');
  // ... use filePath in LeaveApplication
}
```

---

## 🗄️ Database Design

### ER Diagram

```
┌─────────────────────────────┐
│         users               │
├─────────────────────────────┤
│ * id (UUID) [PK]            │
│   email (VARCHAR) [UNIQUE]  │
│   password (VARCHAR)        │
│   full_name (VARCHAR)       │
│   role (ENUM)               │
│   created_at (TIMESTAMP)    │
│   updated_at (TIMESTAMP)    │
│   deleted_at (TIMESTAMP)    │
└──────────┬──────────────────┘
           │ 1:N
           │
           ├──────────────────────┬──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ leave_applications   │  │ leave_balances       │  │ user_identities      │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ * id (INT) [PK]      │  │ * id (INT) [PK]      │  │ * id (INT) [PK]      │
│ * user_id (UUID)     │  │ * user_id (UUID)     │  │ * user_id (UUID)     │
│   start_date (DATE)  │  │   year (INT)         │  │   provider (VARCHAR) │
│   end_date (DATE)    │  │   total_quota (INT)  │  │   provider_id (VARCHAR)
│   total_days (INT)   │  │   used (INT)         │  │   email (VARCHAR)    │
│   reason (TEXT)      │  │   remaining (INT)    │  │   verified_at        │
│   status (ENUM)      │  │   created_at         │  │   created_at         │
│   attachment_path    │  │   updated_at         │  │   updated_at         │
│   approved_by (UUID) │  │                      │  │                      │
│   approved_at        │  │                      │  │                      │
│   created_at         │  │                      │  │                      │
│   updated_at         │  │                      │  │                      │
└──────────┬───────────┘  └──────────────────────┘  └──────────────────────┘
           │
           │ approved_by → users.id
           │
           └─→ [FOREIGN KEY CHECK]
```

### Tabel Utama

#### users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(133),
  full_name VARCHAR(100) NOT NULL,
  role ENUM('employee', 'admin') DEFAULT 'employee',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL
);
```

#### leave_applications
```sql
CREATE TABLE leave_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT NOT NULL,
  reason TEXT NOT NULL,
  attachment_path VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);
```

#### leave_balances
```sql
CREATE TABLE leave_balances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  year INT NOT NULL,
  total_quota INT DEFAULT 12,
  used INT DEFAULT 0,
  remaining INT DEFAULT 12,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY (user_id, year)
);
```

---

## 🔐 Authentication & Authorization

### Login Flow

```
Email/Password + OAuth
         │
         ▼
┌────────────────────────┐
│ Verify Credentials     │
│ (Password hash compare)│
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Create JWT Token       │
│ (with user data)       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Return Token           │
│ (client stores in      │
│  localStorage/secure)  │
└────────┬───────────────┘
         │
         ▼ [Subsequent Requests]
┌────────────────────────┐
│ Extract Token from     │
│ Authorization Header   │
│ (Bearer <token>)       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Verify Token           │
│ - Validate signature   │
│ - Check expiration     │
│ - Extract claims       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Attach User to Request │
│ (auth.user available)  │
└────────────────────────┘
```

### Authorization

**Route Protection:**
```typescript
// Public routes
Route.post('/register', 'AuthController.register')  // No middleware
Route.post('/login', 'AuthController.login')

// Protected routes
Route.group(() => {
  Route.post('/leaves/apply', 'LeaveController.apply')
      .middleware('auth')  // Requires authentication
}).middleware('auth')

// Admin-only routes
Route.group(() => {
  Route.patch('/admin/leaves/:id/execute', 'AdminLeaveController.executeStatus')
      .middleware(['auth', 'admin'])  // Custom middleware needed
}).middleware(['auth', 'admin'])
```

**Role Checks:**
```typescript
// Di dalam Use Case atau Controller
if (user.role !== Role.ADMIN) {
  throw new AuthorizationError('Only admins can approve leaves');
}
```

---

## ❌ Error Handling

### Error Hierarchy

```
BaseError
├── DomainError              # Business rule violations
├── ValidationError          # Input validation failed
├── AuthorizationError       # Not authorized
├── NotFoundError           # Resource not found
├── ConflictError           # Resource conflict
├── InfrastructureError     # Technical failures
└── TechnicalError          # Unknown/system errors
```

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Global Error Handler

```typescript
// Exceptions/Handler.ts
export default class ExceptionHandler extends BaseExceptionHandler {
  protected statusCodes = {
    DomainError: 409,
    ValidationError: 422,
    AuthorizationError: 403,
    NotFoundError: 404,
    // ... etc
  }
  
  async handle(error: any, ctx: HttpContextContract) {
    // Customize error response
    return ctx.response.status(statusCode).json({
      message: error.message,
      code: error.code,
      details: error.details
    })
  }
}
```

---

## 📝 Logging System

### Log Levels

```
DEBUG < INFO < NOTICE < WARNING < ERROR < CRITICAL < ALERT < EMERGENCY
```

### Log Events

```typescript
export enum LogEvents {
  // Auth events
  AUTH_NEW_USER = 'AUTH_NEW_USER',
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  
  // Leave events
  LEAVE_CREATED = 'LEAVE_CREATED',
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_REJECTED = 'LEAVE_REJECTED',
  
  // Error events
  ERROR_VALIDATION = 'ERROR_VALIDATION',
  ERROR_UNAUTHORIZED = 'ERROR_UNAUTHORIZED'
}
```

### Log Metadata

```typescript
this.logger.info(LogEvents.LEAVE_CREATED, {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  details: {
    applicationId: 42,
    totalDays: 5,
    status: 'pending'
  }
})
```

### Log Output Format

```json
{
  "level": "INFO",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "event": "LEAVE_CREATED",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "details": {
    "applicationId": 42,
    "totalDays": 5,
    "status": "pending"
  }
}
```

---

## 🔄 Request/Response Cycle

### Typical Request Flow

```
1. HTTP Request arrives
   ↓
2. Global Middleware (BodyParser, RequestLogger)
   ↓
3. Route Matching
   ↓
4. Named Middleware (auth, admin)
   ↓
5. Input Validation (Validator)
   ↓
6. Controller Action
   ├─ Extract request data
   ├─ Instantiate Use Case
   ├─ Call Use Case.execute()
   └─ Format response
   ↓
7. Exception handling (if any error)
   ↓
8. Response middleware
   ↓
9. HTTP Response sent
```

### Request Validation Pattern

```typescript
// Define validator
export class LeaveValidator {
  public schema = schema.create({
    start_date: schema.date({ format: 'yyyy-MM-dd' }),
    end_date: schema.date({ format: 'yyyy-MM-dd' }),
    reason: schema.string(),
    attachment: schema.file()
  })
}

// Use in controller
const payload = await request.validate(LeaveValidator)
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | /api/v1/register | ❌ | - | Register user |
| POST | /api/v1/login | ❌ | - | Login user |
| GET | /api/v1/oauth/:provider/redirect | ❌ | - | OAuth redirect |
| GET | /api/v1/oauth/:provider/callback | ❌ | - | OAuth callback |
| POST | /api/v1/leaves/apply | ✅ | employee | Apply leave |
| GET | /api/v1/leaves/history | ✅ | employee | Get my leaves |
| GET | /api/v1/admin/leaves | ✅ | admin | Get all leaves |
| PATCH | /api/v1/admin/leaves/:id/execute | ✅ | admin | Approve/reject |

---

## 🔗 Dependencies Between Layers

```
Interfaces Layer
    ↓ ↑
    depends on / provides
    ↓ ↑
Use Cases Layer
    ↓ ↑
    depends on / implements
    ↓ ↑
Domain Layer (Interfaces)
    ↓ ↑
    implemented by
    ↓ ↑
Infrastructure Layer
    ↓ ↑
    uses
    ↓ ↑
External Libraries & Services
```

---

## 🎓 Best Practices

### 1. Dependencies Injection
```typescript
// ✅ GOOD: Inject dependencies
constructor(private userRepository: IUserRepository) {}

// ❌ BAD: Create directly
constructor() {
  this.userRepository = new LucidUserRepository()
}
```

### 2. Entity vs Model
```typescript
// ✅ GOOD: Use mappers
const entity = UserMapper.toDomain(model)
const model = UserMapper.toPersistence(entity)

// ❌ BAD: Mix them
const user = UserModel.find(id)  // Don't expose model layer
```

### 3. Error Handling
```typescript
// ✅ GOOD: Specific errors
throw new ValidationError('Email required')

// ❌ BAD: Generic errors
throw new Error('Error')
```

### 4. Logging Context
```typescript
// ✅ GOOD: Structured logging
logger.info(LogEvents.USER_CREATED, {
  userId: user.id,
  email: user.email
})

// ❌ BAD: Unstructured
logger.info('User created')
```

---

## 📚 Referensi Lebih Lanjut

- Clean Architecture by Robert C. Martin
- Domain-Driven Design by Eric Evans
- AdonisJS Documentation: https://docs.adonisjs.com
- SOLID Principles dalam TypeScript
