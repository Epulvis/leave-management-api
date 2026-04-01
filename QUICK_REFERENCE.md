# Quick Reference Guide

## ⚡ Commands Cheat Sheet

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production build
npm run start

# Run tests
npm run test

# Run specific test file
npm run test -- tests/functional/auth.spec.ts

# Watch mode for tests
npm run test -- --watch
```

### Database

```bash
# Create database
node ace migration:run

# Rollback last migration
node ace migration:rollback

# Rollback all migrations
node ace migration:rollback --batch 0

# Check migration status
node ace migration:status

# Create new migration
node ace make:migration create_table_name

# Seed database
node ace db:seed

# Seed specific seeder
node ace db:seed --files="AdminSeeder.ts"

# Create new seeder
node ace make:seeder SeederName
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs (all)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f api
docker-compose logs -f mysql_db

# Execute command in container
docker-compose exec api npm run dev

# Rebuild services
docker-compose up -d --build

# Remove volumes (reset database)
docker-compose down -v
```

### Git

```bash
# Clone repository
git clone <repo-url>
cd leave-management-api

# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git commit -m "Message"

# Push changes
git push origin feature/your-feature

# Pull latest
git pull origin main
```

---

## 🔑 Environment Variables Quick Reference

### Database Connection
```env
DB_CONNECTION=mysql           # Type of database
MYSQL_HOST=mysql_db           # Host (use mysql_db di Docker)
MYSQL_PORT=3306              # Port
MYSQL_USER=lucid             # Username
MYSQL_PASSWORD=lucid123      # Password
MYSQL_DB_NAME=leave_management # Database name
```

### Application
```env
PORT=3333                     # Application port
HOST=0.0.0.0                  # Bind address
NODE_ENV=development          # Environment
APP_KEY=<generated>           # Encryption key (run: node ace key:generate)
```

### OAuth (Optional)
```env
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=yyy
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=yyy
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=yyy
```

### Docker
```env
CHOKIDAR_USEPOLLING=true      # For Docker file watching
PMA_HOST=mysql_db             # phpMyAdmin database host
MYSQL_ROOT_PASSWORD=root123   # MySQL root password
MYSQL_DATABASE=leave_management # Default database
```

---

## 🗄️ API Endpoints Quick Reference

### Authentication (Public)
```bash
# Register
POST /api/v1/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123",
  "full_name": "John Doe"
}

# Login
POST /api/v1/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123"
}

# OAuth Redirect
GET /api/v1/oauth/:provider/redirect
# provider: github, google, linkedin

# OAuth Callback
GET /api/v1/oauth/:provider/callback?code=xxx
```

### Leaves (Protected - Requires JWT Token)
```bash
# Apply Leave
POST /api/v1/leaves/apply
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "start_date": "2024-02-10",
  "end_date": "2024-02-14",
  "reason": "Annual vacation",
  "attachment": <file>
}

# Get My Leave History
GET /api/v1/leaves/history
Authorization: Bearer <your_jwt_token>

# Get All Leaves (Admin Only)
GET /api/v1/admin/leaves
Authorization: Bearer <admin_jwt_token>

# Approve/Reject Leave (Admin Only)
PATCH /api/v1/admin/leaves/:id/execute
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "action": "approved",  // or "rejected"
  "notes": "Approved for personal reasons"
}
```

---

## 📊 Default Credentials (After Seeding)

### Admin User
```
Email: admin@example.com
Password: Admin@123456
Role: admin
```

### Sample Employees
```
Email: john.doe@example.com
Password: Employee@123456
Role: employee

Email: jane.smith@example.com
Password: Employee@123456
Role: employee

Email: bob.johnson@example.com
Password: Employee@123456
Role: employee
```

⚠️ **Change passwords after first login in production**

---

## 🔍 Useful Debugging Commands

### Check if Docker services are running
```bash
docker-compose ps
```

### Check API is responding
```bash
curl http://localhost:3333
curl http://localhost:3333/health  # If health endpoint exists
```

### Check database connection
```bash
mysql -h 127.0.0.1 -u lucid -p leave_management
```

### See database seeders are run
```bash
mysql -u lucid -p leave_management
SELECT count(*) FROM users;
SELECT * FROM users;
```

### Check API logs
```bash
npm run dev        # Shows console logs
docker-compose logs -f api  # Shows Docker container logs
```

### Tail error logs
```bash
tail -f logs/error.log  # If error logging is configured
```

### Check TypeScript compilation errors
```bash
npx tsc --noEmit
```

---

## 🚀 Common Workflows

### First Time Setup
```bash
# 1. Clone and install
git clone <repo>
cd leave-management-api
npm install

