# Hotel Management System - Product Requirements Document (PRD)

## 🏨 Project Overview

**Project Name**: AirVikBook Hotel Management System  
**Project Type**: Web-based Hotel Management Platform  
**Development Approach**: 100% AI-Assisted Development  
**Target Users**: Hotel owners, staff, and guests  
**Architecture**: Modern React/Next.js frontend with Node.js backend

## 🎯 Core Objectives

1. **Build a complete hotel management system** with booking, payment, and operations
2. **Use AI for 100% of development** - developers only copy/paste prompts
3. **Create self-documenting, maintainable code** with AI memory system
4. **Support multi-property hotels** with multiple buildings and reception desks

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **UI**: React 19+ with TypeScript
- **Styling**: Tailwind CSS 4.0
- **State**: Redux Toolkit
- **Forms**: React Hook Form + Zod
- **Auth**: NextAuth.js with Google OAuth

### Backend  
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **API**: RESTful with /api/v1 prefix
- **Auth**: JWT (access in sessionStorage, refresh in localStorage)
- **Validation**: Express-validator

### Infrastructure
- **Dev Server**: localhost:5000 (backend), localhost:3000 (frontend)
- **File Storage**: Local filesystem (production: AWS S3)
- **Deployment**: Vercel (frontend), Railway/Render (backend)

## 📁 Project Structure

```
Airvikbook/
├── backend/
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation
│   │   └── utils/          # Helpers
│   └── server.ts           # Entry point
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   ├── services/      # API calls
│   │   ├── types/         # TypeScript types
│   │   └── store/         # Redux store
│   └── next.config.js
├── shared/
│   └── contracts/         # API contracts
├── docs/
│   └── features/         # Feature documentation
└── postman/              # API test collections
```

## 🔑 Critical Patterns (AI MUST FOLLOW)

### 1. Authentication Pattern
```javascript
// Token Storage (NEVER DEVIATE)
const accessToken = sessionStorage.getItem('airvik_access_token');
const refreshToken = localStorage.getItem('airvik_refresh_token');

// API Headers
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### 2. API Response Format
```typescript
// Success Response
{
  success: true,
  data: { /* actual data */ },
  message?: "Optional success message"
}

// Error Response  
{
  success: false,
  error: "Human readable error",
  code: "ERROR_CODE",
  details?: { /* validation errors */ }
}
```

### 3. API Endpoint Pattern
```
Base URL: http://localhost:5000
Pattern: /api/v1/[resource]/[action]

