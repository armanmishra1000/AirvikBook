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

# Security & Antivirus Configuration
CLAMAV_PATH="C:\Program Files\ClamAV\clamscan.exe"
VIRUSTOTAL_API_KEY=your-virustotal-api-key-here

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

### Step 5: Install ClamAV (Antivirus)
```bash
# Method 1: Using Winget (Recommended)
winget install Cisco.ClamAV

# Method 2: Using Chocolatey
choco install clamav

# Method 3: Manual Installation
# Download from: https://www.clamav.net/downloads
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

### 1. ClamAV Setup
After installing ClamAV, verify the installation:
```bash
# Check if ClamAV is installed
"C:\Program Files\ClamAV\clamscan.exe" --version

# Update virus definitions (requires admin privileges)
"C:\Program Files\ClamAV\freshclam.exe"
```

### 2. VirusTotal API Setup
1. Go to [VirusTotal](https://www.virustotal.com/)
2. Create an account
3. Get your API key from the profile section
4. Add it to your `.env` file

### 3. Redis Setup
```bash
# Install Redis on Windows
# Download from: https://github.com/microsoftarchive/redis/releases

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

## 🧪 Testing the Installation

### Run Security Tests
```bash
# Test all security endpoints
.\test-api.ps1

# Test ClamAV integration
.\test-clamav-simple.ps1

# Test VirusTotal integration
.\test-virustotal-integration.ps1
```

### Verify Security Features
1. **File Upload Protection**: Try uploading a file through the API
2. **Password Validation**: Test password strength requirements
3. **Rate Limiting**: Test API rate limits
4. **JWT Security**: Test authentication endpoints

## 📊 Security Features Overview

### ✅ Implemented Security Measures
- **Multi-layer Malware Scanning** (ClamAV + VirusTotal + Signature-based)
- **Enhanced Password Security** (Length, complexity, history check)
- **Rate Limiting** (Global, auth, registration, email)
- **JWT Token Security** (Rotation, blacklisting, secure storage)
- **Input Sanitization** (XSS, SQL injection prevention)
- **Security Headers** (HSTS, CSP, X-Frame-Options)
- **Audit Logging** (Comprehensive security event tracking)
- **File Upload Security** (Path traversal, MIME validation)
- **CORS Configuration** (Environment-specific origins)

### 🔒 Security Endpoints
- `GET /api/v1/security/status` - System security status
- `GET /api/v1/security/audit-logs` - Security audit logs
- `POST /api/v1/security/validate-password` - Password validation
- `GET /api/v1/security/generate-password` - Secure password generation

## 🚨 Troubleshooting

### Common Issues

#### 1. ClamAV Not Found
```bash
# Check if ClamAV is installed
dir "C:\Program Files\ClamAV"

# Verify the path in .env
echo $env:CLAMAV_PATH
```

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
```

#### 4. Environment Variables Not Loading
```bash
# Check if .env file exists
dir .env

# Verify environment variables
node -e "console.log(require('dotenv').config())"
```

### Error Solutions

#### ClamAV Database Missing
```bash
# Run as Administrator
"C:\Program Files\ClamAV\freshclam.exe" --update-db
```

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
- [ClamAV Documentation](https://docs.clamav.net/)
- [VirusTotal API Documentation](https://developers.virustotal.com/)
- [Redis Documentation](https://redis.io/documentation)

### Security Best Practices
- Keep ClamAV virus definitions updated
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
CLAMAV_PATH="C:\Program Files\ClamAV\clamscan.exe"
VIRUSTOTAL_API_KEY=your-production-virustotal-key
```

### Security Checklist
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Monitoring and logging enabled
- [ ] Rate limiting configured
- [ ] Antivirus scanning active
- [ ] Audit logging enabled

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error logs in the console
3. Verify all prerequisites are installed
4. Ensure environment variables are correctly set
5. Test each component individually

---

**🎉 Congratulations! Your AirVikBook Hotel Management System is now secure and ready for production use!**
