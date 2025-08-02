# AirVikBook - Hotel Management System

A modern, comprehensive hotel management system built with React/Next.js and Node.js, developed using 100% AI-assisted development.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- Git

### Installation & Setup

1. **Clone and Install Dependencies**
```bash
git clone git@github.com:armanmishra1000/AirvikBook.git
cd AirvikBook
npm run install:all  # Installs all dependencies (root, backend, frontend)
```

2. **Setup Environment Variables**

**Backend Environment:**
```bash
cd backend
cp env.example.txt .env
# Edit .env with your actual values
```

**Frontend Environment:**
```bash
cd frontend
cp env.example.txt .env.local
# Edit .env.local with your actual values
```

3. **Start Development Servers**
```bash
# From root directory - starts both servers
npm run dev

# OR start individually:
npm run dev:backend   # Backend: http://localhost:5000
npm run dev:frontend  # Frontend: http://localhost:3000
```

## 🔧 Environment Configuration Details

### Backend Environment Variables (.env)
```bash
# Core Configuration
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/airvikbook
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
FRONTEND_URL=http://localhost:3000
API_PREFIX=/api/v1

# Authentication & Social Login
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional Integrations
TWILIO_ACCOUNT_SID=your-twilio-sid (for SMS)
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token (for WhatsApp)
RAZORPAY_KEY_ID=your-razorpay-key (for payments)
```

### Frontend Environment Variables (.env.local)
```bash
# Core Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_PREFIX=/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Public Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-public-key
GOOGLE_CLIENT_ID=your-google-client-id

# Feature Flags
NEXT_PUBLIC_ENABLE_SMS=true
NEXT_PUBLIC_ENABLE_WHATSAPP=true
```

## 📁 Project Structure

```
Airvikbook-main/
├── backend/          # Node.js/Express API
├── frontend/         # Next.js 14 application
├── shared/           # Shared contracts and types
├── docs/             # Feature documentation
├── postman/          # API test collections
├── PRD.md            # Product Requirements Document
├── Features.md       # Complete feature list
└── README.md         # This file
```

## 🔧 Development Workflow

1. **Feature Planning**: Use `Universal-features-prompt-template.md`
2. **Implementation**: Use `automated-tasks-prompt-template.md`
3. **Testing**: Run tests after each task
4. **Documentation**: Update docs/features/project-progress.md

## 🔑 Important Patterns

### Token Storage
- Access Token: `sessionStorage.getItem('airvik_access_token')`
- Refresh Token: `localStorage.getItem('airvik_refresh_token')`

### API Format
- Base URL: `http://localhost:5000`
- API Prefix: `/api/v1`
- Response Format: `{ success: true/false, data/error }`

## 🤖 AI Code Generation Guidelines

**CRITICAL: AI MUST follow these patterns exactly when generating code**

### Authentication & Token Management
```typescript
// Token Storage (NEVER CHANGE)
const TOKEN_KEYS = {
  ACCESS: 'airvik_access_token',    // sessionStorage
  REFRESH: 'airvik_refresh_token',  // localStorage
  USER: 'airvik_user'              // sessionStorage
};

// Usage in Frontend Services
const accessToken = sessionStorage.getItem('airvik_access_token');
const refreshToken = localStorage.getItem('airvik_refresh_token');

// API Headers Pattern
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### API Response Format (MANDATORY)
```typescript
// Success Response Structure
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Error Response Structure
interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

// Backend Controller Usage
return res.status(200).json({
  success: true,
  data: result
});

return res.status(400).json({
  success: false,
  error: "Validation failed",
  code: "VALIDATION_ERROR"
});
```

### File Organization Patterns
```typescript
// Backend Structure
backend/src/
├── models/[feature].model.ts          // MongoDB schemas
├── services/[feature]/[feature].service.ts  // Business logic
├── controllers/[feature]/[feature].controller.ts  // Request handlers
├── routes/[feature].routes.ts         // Route definitions
├── middleware/auth.middleware.ts      // Authentication
└── utils/response.utils.ts           // Standard responses

// Frontend Structure  
frontend/src/
├── app/[feature]/page.tsx            // Next.js pages
├── components/[feature]/[Component].tsx  // React components
├── services/[feature].service.ts     // API calls
├── types/[feature].types.ts         // TypeScript interfaces
└── store/[feature]/[feature].slice.ts  // Redux slices
```

### Database Schema Patterns
```typescript
// MongoDB Schema Structure
const [Feature]Schema = new mongoose.Schema({
  // Always include these base fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  
  // Feature-specific fields
  // ...
}, { timestamps: true });

// Export both schema and interface
export const [Feature] = mongoose.model('[Feature]', [Feature]Schema);
export interface I[Feature] extends Document {
  // TypeScript interface
}
```

### Standard API Endpoints
```bash
# Resource CRUD Pattern
POST   /api/v1/[resource]/create
GET    /api/v1/[resource]/:id
GET    /api/v1/[resource]/list
PUT    /api/v1/[resource]/:id
DELETE /api/v1/[resource]/:id

# Authentication Endpoints
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/google
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

### Component Patterns
```typescript
// React Component Structure
import { useState, useEffect } from 'react';
import { [Feature]Service } from '@/services/[feature].service';
import { [Feature]Type } from '@/types/[feature].types';

interface [Component]Props {
  // Props interface
}

export default function [Component]({ ...props }: [Component]Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<[Feature]Type[]>([]);
  
  // Component logic
  
  return (
    <div className="p-4">
      {/* JSX with Tailwind CSS */}
    </div>
  );
}
```

### Error Handling Patterns
```typescript
// Backend Error Handling
import { ResponseUtil } from '../utils/response.utils';

try {
  // Business logic
  return ResponseUtil.success(res, data);
} catch (error) {
  return ResponseUtil.serverError(res, error);
}

// Frontend Error Handling
try {
  const response = await apiCall();
  if (response.success) {
    // Handle success
  } else {
    toast.error(response.error);
  }
} catch (error) {
  toast.error('Network error occurred');
}
```

## 📚 Documentation

- **PRD.md**: Complete project requirements
- **Features.md**: All 19 phases of features
- **docs/features/**: Individual feature documentation

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test

# API tests
newman run postman/[feature].postman_collection.json
```

## 🤝 Contributing

This project uses AI-assisted development. Please follow:
1. Read PRD.md before starting
2. Use provided prompt templates
3. One developer per feature
4. Test before committing

## 📝 License

ISC License

---

Built with ❤️ using AI-assisted development