Examples:
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/users/profile
PUT    /api/v1/bookings/:id
```

## 📋 Development Workflow

### For Each Feature:
1. **Planning Phase** (Universal Template)
   - AI creates feature docs in `docs/features/[feature-name]/`
   - Generates: spec.md, api.md, tasks.md, task-prompts.md
   - Creates AI memory files: CURRENT-STATE.md, API-CONTRACT.md

2. **Implementation Phase** (Automated Template)
   - Backend first (B1-B5), then Frontend (F1-F5)
   - Each task: Code → Test → Commit → Update docs
   - AI tracks progress in CURRENT-STATE.md

3. **Integration Phase**
   - Verify tokens work correctly
   - Test with existing features
   - Update project-progress.md

## 🏗️ Feature Phases (19 Total)

### Phase 1-5: Core System
1. **Authentication**: User registration, login, Google OAuth
2. **Property Management**: Rooms, buildings, amenities  
3. **Availability**: Calendar, inventory, restrictions
4. **Booking Engine**: Search, selection, confirmation
5. **Payments**: Multiple gateways, deposits, refunds

### Phase 6-10: Operations
6. **Booking Management**: Check-in/out, modifications
7. **Pricing**: Dynamic rates, promotions, packages
8. **Customer Management**: Profiles, loyalty, communication
9. **Staff Management**: Roles, schedules, permissions
10. **Reporting**: Analytics, KPIs, custom reports

### Phase 11-15: Advanced
11. **Channel Management**: OTA integration
12. **Communications**: Email, SMS, WhatsApp
13. **Role Management**: Custom permissions
14. **Optional Integrations**: Configurable features
15. **AI Features**: Chatbot, predictions

### Phase 16-19: Enterprise
16. **Security**: Compliance, encryption
17. **Performance**: Optimization, scalability
18. **Advanced Analytics**: BI platform
19. **Multi-Location**: Multiple properties/desks

## 🔐 Security Requirements

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encryption at rest and in transit
- **Compliance**: GDPR, PCI DSS for payments
- **Validation**: Input sanitization on all endpoints

## 🧪 Testing Strategy

### For Each Task:
1. **Unit Tests**: Jest for individual functions
2. **API Tests**: Postman/Newman for endpoints
3. **Integration Tests**: Full feature workflows
4. **Type Safety**: TypeScript compilation

### Test Commands:
```bash
npm run test:backend    # Backend tests
npm run test:frontend   # Frontend tests
npm run test:e2e       # Integration tests
newman run postman/[feature].json  # API tests
```

## 📊 Database Schema Overview

### Core Collections:
- **users**: Authentication, profiles, preferences
- **properties**: Hotels, buildings, rooms
- **bookings**: Reservations, status, payments
- **rates**: Pricing, restrictions, availability
- **payments**: Transactions, refunds, balances

### Relationships:
- User → Many Bookings
- Property → Many Rooms → Many Bookings
- Booking → One User, One Room, Many Payments

## 🚀 Development Guidelines

### File Size Limits:
- **Max 400 lines per file** (optimal for AI context)
- Split large features into multiple files
- Use service pattern for business logic

### Git Workflow:
- Feature branches: `feature/[feature-name]`
- Commit after each task completion
- Message format: `feat([feature]): [what was done]`

### Error Handling:
- All errors logged to PROBLEMS-LOG.md
- AI learns from errors for future features
- Max 3 auto-fix attempts before asking user

## 📱 Key Integrations

### Required:
- **Google OAuth**: Social login
- **Payment Gateways**: RazorPay, ICICI Eazypay
- **Email**: Amazon SES for notifications

### Optional (Hotel Configurable):
- **SMS**: Twilio, AWS SNS
- **WhatsApp**: Business API
- **Channel Managers**: Booking.com, Airbnb

## 🎨 UI/UX Principles

- **Mobile-First**: Responsive design
- **Accessibility**: WCAG 2.1 compliance  
- **Loading States**: Skeleton screens
- **Error Handling**: User-friendly messages
- **Success Feedback**: Clear confirmations

## 📈 Success Metrics

### Technical:
- 99.9% uptime
- < 2s page load time
- 100% test coverage
- Zero critical vulnerabilities

### Business:
- Booking conversion rate > 5%
- Customer satisfaction > 4.5/5
- Staff efficiency improvement > 30%
- Revenue increase > 20%

## 🔄 AI Development Rules

1. **Always read existing code** before creating new features
2. **Follow established patterns** exactly (tokens, API format)
3. **Test everything** before committing
4. **Update documentation** after each task
5. **One developer per feature** (no handoffs mid-feature)

## 🚨 Common Pitfalls to Avoid

1. **Wrong token storage** (access = sessionStorage, refresh = localStorage)
2. **Missing /api/v1 prefix** on endpoints
3. **Incorrect response format** (must match contract)
4. **Creating duplicate code** (check existing first)
5. **Skipping tests** (every task needs testing)

## 📞 Support & Resources

- **Documentation**: `/docs/features/` for all features
- **API Contracts**: `/shared/contracts/` for standards
- **Test Collections**: `/postman/` for API testing
- **Problem Log**: `PROBLEMS-LOG.md` for solutions

---

**Remember**: This is a living document. Update it when:
- New patterns are established
- Technology stack changes
- Major features are completed
- Integration points are added