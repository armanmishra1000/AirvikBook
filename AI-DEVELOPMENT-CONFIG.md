# AI Development Configuration

**CRITICAL: AI MUST read this file before generating any code**

## 🎯 Project Context
- **Project**: AirVikBook Hotel Management System
- **Type**: Full-stack web application
- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Prisma
- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Development**: 100% AI-assisted development

## 🔐 Authentication & Security Patterns (MANDATORY)

### Token Storage (NEVER CHANGE)
```typescript
// Frontend Token Management
sessionStorage.setItem('airvik_access_token', token);      // Access token (15min)
localStorage.setItem('airvik_refresh_token', refreshToken); // Refresh token (7 days)
sessionStorage.setItem('airvik_user', JSON.stringify(user)); // User data

// Token Retrieval
const accessToken = sessionStorage.getItem('airvik_access_token');
const refreshToken = localStorage.getItem('airvik_refresh_token');
const user = JSON.parse(sessionStorage.getItem('airvik_user') || '{}');
```

### API Request Headers
```typescript
// Standard Headers for All API Calls
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('airvik_access_token')}`
};
```

## 📡 API Specifications (STRICT COMPLIANCE)

### Base Configuration
```typescript
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  PREFIX: '/api/v1',
  TIMEOUT: 30000
};

// Full API URL Pattern
const API_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}/[resource]/[action]`;
```

### Response Format (MANDATORY)
```typescript
// Success Response (Status 200)
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Error Response (Status 4xx/5xx)
interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

// Usage in Backend Controllers
res.status(200).json({ success: true, data: result });
res.status(400).json({ success: false, error: "Message", code: "ERROR_CODE" });
```

### Standard CRUD Endpoints
```typescript
// Resource Management Pattern
POST   /api/v1/[resource]/create      // Create new resource
GET    /api/v1/[resource]/:id         // Get single resource
GET    /api/v1/[resource]/list        // Get all resources (with pagination)
PUT    /api/v1/[resource]/:id         // Update resource
DELETE /api/v1/[resource]/:id         // Delete resource

// Authentication Endpoints
POST   /api/v1/auth/register          // User registration
POST   /api/v1/auth/login             // User login
POST   /api/v1/auth/google            // Google OAuth login
POST   /api/v1/auth/refresh           // Refresh access token
POST   /api/v1/auth/logout            // User logout
GET    /api/v1/auth/profile           // Get user profile
PUT    /api/v1/auth/profile           // Update user profile
```

## 🗂️ File Organization (STRICT STRUCTURE)

### Backend Structure
```
backend/
├── src/
│   ├── services/                    # Business Logic Layer
│   │   └── [feature]/
│   │       └── [feature].service.ts # e.g., user/user.service.ts
│   ├── controllers/                 # Request Handlers
│   │   └── [feature]/
│   │       └── [feature].controller.ts # e.g., user/user.controller.ts
│   ├── routes/                      # Route Definitions
│   │   └── [feature].routes.ts      # e.g., user.routes.ts
│   ├── middleware/                  # Middleware Functions
│   │   ├── auth.middleware.ts       # Authentication middleware
│   │   ├── validation.middleware.ts # Request validation
│   │   └── error.middleware.ts      # Error handling
│   ├── utils/                       # Utility Functions
│   │   ├── response.utils.ts        # Standard API responses
│   │   ├── validation.utils.ts      # Input validation helpers
│   │   └── token.utils.ts           # JWT token utilities
│   ├── types/                       # TypeScript type definitions
│   │   └── [feature].types.ts       # Generated from Prisma schema
│   └── config/                      # Configuration Files
│       ├── database.config.ts       # Prisma client configuration
│       └── environment.config.ts    # Environment variables
├── prisma/                          # Prisma Configuration
│   ├── schema.prisma               # Database schema definition
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Database seeding script
└── package.json                    # Dependencies and scripts
```

### Frontend Structure
```
frontend/src/
├── app/                             # Next.js 14 App Router
│   ├── [feature]/                   # Feature pages
│   │   └── page.tsx                 # e.g., profile/page.tsx
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   └── globals.css                  # Global styles
├── components/                      # React Components
│   └── [feature]/                   # Feature components
│       ├── [Component].tsx          # e.g., ProfileForm.tsx
│       └── index.ts                 # Export file
├── services/                        # API Communication Layer
│   └── [feature].service.ts         # e.g., user.service.ts
├── types/                           # TypeScript Type Definitions
│   └── [feature].types.ts           # e.g., user.types.ts
├── store/                           # Redux State Management
│   ├── [feature]/
│   │   └── [feature].slice.ts       # e.g., user/user.slice.ts
│   └── index.ts                     # Store configuration
└── utils/                           # Utility Functions
    ├── api.utils.ts                 # API helper functions
    ├── storage.utils.ts             # Local/session storage helpers
    └── validation.utils.ts          # Form validation helpers
```

## 🛢️ Database Schema Patterns (Prisma)

### Prisma Schema Structure
```prisma
// Standard model structure in schema.prisma
model [Feature] {
  // Primary key (always use cuid())
  id        String   @id @default(cuid())
  
  // Feature-specific fields
  // Add your fields here with proper types and constraints
  
  // Standard base fields (ALWAYS INCLUDE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  isActive  Boolean  @default(true)
  
  // Relations (if any)
  // relatedModel RelatedModel @relation(fields: [fieldId], references: [id])
  
  // Table mapping
  @@map("[feature]s")
}

// Enums for type safety
enum [Feature]Status {
  ACTIVE
  INACTIVE
  PENDING
}
```

