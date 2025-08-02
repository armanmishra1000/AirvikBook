# AirVikBook - Hotel Management System

A modern, comprehensive hotel management system built with React/Next.js and Node.js, developed using 100% AI-assisted development.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend will run on http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on http://localhost:3000

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