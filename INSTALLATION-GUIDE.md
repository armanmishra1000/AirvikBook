# 🏨 AirVikBook Hotel Management System - Installation Guide

## 📋 Prerequisites

### System Requirements
- **OS**: Windows 10/11 (64-bit)
- **Node.js**: Version 18 or higher
- **Database**: PostgreSQL or MySQL
- **Memory**: Minimum 4GB RAM
- **Storage**: 2GB free space

### Required Software
- [Node.js](https://nodejs.org/) (LTS version)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/) or [MySQL](https://www.mysql.com/)
- [Redis](https://redis.io/) (for caching and session management)

## 🚀 Quick Installation

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd AirVikBook/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
```bash
# Copy the example environment file
copy env.example.txt .env
```

### Step 4: Configure Environment Variables
Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/airvikbook"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security Headers
SECURITY_HEADERS_ENABLED=true
CSP_REPORT_URI=your-csp-report-uri

# Security Configuration

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```



### Step 6: Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### Step 7: Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 🔧 Security Features Installation

### 3. Redis Setup
```bash
# Install Redis on Windows using winget (Recommended)
winget install Redis

# Or install Memurai Developer (Redis-compatible for Windows)
winget install Memurai.MemuraiDeveloper

# Or use Docker (if Docker Desktop is running)
docker run -d -p 6379:6379 --name airvikbook-redis redis:alpine

# Verify Redis installation
redis-cli ping
```

#### Redis Verification Steps
After installation, verify Redis is working:

```bash
# Navigate to backend directory
cd AirvikBook/backend

# Run Redis connection test
node test-redis.js

# Run JWT Redis integration test
node test-jwt-redis.js
```

**Expected Output:**
```
🔍 Testing Redis connection...
📡 Attempting to connect to Redis...
✅ Redis connection successful!
🧪 Testing Redis operations...
✅ Set operation successful
✅ Get operation successful: Hello from AirVikBook!
✅ JWT blacklist set successful
✅ JWT blacklist check successful: Token is blacklisted
🎉 All Redis tests passed! Redis is working correctly.
```

## 🧪 Testing the Installation

### Run Security Tests
```bash
# Test all security endpoints
.\test-api.ps1


```

### Redis Testing (Required)
```bash
# Navigate to backend directory
cd AirvikBook/backend

# Test basic Redis connectivity
node test-redis.js

# Test JWT Redis integration
node test-jwt-redis.js
```

### Verify Security Features
1. **Redis Connectivity**: Ensure Redis is running and accessible
2. **JWT Token Blacklisting**: Verify tokens are properly blacklisted in Redis
3. **File Upload Protection**: Try uploading a file through the API
4. **Password Validation**: Test password strength requirements
5. **Rate Limiting**: Test API rate limits
6. **JWT Security**: Test authentication endpoints

## 📊 Security Features Overview

### ✅ Implemented Security Measures
- **Signature-based Malware Detection** (File type and content analysis)
- **Enhanced Password Security** (Length, complexity, history check)
- **Rate Limiting** (Global, auth, registration, email)
- **JWT Token Security** (Rotation, blacklisting, secure storage with Redis)
- **Redis Integration** (Token blacklisting, session management, caching)
- **Input Sanitization** (XSS, SQL injection prevention)
- **Security Headers** (HSTS, CSP, X-Frame-Options)
- **Audit Logging** (Comprehensive security event tracking)
- **File Upload Security** (Path traversal, MIME validation)
- **CORS Configuration** (Environment-specific origins)

### 🔄 Redis Integration Status
- **✅ Redis Connection**: Working on `redis://localhost:6379`
- **✅ JWT Blacklisting**: Tokens properly blacklisted with TTL
- **✅ Session Management**: User sessions tracked in Redis
- **✅ Token Rotation**: Refresh token rotation with Redis storage
- **✅ Security Features**: All Redis-based security operations functional

### 🔒 Security Endpoints
- `GET /api/v1/security/status` - System security status
- `GET /api/v1/security/audit-logs` - Security audit logs
- `POST /api/v1/security/validate-password` - Password validation
- `GET /api/v1/security/generate-password` - Secure password generation

## 🚨 Troubleshooting

### Common Issues



#### 2. Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Reset database (development only)
npx prisma migrate reset
```

#### 3. Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping

# Check if Redis is running
netstat -an | findstr 6379

# If Redis is not installed, install it:
winget install Redis

# Or use Docker (if Docker Desktop is running):
docker run -d -p 6379:6379 --name airvikbook-redis redis:alpine

# Test Redis from Node.js
cd AirvikBook/backend
node test-redis.js
```

**Common Redis Issues:**
- **Redis not installed**: Install using `winget install Redis`
- **Docker not running**: Start Docker Desktop before running Redis container
- **Port 6379 in use**: Check what's using the port with `netstat -ano | findstr 6379`
- **Connection refused**: Ensure Redis service is running

#### 4. Environment Variables Not Loading
```bash
# Check if .env file exists
dir .env

# Verify environment variables
node -e "console.log(require('dotenv').config())"
```

### Error Solutions



#### Permission Denied
```bash
# Run PowerShell as Administrator
# Then run the installation commands
```

#### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <process-id> /F
```

## 📚 Additional Resources

### Documentation
- [Prisma Documentation](https://www.prisma.io/docs/)

- [Redis Documentation](https://redis.io/documentation)

### Security Best Practices
- Regularly rotate JWT secrets
- Monitor audit logs for suspicious activity
- Use HTTPS in production
- Implement proper backup strategies

## 🎯 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
REDIS_URL=your-production-redis-url

```

### Security Checklist
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Monitoring and logging enabled
- [ ] Rate limiting configured

- [ ] Audit logging enabled
- [ ] Redis connection verified
- [ ] JWT token blacklisting tested
- [ ] Session management working

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error logs in the console
3. Verify all prerequisites are installed
4. Ensure environment variables are correctly set
5. Test each component individually

---

**🎉 Congratulations! Your AirVikBook Hotel Management System is now secure and ready for production use!**