### Generated TypeScript Types
```typescript
// Prisma automatically generates types from schema
import { PrismaClient, User, UserRole } from '@prisma/client';

// Prisma client initialization
const prisma = new PrismaClient();

// Service usage example
export class [Feature]Service {
  async create[Feature](data: Prisma.[Feature]CreateInput) {
    return await prisma.[feature].create({
      data,
    });
  }
  
  async get[Feature]ById(id: string) {
    return await prisma.[feature].findUnique({
      where: { id },
      include: {
        // Include related models if needed
      },
    });
  }
}
```

### User Model Example (Prisma Schema)
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  password        String?   // Optional for social login
  fullName        String
  mobileNumber    String?
  role            UserRole  @default(GUEST)
  profilePicture  String?
  googleId        String?   @unique
  isEmailVerified Boolean   @default(false)
  lastLoginAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  isActive        Boolean   @default(true)
  
  // Relations
  bookings        Booking[]
  reviews         Review[]
  
  @@map("users")
}

enum UserRole {
  GUEST
  STAFF
  ADMIN
  OWNER
}
```

## 🎨 Component Development Patterns

### React Component Template
```typescript
import React, { useState, useEffect } from 'react';
import { [Feature]Service } from '@/services/[feature].service';
import { [Feature]Type } from '@/types/[feature].types';

interface [Component]Props {
  className?: string;
  // Add specific props
}

export default function [Component]({ className, ...props }: [Component]Props) {
  // State management
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<[Feature]Type[]>([]);

  // API calls
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await [Feature]Service.getAll();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Render
  return (
    <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-600 text-center">{error}</div>}
      {data.length > 0 && (
        <div className="space-y-4">
          {/* Render data */}
        </div>
      )}
    </div>
  );
}
```

## 🧪 Testing Patterns

### Backend Test Structure
```typescript
import request from 'supertest';
import app from '../src/server';

describe('[Feature] Controller', () => {
  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup test data
  });

  describe('POST /api/v1/[feature]/create', () => {
    it('should create [feature] successfully', async () => {
      const testData = {
        // Test data
      };

      const response = await request(app)
        .post('/api/v1/[feature]/create')
        .send(testData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
    });

    it('should return validation error for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/[feature]/create')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

### Frontend Test Structure
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import [Component] from '../[Component]';

describe('[Component]', () => {
  it('renders correctly', () => {
    render(<[Component] />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<[Component] />);
    
    const button = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Success Message')).toBeInTheDocument();
    });
  });
});
```

## ⚙️ Environment Configuration

### Backend Environment Variables
```bash
# Core Configuration
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/airvikbook?schema=public"
JWT_SECRET=development-secret-key
JWT_REFRESH_SECRET=development-refresh-secret
FRONTEND_URL=http://localhost:3000
API_PREFIX=/api/v1

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional Integrations
TWILIO_ACCOUNT_SID=your-twilio-sid
RAZORPAY_KEY_ID=your-razorpay-key
WHATSAPP_ACCESS_TOKEN=your-whatsapp-token
```

### Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_PREFIX=/api/v1

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id

# Public Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-public-key

# Feature Flags
NEXT_PUBLIC_ENABLE_SMS=true
NEXT_PUBLIC_ENABLE_WHATSAPP=true
```

## 🚨 Error Handling Standards

### Backend Error Handling
```typescript
import { ResponseUtil } from '../utils/response.utils';

// Service Layer Error Handling
export class [Feature]Service {
  async create[Feature](data: any) {
    try {
      // Business logic
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message, 
        code: 'SERVICE_ERROR' 
      };
    }
  }
}

// Controller Error Handling
export class [Feature]Controller {
  async create[Feature](req: Request, res: Response) {
    try {
      const result = await [Feature]Service.create[Feature](req.body);
      if (result.success) {
        return ResponseUtil.success(res, result.data);
      } else {
        return ResponseUtil.error(res, result.error, result.code);
      }
    } catch (error) {
      return ResponseUtil.serverError(res, error);
    }
  }
}
```

### Frontend Error Handling
```typescript
// Service Layer Error Handling
export class [Feature]Service {
  static async create[Feature](data: any) {
    try {
      const response = await fetch(`${API_URL}/[feature]/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('airvik_access_token')}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Network error occurred',
        code: 'NETWORK_ERROR'
      };
    }
  }
}

// Component Error Handling
const handleSubmit = async (data: any) => {
  try {
    setLoading(true);
    const response = await [Feature]Service.create[Feature](data);
    
    if (response.success) {
      toast.success('Operation successful');
      // Handle success
    } else {
      toast.error(response.error);
      setError(response.error);
    }
  } catch (error) {
    toast.error('Unexpected error occurred');
    setError('Unexpected error occurred');
  } finally {
    setLoading(false);
  }
};
```

## 📝 Documentation Requirements

### Code Comments Standards
```typescript
/**
 * [Feature] Service
 * Handles all business logic related to [feature] operations
 * 
 * @class [Feature]Service
 * @author AI Assistant
 * @version 1.0.0
 */
export class [Feature]Service {
  /**
   * Creates a new [feature] record
   * 
   * @param {Object} data - [Feature] data to create
   * @returns {Promise<ServiceResponse>} - Service response with created data
   * @throws {Error} - If validation fails or database error occurs
   */
  async create[Feature](data: any): Promise<ServiceResponse> {
    // Implementation
  }
}
```

### File Header Template
```typescript
/**
 * @fileoverview [Description of file purpose]
 * @module [ModuleName]
 * @version 1.0.0
 * @author AI Assistant
 * @created 2024-01-01
 * @updated 2024-01-01
 */
```

---

**REMEMBER: This file contains MANDATORY patterns. AI must follow these exactly when generating code for the AirVikBook project.**