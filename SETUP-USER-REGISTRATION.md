# User Registration Feature Setup Guide

## 🚀 Quick Start

The user registration feature is now **completely implemented** and ready to run! Follow these steps to get it working:

### 1. Backend Setup

```bash
cd backend
```

Add these JWT secrets to your `.env` file:
```env
JWT_ACCESS_SECRET=CnlEvQUn2Tw2YWyBueCFJ+vuQsK1QJty4ClhkNP4wAU=
JWT_REFRESH_SECRET=l+IpX3NDRUSHgC26a1RxCHa/EMiPtCw+G+9DFDDlSgU=
```

If you don't have a `.env` file, copy from the example:
```bash
cp env.example.txt .env
# Then add the JWT secrets above
```

Start the backend:
```bash
npm run dev
```

The backend will be available at: http://localhost:5000

### 2. Frontend Setup

```bash
cd ../frontend
```

Add to your `.env.local` file (create if it doesn't exist):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

Start the frontend:
```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

### 3. Test the Registration Flow

1. **Visit Registration Page**: http://localhost:3000/auth/register
2. **Fill out the form** with your details
3. **Submit** and get redirected to email verification
4. **Check the backend logs** for the verification email (since SMTP is configured)
5. **Use the verification link** from the logs
6. **Get redirected to success page**

## 🔧 API Endpoints Available

- `POST /api/v1/auth/register` - Register with email/password
- `POST /api/v1/auth/google` - Register/login with Google OAuth
- `POST /api/v1/auth/verify-email` - Verify email with token
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `GET /api/v1/auth/check-email/:email` - Check email availability
- `GET /api/v1/health` - Health check

## 📧 Email Configuration

The system is configured with Brevo SMTP. Emails will be sent for:
- Email verification during registration
- Welcome emails after verification

## 🧪 Testing with Postman

Import the Postman collection:
```bash
postman/user-registration.json
```

This includes all endpoints with proper test assertions.

## 🛠️ Troubleshooting

### Backend Issues

**JWT Error**: Make sure JWT secrets are set in `.env`
```env
JWT_ACCESS_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-secret
```

**Database Error**: Check your PostgreSQL connection
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/airvikbook?schema=public"
```

**Email Error**: Verify SMTP configuration in `.env`

### Frontend Issues

**API Connection**: Check `NEXT_PUBLIC_API_URL` in `.env.local`
**Google OAuth**: Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` for Google login

## 🎯 What's Implemented

### ✅ Backend (Complete)
- User registration with validation
- Email verification system
- Google OAuth integration
- JWT token management
- Email templates (HTML + text)
- Rate limiting and security
- Comprehensive testing

### ✅ Frontend (Complete)
- Registration form with real-time validation
- Password strength indicator
- Email availability checking
- Google OAuth button
- Email verification flow
- Success page with celebration
- Brand-compliant styling
- Dark mode support

## 🔐 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT tokens with 15min access + 7day refresh
- ✅ Email verification with 24h expiry
- ✅ Rate limiting on registration endpoints
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Disposable email blocking

## 🎨 UI/UX Features

- ✅ Real-time email availability checking
- ✅ Password strength meter with requirements
- ✅ Form validation with inline errors
- ✅ Loading states and success feedback
- ✅ Google OAuth with proper error handling
- ✅ Responsive design with dark mode
- ✅ Brand-compliant color scheme

## 📱 User Flow

1. **Registration Form** → `/auth/register`
2. **Email Verification** → `/auth/verify-email`
3. **Success Celebration** → `/auth/success`
4. **Auto-redirect** → `/dashboard` (5 second countdown)

The complete feature is ready for production use! 🚀