# 2. Setup environment
cp .env.example .env

# 3. Use Docker
docker-compose up -d

# 4. Run migrations
npm run dev

# 5. Seed database (in another terminal)
docker-compose exec api node ace db:seed

# 6. Test
# Open http://localhost:3333 in browser
# Or use Postman with provided collection
```

### Adding New Feature
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Create migration if DB changes needed
node ace make:migration add_field_to_table

# 3. Create new files:
# - app/UseCases/Feature/NewFeatureUseCase.ts
# - app/Interfaces/Http/Controllers/NewController.ts

# 4. Run and test
npm run dev

# 5. Test with Postman or curl

# 6. Commit and push
git commit -m "Add: new feature"
git push origin feature/new-feature
```

### Testing Changes
```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, run tests
npm run test

# 3. Run specific test
npm run test -- tests/functional/leaves.spec.ts

# 4. Watch mode for TDD
npm run test -- --watch
```

### Deploying to Production
```bash
# 1. Build
npm run build

# 2. Test build
npm run start

# 3. Push to production repository
git push origin main

# 4. Production server:
npm install --production
node ace migration:run
npm run start
```

---

## 📁 Important Files & Locations

### Configuration
- `.env` - Environment variables
- `config/database.ts` - Database config
- `config/auth.ts` - Auth config
- `tsconfig.json` - TypeScript config

### Source Code
- `app/Domain/` - Business logic
- `app/UseCases/` - Use cases
- `app/Interfaces/Http/Controllers/` - API controllers
- `start/routes.ts` - Route definitions

### Database
- `database/migrations/` - Schema migrations
- `database/seeders/` - Data seeders
- `database/factories/` - Test data factories

### Tests
- `tests/functional/` - Functional tests
- `tests/unit/` - Unit tests (if created)

### Documentation
- `PROJECT_SUMMARY.md` - Project overview
- `INSTALLATION_GUIDE.md` - Setup guide
- `ARCHITECTURE.md` - Architecture documentation
- `database/seeders/README.md` - Seeder documentation

---

## 🆘 Quick Troubleshooting

| Error | Solution |
|-------|----------|
| `Port 3333 already in use` | `lsof -i :3333` then `kill -9 <PID>` or change PORT in .env |
| `Cannot connect to database` | Check MySQL is running, verify .env credentials |
| `Migration pending` | Run `node ace migration:run` |
| `Cannot find module` | Run `npm install` and `npm run build` |
| `Docker won't start` | `docker-compose down -v` then `docker-compose up` |
| `Admin not created` | Run `docker-compose exec api node ace db:seed` |
| `JWT token expired` | Token valid for 24hrs (configurable), user needs to login again |

---

## 📞 Getting Help

1. **Check Documentation**
   - [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
   - [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
   - [ARCHITECTURE.md](./ARCHITECTURE.md)

2. **Check Logs**
   - Console output dari `npm run dev`
   - Docker logs: `docker-compose logs -f`

3. **Test with Postman**
   - Import collection dari `postman/collections/`
   - Set environment dari `postman/environments/`

4. **Debug Code**
   - Add breakpoints di VS Code
   - Use debugger: `node --inspect-brk ace serve`

---

## 📚 Learning Resources

- AdonisJS: https://docs.adonisjs.com
- TypeScript: https://www.typescriptlang.org/docs/
- Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- REST API: https://restfulapi.net/
- JWT: https://jwt.io/

---

## 💡 Pro Tips

1. **Use Docker** - Avoid local MySQL setup, use docker-compose
2. **Keep .env secure** - Never commit .env to repository
3. **Test before commit** - Run tests before pushing code
4. **Use feature branches** - Always create branch for new features
5. **Write meaningful commits** - Use conventional commits (feat:, fix:, docs:)
6. **Document changes** - Update relevant documentation files
7. **Backup database** - Before major changes, backup database

---

Last Updated: 2024
Quick Reference for Leave Management API
