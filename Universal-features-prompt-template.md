You are creating the 
[#### 1.1.1 User Registration
- Guest account creation with email, password, full name, mobile number
- **Google/Gmail social registration** (OAuth 2.0)
- **Social account linking** with existing accounts
- Email verification with secure tokens
- **Skip email verification for verified Google accounts**
- Password strength validation
- Terms and conditions acceptance
- Welcome email automation
- **Automatic profile picture from Google account**]
This system is designed for developers who rely 100% on AI. 
The developer will only copy-paste prompts and report results.

## 🎯 CRITICAL RULES
Analyze the contracts and properties and everything and based on that design the features tasks and in each tasks-prompt give instructions to the AI to read the related contract before writing code, give proper path in task-prompt.md file.

Read and analyse project progress file to check the all implimented features and existing files, and functions.
docs/features/project-progress.md 

now you have to impliment the feature new feature with existing features, so you have to check the existing files and functions and impliment the new feature.

### Step 0.5: Integration Analysis
Create `docs/features/[feature-name]/INTEGRATION-POINTS.md`:
```markdown
# Integration Points for [Feature Name]

## Dependencies on Existing Features:
- [ ] Uses authentication from user-login feature
- [ ] Token storage pattern: sessionStorage for access, localStorage for refresh
- [ ] API pattern: /api/v1/[resource]/[action]
- [ ] Response format: { success: true/false, data/error }

## Shared Code to Reuse:
- Authentication middleware: backend/src/middleware/auth.middleware.ts
- Response utilities: backend/src/utils/response.utils.ts
- Auth service patterns: frontend/src/services/auth.service.ts

## Potential Conflicts:
- None identified / List any conflicts
```

### Step 1: Create AI Memory System

A. Create `docs/features/[feature-name]/CURRENT-STATE.md`
```markdown
# [Feature Name] Current State

## Last Updated: [timestamp]

## Integration Dependencies:
<!-- List features this depends on -->
- Authentication: user-login feature
- User Model: from user-registration

## What Exists Now:
<!-- AI updates this after each task -->

## Testing Summary:
<!-- AI updates this after each task -->
- Tests Created: [count]/[total]
- Tests Passing: [count]/[total]  
- Backend Tests: ✅/❌
- Frontend Tests: ✅/❌
- Integration Tests: ✅/❌

## Problems Resolved:
<!-- AI updates this after each task -->
- Total Issues: [count]
- Recent Problems: [brief list]

## API Contracts:
<!-- Copy from API-CONTRACT.md once created -->

## Next Task: 
<!-- Current task from TASK-LIST.md -->

## Git Status:
<!-- Last commit hash and message -->

## Known Issues:
<!-- Any problems discovered -->
```

B. Create `docs/features/[feature-name]/API-CONTRACT.md`
```markdown
# [Feature Name] API Contract

## RULE: Frontend and Backend MUST follow this EXACTLY

### Base Configuration
- Base URL: http://localhost:5000
- API Prefix: /api/v1
- Auth Token Location: sessionStorage.getItem('airvik_access_token')
- Refresh Token Location: localStorage.getItem('airvik_refresh_token')

### [Endpoint Name]
**Backend MUST provide:**
- Method: POST
- URL: /api/v1/[resource]/[action]
- Headers: Authorization: Bearer [token]
- Request Body:
```json
{
  "field1": "string",
  "field2": "number"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "field1": "value1",
    "field2": 123
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR"
}
```

**Frontend MUST expect:**
- Exact same response structure
- No variations allowed
```

C. Create `docs/features/[feature-name]/TASK-LIST.md`
```markdown
# [Feature Name] Task List

## Pre-Implementation Checks:
- [ ] Read project-progress.md
- [ ] Check integration points
- [ ] Verify token storage patterns
- [ ] Confirm API patterns

## Backend Tasks (Do First):
- [ ] B1: Create/Extend MongoDB Schema
- [ ] B2: Create Service Layer  
- [ ] B3: Create Controller
- [ ] B4: Create Routes
- [ ] B5: Create Postman Tests

## Frontend Tasks (Do After Backend):
- [ ] F1: Create Types
- [ ] F2: Create API Service
- [ ] F3: Create UI Component
- [ ] F4: Create Page/Route
- [ ] F5: Connect to Backend

## Final Tasks:
- [ ] T1: Integration Testing
- [ ] T2: Update project-progress.md

## Current Task: Pre-Implementation Checks
```


D. Create docs/features/[feature-name]/PROBLEMS-LOG.md
```markdown
# [Feature Name] Problems Log

## Purpose: AI learns from errors to prevent repeating them

## Entry Format:
### Problem #[number] - [Date] - [Task]
**Problem:** [Detailed description]
**Error Message:** [Exact error text]
**Root Cause:** [Why it happened]
**Test Failed:** [Which test failed]

**Solution Applied:**
[Step-by-step fix]

**Test Result:** ✅ PASSED
**Prevention:** [How to avoid in future]
**Code Changes:** [Files modified]

---
```



### Step 2: Analyze Existing Project Structure
Look in /vikbooking folder and find files related to [FEATURE_NAME]:

List exact file paths
Note business logic patterns
Extract validation rules
Document user flows

**Additional Checks:**
- Token storage patterns in auth.service.ts
- API endpoint patterns in existing routes
- Response format patterns in controllers
- Middleware usage patterns

### Step 2.5: Setup Testing Requirements
**Testing Tools Required:**

**Backend Testing:**
- Jest for unit tests
- Supertest for API tests  
- Newman for Postman tests

**Frontend Testing:**
- Jest + React Testing Library
- TypeScript compiler for type tests
- Cypress for integration tests

**Test Commands:**
- Backend: `npm run test:backend`
- Frontend: `npm run test:frontend`
- Integration: `npm run test:integration`
- Newman: `newman run postman/[feature].postman_collection.json`

Step 3: Create Feature Documentation
A. Create docs/features/[feature-name]/spec.md
Include:

Feature Overview: Exactly what this ONE feature does (2-3 sentences)
VikBooking Analysis: Reference files and logic found
User Flow: Step-by-step how user uses this feature
API Endpoints: List each endpoint needed
Database Schema: MongoDB structure for THIS feature only
Validation Rules: All input validations needed
File Structure: Where each file will be created (max 400 lines each)

B. Create detailed docs/features/[feature-name]/api.md
This is CRITICAL - prevents API mismatches!
For EACH endpoint:
markdown## [Endpoint Name] - [HTTP Method] [URL]

### Contract Agreement:
Backend provides → Frontend expects → MUST MATCH EXACTLY

### Backend Implementation:
- Controller: `backend/src/controllers/[feature]/[action].controller.ts`
- Service: `backend/src/services/[feature]/[action].service.ts`
- Validation: `backend/src/validators/[feature]/[action].validator.ts`

### Frontend Usage:
- Service call: `frontend/src/services/[feature].service.ts`
- Component: `frontend/src/components/[feature]/[Component].tsx`

### Request:
```json
{
  "exact": "structure",
  "with": "examples"
}
Response Success (200):
json{
  "success": true,
  "data": {
    "exact": "structure",
    "that": "frontend expects"
  }
}
Response Error (400):
json{
  "success": false,
  "error": "Human readable message",
  "code": "ERROR_CODE"
}

### C. Create `docs/features/[feature-name]/tasks.md`
Structure for SINGLE developer doing everything:

```markdown
# [Feature Name] Tasks

## Developer: [Name] - Completes ALL tasks in order

## Backend Phase (Test each with Postman before moving on):

### Task B1: Create MongoDB Schema
**File to create**: `backend/src/models/[feature].model.ts` (max 400 lines)
**What it does**: Defines data structure
**Must include**: All fields from spec.md, indexes, timestamps
**Test**: Create test document in MongoDB directly
**Git**: Add, commit with descriptive message, push

### Task B2: Create Service Layer  
**Files to create**: 
- `backend/src/services/[feature]/[feature].service.ts` (max 400 lines)
**What it does**: All business logic for this feature
**Test**: Call functions from Node.js console
**Git**: Add, commit, push

### Task B3: Create Controller
**Files to create**:
- `backend/src/controllers/[feature]/[feature].controller.ts` (max 400 lines)
**What it does**: HTTP request handling for all endpoints
**Must match**: Exact format in API-CONTRACT.md
**Test**: Use curl or Postman
**Git**: Add, commit, push

### Task B4: Create Routes
**File to create**: `backend/src/routes/[feature].routes.ts` (max 200 lines)
**What it does**: Connect URLs to controllers
**Test**: Routes appear in Express route list
**Git**: Add, commit, push

### Task B5: Create Postman Collection
**File to create**: `postman/[feature].postman_collection.json`
**Must include**: Every endpoint with example data
**Test**: All requests return expected responses
**Testing method** design test for newman, test with newman in terminal, give proper instruction for that.
**Git**: Add, commit, push

## Frontend Phase (Only start after backend fully tested):

### Task F1: Create TypeScript Types
**File to create**: `frontend/src/types/[feature].types.ts` (max 200 lines)
**Must match**: Backend response structure EXACTLY
**Test**: No TypeScript errors
**Git**: Add, commit, push

### Task F2: Create API Service
**File to create**: `frontend/src/services/[feature].service.ts` (max 400 lines)
**Must match**: API-CONTRACT.md exactly
**Test**: Console log responses match expected structure
**Git**: Add, commit, push

### Task F3: Create UI Component
**File to create**: `frontend/src/components/[feature]/[Feature]Form.tsx` (max 400 lines)
**What it does**: User interface for the feature
**Test**: Component renders with mock data
**Git**: Add, commit, push

### Task F4: Create Page/Route
**File to create**: `frontend/src/app/[feature]/page.tsx` (max 200 lines)
**What it does**: Next.js page for the feature
**Test**: Can navigate to page
**Git**: Add, commit, push

### Task F5: Connect to Backend
**Files to modify**: Component and service files
**What it does**: Replace mock data with real API calls
**Test**: Full feature works end-to-end
**Git**: Add, commit, push with "integration complete" message
Step 4: Create Task Prompt Templates
CRITICAL: Every task prompt MUST follow this structure:
Create docs/features/[feature-name]/task-prompts.md:
markdown# Task Prompts for [Feature Name]

## HOW TO USE:
1. Copy each prompt exactly
2. Paste to AI in Windsurf Planning Mode
3. Report "done" or exact error message
4. AI will update state files automatically

## Backend Task B1: MongoDB Schema
MANDATORY FIRST STEPS:

Read and analyze: docs/features/[feature-name]/CURRENT-STATE.md
Read and analyze: docs/features/[feature-name]/API-CONTRACT.md
Read and analyze: docs/features/[feature-name]/SPEC.MD
Read and analyze: docs/features/[feature-name]/api.md
Read and analyze: docs/features/[feature-name]/tasks.md
Read and analyze: docs/features/[feature-name]/progress.md

List what you found to prove you read them

CONTEXT:
You are implementing [feature-name]. The developer using this is a beginner who only copies prompts.
YOUR TASK:
Create MongoDB schema for [feature-name]
FILE TO CREATE:

backend/src/models/[feature].model.ts (MAXIMUM 400 lines)

REQUIREMENTS FROM SPEC:
[Copy exact requirements from spec.md]
CODE STRUCTURE:

Use Mongoose with TypeScript
Include all fields from spec
Add proper indexes
Add timestamps: true
Export both schema and TypeScript interface

DO NOT:

Create any other files
Add fields not in spec

## TESTING PHASE (BEFORE GIT COMMIT):

### Step 1: Create Test File
CREATE: `backend/tests/models/[feature].model.test.js`
CONTENT: Test schema creation, validation, required fields, indexes, timestamps

### Step 2: Run Test
COMMAND: `npm run test:backend -- [feature].model.test.js`
EXPECTED: All schema tests pass

### Step 3: Handle Results
✅ PASS → Proceed to git commit
❌ FAIL → Follow Error Resolution Flow

## ERROR RESOLUTION FLOW:

### If Test Fails:
1. UPDATE PROBLEMS-LOG.md:
   - Add new problem entry with exact error message
   - Note which test failed

2. ANALYZE & FIX:
   - Identify root cause
   - Apply solution
   - Modify schema file

3. RE-TEST:
   - Run test again
   - Verify fix works

4. DOCUMENT SOLUTION:
   - Update PROBLEMS-LOG.md with solution
   - Mark as resolved

5. PROCEED TO GIT COMMIT

GIT OPERATIONS:
After test passes successfully:

Stage changes: git add backend/src/models/[feature].model.ts backend/tests/models/[feature].model.test.js
Commit with message: git commit -m "feat([feature-name]): add MongoDB schema with validation and indexes - [problem count] issues resolved"
Push to remote: git push origin feature/[feature-name]

AFTER COMPLETING:
Update docs/features/[feature-name]/CURRENT-STATE.md:

Add to "What Exists Now": ✅ backend/src/models/[feature].model.ts - MongoDB schema created
Add to "Testing Summary": ✅ Model tests created and passing
Add to "Problems Resolved": [Count and brief description of any issues fixed]
Update "Next Task": B2.

Update: docs/features/[feature-name]/progress.md.

Task Checklist, Completed Tasks after each task, Current State, Testing Status
Add to "Git Status": Last commit hash and message.


TEST YOUR WORK:
The developer will test by creating a document in MongoDB

## Backend Task B2: Service Layer
MANDATORY FIRST STEPS:

Read and analyze: docs/features/[feature-name]/CURRENT-STATE.md
Confirm what files exist from previous tasks
Read and analyze: docs/features/[feature-name]/API-CONTRACT.md
Read and analyze: docs/features/[feature-name]/SPEC.MD
Read and analyze: docs/features/[feature-name]/api.md
Read and analyze: docs/features/[feature-name]/tasks.md
Read and analyze: docs/features/[feature-name]/progress.md

YOUR TASK:
Create service layer with all business logic for [feature-name]
FILE TO CREATE:

backend/src/services/[feature]/[feature].service.ts (MAXIMUM 400 lines)

USE THE SCHEMA:
Import from: ../../models/[feature].model.ts (created in B1)
IMPLEMENT THESE METHODS:

create[Feature]: Create new record
get[Feature]ById: Get single record
getAll[Feature]s: Get all with pagination
update[Feature]: Update existing record
delete[Feature]: Soft delete record

MATCH API CONTRACT:
Return EXACT structure defined in API-CONTRACT.md for each method
ERROR HANDLING:
Throw errors with: { code: 'ERROR_CODE', message: 'Human readable' }

## TESTING PHASE (BEFORE GIT COMMIT):

### Step 1: Create Test File
CREATE: `backend/tests/services/[feature].service.test.js`
CONTENT: Test all service methods (create, get, getAll, update, delete)

### Step 2: Run Test
COMMAND: `npm run test:backend -- [feature].service.test.js`
EXPECTED: All service method tests pass

### Step 3: Handle Results
✅ PASS → Proceed to git commit
❌ FAIL → Follow Error Resolution Flow

## ERROR RESOLUTION FLOW:

### If Test Fails:
1. UPDATE PROBLEMS-LOG.md:
   - Add new problem entry with exact error message
   - Note which test failed

2. ANALYZE & FIX:
   - Identify root cause
   - Apply solution
   - Modify service file

3. RE-TEST:
   - Run test again
   - Verify fix works

4. DOCUMENT SOLUTION:
   - Update PROBLEMS-LOG.md with solution
   - Mark as resolved

5. PROCEED TO GIT COMMIT

GIT OPERATIONS:
After test passes successfully:

Stage changes: git add backend/src/services/[feature]/ backend/tests/services/[feature].service.test.js
Commit with message: git commit -m "feat([feature-name]): add service layer with business logic - [problem count] issues resolved"
Push to remote: git push origin feature/[feature-name]

AFTER COMPLETING:
Update docs/features/[feature-name]/CURRENT-STATE.md:

Add to "What Exists Now": ✅ backend/src/services/[feature]/[feature].service.ts - Service layer created
Add to "Testing Summary": ✅ Service tests created and passing
Add to "Problems Resolved": [Count and brief description of any issues fixed]
Update "Next Task": B3.

Update: docs/features/[feature-name]/progress.md.

Task Checklist, Completed Tasks after each task, Current State, Testing Status
Add to "Git Status": Last commit hash and message.

## Backend Task B3: Controller Layer
MANDATORY FIRST STEPS:

Read and analyze: docs/features/[feature-name]/CURRENT-STATE.md
Verify service layer exists from B2
Read and analyze: docs/features/[feature-name]/API-CONTRACT.md
Read and analyze: docs/features/[feature-name]/SPEC.MD
Read and analyze: docs/features/[feature-name]/api.md
Read and analyze: docs/features/[feature-name]/tasks.md
Read and analyze: docs/features/[feature-name]/progress.md

YOUR TASK:
Create controller to handle HTTP requests for [feature-name]
FILE TO CREATE:

backend/src/controllers/[feature]/[feature].controller.ts (MAXIMUM 400 lines)

USE THE SERVICE:
Import from: ../../services/[feature]/[feature].service.ts
IMPLEMENT ENDPOINTS:
Based on API-CONTRACT.md, create controller methods for each endpoint
RESPONSE FORMAT:
MUST match exactly what's in API-CONTRACT.md:

Success: { success: true, data: {...} }
Error: { success: false, error: "message", code: "ERROR_CODE" }

REQUEST VALIDATION:
Add basic validation for required fields before calling service

## TESTING PHASE (BEFORE GIT COMMIT):

### Step 1: Create Test File
CREATE: `backend/tests/controllers/[feature].controller.test.js`
CONTENT: Test HTTP responses, status codes, error handling

### Step 2: Run Test
COMMAND: `npm run test:backend -- [feature].controller.test.js`
EXPECTED: All controller endpoint tests pass

### Step 3: Handle Results
✅ PASS → Proceed to git commit
❌ FAIL → Follow Error Resolution Flow

## ERROR RESOLUTION FLOW:

### If Test Fails:
1. UPDATE PROBLEMS-LOG.md:
   - Add new problem entry with exact error message
   - Note which test failed

2. ANALYZE & FIX:
   - Identify root cause
   - Apply solution
   - Modify controller file

3. RE-TEST:
   - Run test again
   - Verify fix works

4. DOCUMENT SOLUTION:
   - Update PROBLEMS-LOG.md with solution
   - Mark as resolved

5. PROCEED TO GIT COMMIT

GIT OPERATIONS:
After test passes successfully:

Stage changes: git add backend/src/controllers/[feature]/ backend/tests/controllers/[feature].controller.test.js
Commit with message: git commit -m "feat([feature-name]): add controller with request handling - [problem count] issues resolved"
Push to remote: git push origin feature/[feature-name]

AFTER COMPLETING:
Update docs/features/[feature-name]/CURRENT-STATE.md:

Add to "What Exists Now": ✅ backend/src/controllers/[feature]/[feature].controller.ts - Controller created
Add to "Testing Summary": ✅ Controller tests created and passing
Add to "Problems Resolved": [Count and brief description of any issues fixed]
Update "Next Task": B4.

Update: docs/features/[feature-name]/progress.md.

Task Checklist, Completed Tasks after each task, Current State, Testing Status
Add to "Git Status": Last commit hash and message.

## Backend Task B4: Routes Configuration
MANDATORY FIRST STEPS:

Read and analyze: docs/features/[feature-name]/CURRENT-STATE.md
Verify controller exists from B3
Read and analyze: docs/features/[feature-name]/API-CONTRACT.md
Read and analyze: docs/features/[feature-name]/SPEC.MD
Read and analyze: docs/features/[feature-name]/api.md
Read and analyze: docs/features/[feature-name]/tasks.md
Read and analyze: docs/features/[feature-name]/progress.md
Check existing route files for patterns

YOUR TASK:
Create routes file to connect URLs to controller methods
FILE TO CREATE:

backend/src/routes/[feature].routes.ts (MAXIMUM 200 lines)

IMPORT CONTROLLER:
From: ../controllers/[feature]/[feature].controller.ts
DEFINE ROUTES:
Based on API-CONTRACT.md, create all routes:

POST /api/v1/[feature]/create
GET /api/v1/[feature]/:id
GET /api/v1/[feature]/list
PUT /api/v1/[feature]/:id
DELETE /api/v1/[feature]/:id

ADD MIDDLEWARE:
Include any authentication or validation middleware needed

## TESTING PHASE (BEFORE GIT COMMIT):

### Step 1: Create Test File
CREATE: `backend/tests/routes/[feature].routes.test.js`
CONTENT: Test route connections, middleware application, URL mappings

### Step 2: Run Test
COMMAND: `npm run test:backend -- [feature].routes.test.js`
EXPECTED: All route connection tests pass

### Step 3: Handle Results
✅ PASS → Proceed to git commit
❌ FAIL → Follow Error Resolution Flow

## ERROR RESOLUTION FLOW:

### If Test Fails:
1. UPDATE PROBLEMS-LOG.md:
   - Add new problem entry with exact error message
   - Note which test failed

2. ANALYZE & FIX:
   - Identify root cause
   - Apply solution
   - Modify routes file

3. RE-TEST:
   - Run test again
   - Verify fix works

4. DOCUMENT SOLUTION:
   - Update PROBLEMS-LOG.md with solution
   - Mark as resolved

5. PROCEED TO GIT COMMIT

GIT OPERATIONS:
After test passes successfully:

Stage changes: git add backend/src/routes/ backend/tests/routes/[feature].routes.test.js
Commit with message: git commit -m "feat([feature-name]): add API routes configuration - [problem count] issues resolved"
Push to remote: git push origin feature/[feature-name]

AFTER COMPLETING:
Update docs/features/[feature-name]/CURRENT-STATE.md:

Add to "What Exists Now": ✅ backend/src/routes/[feature].routes.ts - Routes created
Add to "Testing Summary": ✅ Route tests created and passing
Add to "Problems Resolved": [Count and brief description of any issues fixed]
Update "Next Task": B5.

Update: docs/features/[feature-name]/progress.md.

Task Checklist, Completed Tasks after each task, Current State, Testing Status
Add to "Git Status": Last commit hash and message.


## Backend Task B5: Postman Collection
MANDATORY FIRST STEPS:

Read and analyze: docs/features/[feature-name]/CURRENT-STATE.md
Read and analyze: docs/features/[feature-name]/API-CONTRACT.md
Read and analyze: docs/features/[feature-name]/SPEC.MD
Read and analyze: docs/features/[feature-name]/api.md
Read and analyze: docs/features/[feature-name]/tasks.md
Read and analyze: docs/features/[feature-name]/progress.md
Verify all backend files exist

YOUR TASK:
Create Postman collection for testing all endpoints, for testing with newman in terminal, so that we can run tests from terminal.


FILE TO CREATE:

postman/[feature-name].postman_collection.json

INCLUDE FOR EACH ENDPOINT:

Request name and description
Method and URL
Headers (Content-Type: application/json)
Body with example data from API-CONTRACT.md
Tests to verify response structure

EXAMPLE STRUCTURE:
{
"info": {
"name": "[Feature Name] API Tests",
"description": "Complete test suite for [feature-name]"
},
"item": [
{
"name": "Create [Feature]",
"request": {
"method": "POST",
"url": "{{baseUrl}}/api/v1/[feature]/create",
"body": {
"mode": "raw",
"raw": "{ "field1": "test" }"
}
},
"response": []
}
]
}
ADD TESTS:
For each request, add tests:

Status code is 200
Response has success: true
Response data matches expected structure

## TESTING PHASE (BEFORE GIT COMMIT):

### Step 1: Create Newman Test Runner
CREATE: `postman/tests/[feature].newman.test.json` 
CONTENT: Newman configuration for automated testing

### Step 2: Run Test
COMMAND: `newman run postman/[feature].postman_collection.json --environment postman/test-environment.json`
EXPECTED: All API endpoint tests pass

### Step 3: Handle Results
✅ PASS → Proceed to git commit
❌ FAIL → Follow Error Resolution Flow

## ERROR RESOLUTION FLOW:

### If Test Fails:
1. UPDATE PROBLEMS-LOG.md:
   - Add new problem entry with exact error message
   - Note which API test failed

2. ANALYZE & FIX:
   - Check API endpoint responses
   - Verify request/response format
   - Fix Postman collection

3. RE-TEST:
   - Run newman test again
   - Verify all endpoints work

4. DOCUMENT SOLUTION:
   - Update PROBLEMS-LOG.md with solution
   - Mark as resolved

5. PROCEED TO GIT COMMIT

GIT OPERATIONS:
After test passes successfully:

Stage changes: git add postman/
Commit with message: git commit -m "feat([feature-name]): add Postman test collection - [problem count] issues resolved"
Push to remote: git push origin feature/[feature-name]

AFTER COMPLETING:
Update docs/features/[feature-name]/CURRENT-STATE.md:

Add to "What Exists Now": ✅ postman/[feature].postman_collection.json - API tests created
Add to "Testing Summary": ✅ Postman/Newman tests created and passing
Add to "Problems Resolved": [Count and brief description of any issues fixed]
Mark "Backend Phase": COMPLETE

Update: docs/features/[feature-name]/progress.md.

Task Checklist, Completed Tasks after each task, Current State, Testing Status
Add to "Git Status": Last commit hash and message.


## Frontend Task F1: TypeScript Types
MANDATORY FIRST STEPS:

Read and analyze: docs/features/[feature-name]/CURRENT-STATE.md
Read and analyze: docs/features/[feature-name]/API-CONTRACT.md
Read and analyze: docs/features/[feature-name]/SPEC.MD
Read and analyze: docs/features/[feature-name]/api.md
Read and analyze: docs/features/[feature-name]/tasks.md
Read and analyze: docs/features/[feature-name]/progress.md
Verify backend is complete and tested

YOUR TASK:
Create TypeScript types matching backend API exactly
FILE TO CREATE:

frontend/src/types/[feature].types.ts (MAXIMUM 200 lines)

TYPES TO DEFINE:
Based on API-CONTRACT.md, create interfaces for:

Request types (Create[Feature]Request, Update[Feature]Request)
Response types ([Feature]Response, [Feature]ListResponse)
Data model ([Feature], [Feature]Details)
Error types (ApiError)

MUST MATCH:
Types must match backend responses EXACTLY as shown in API-CONTRACT.md
EXPORT ALL TYPES:
Make sure all interfaces are exported for use in components

## TESTING PHASE (BEFORE GIT COMMIT):

### Step 1: Create Test File
CREATE: `frontend/tests/types/[feature].types.test.ts`
CONTENT: Test type compilation, interface validation, import/export

### Step 2: Run Test
COMMAND: `npm run test:frontend -- [feature].types.test.ts`
EXPECTED: All TypeScript compilation tests pass

### Step 3: Handle Results
✅ PASS → Proceed to git commit
❌ FAIL → Follow Error Resolution Flow

## ERROR RESOLUTION FLOW:

### If Test Fails:
1. UPDATE PROBLEMS-LOG.md:
   - Add new problem entry with exact error message
   - Note which type compilation failed

2. ANALYZE & FIX:
   - Check TypeScript errors
   - Fix type definitions
   - Verify exports

3. RE-TEST:
   - Run test again
   - Verify types compile correctly

4. DOCUMENT SOLUTION:
   - Update PROBLEMS-LOG.md with solution
   - Mark as resolved

5. PROCEED TO GIT COMMIT

GIT OPERATIONS:
After test passes successfully:

Stage changes: git add frontend/src/types/ frontend/tests/types/[feature].types.test.ts
Commit with message: git commit -m "feat([feature-name]): add TypeScript type definitions - [problem count] issues resolved"
Push to remote: git push origin feature/[feature-name]

AFTER COMPLETING:
Update docs/features/[feature-name]/CURRENT-STATE.md:

Add to "What Exists Now": ✅ frontend/src/types/[feature].types.ts - TypeScript types created
Add to "Testing Summary": ✅ Type tests created and passing
Add to "Problems Resolved": [Count and brief description of any issues fixed]
Update "Next Task": F2.

Update: docs/features/[feature-name]/progress.md.

Task Checklist, Completed Tasks after each task, Current State, Testing Status
Add to "Git Status": Last commit hash and message.

## Frontend Task F2: API Service
MANDATORY FIRST STEPS:

Read and analyze: docs/features/[feature-name]/CURRENT-STATE.md
Read and analyze: docs/features/[feature-name]/API-CONTRACT.md
Read and analyze: docs/features/[feature-name]/SPEC.MD
Read and analyze: docs/features/[feature-name]/api.md
Read and analyze: docs/features/[feature-name]/tasks.md
Read and analyze: docs/features/[feature-name]/progress.md
Verify types exist from F1

YOUR TASK:
Create API service to communicate with backend
FILE TO CREATE:

frontend/src/services/[feature].service.ts (MAXIMUM 400 lines)

IMPORT TYPES:
From: ../types/[feature].types.ts
IMPLEMENT METHODS:
For each endpoint in API-CONTRACT.md:

create[Feature](data: Create[Feature]Request): Promise<[Feature]Response>
get[Feature](id: string): Promise<[Feature]Response>
getAll[Feature]s(): Promise<[Feature]ListResponse>
update[Feature](id: string, data: Update[Feature]Request): Promise<[Feature]Response>
delete[Feature](id: string): Promise<void>

API CALLS:
Use fetch or axios to call backend endpoints
Include proper error handling
Return exact types as defined

## TESTING PHASE (BEFORE GIT COMMIT):

### Step 1: Create Test File
CREATE: `frontend/tests/services/[feature].service.test.ts`
CONTENT: Test API service methods with mocked responses

### Step 2: Run Test
COMMAND: `npm run test:frontend -- [feature].service.test.ts`
EXPECTED: All API service method tests pass

### Step 3: Handle Results
✅ PASS → Proceed to git commit
❌ FAIL → Follow Error Resolution Flow

## ERROR RESOLUTION FLOW:

### If Test Fails:
1. UPDATE PROBLEMS-LOG.md:
   - Add new problem entry with exact error message
   - Note which API service method failed

2. ANALYZE & FIX:
   - Check API call implementation
   - Verify error handling
   - Fix service methods

3. RE-TEST:
   - Run test again
   - Verify service works correctly

4. DOCUMENT SOLUTION:
   - Update PROBLEMS-LOG.md with solution
   - Mark as resolved

5. PROCEED TO GIT COMMIT

GIT OPERATIONS:
After test passes successfully:

Stage changes: git add frontend/src/services/ frontend/tests/services/[feature].service.test.ts
Commit with message: git commit -m "feat([feature-name]): add frontend API service - [problem count] issues resolved"
Push to remote: git push origin feature/[feature-name]

AFTER COMPLETING:
Update docs/features/[feature-name]/CURRENT-STATE.md:

Add to "What Exists Now": ✅ frontend/src/services/[feature].service.ts - API service created
Add to "Testing Summary": ✅ API service tests created and passing
Add to "Problems Resolved": [Count and brief description of any issues fixed]
Update "Next Task": F3.

Update: docs/features/[feature-name]/progress.md.

Task Checklist, Completed Tasks after each task, Current State, Testing Status
Add to "Git Status": Last commit hash and message.

## Frontend Task F3: UI Component
MANDATORY FIRST STEPS:

Read and analyze: docs/features/[feature-name]/CURRENT-STATE.md
Read and analyze: docs/features/[feature-name]/API-CONTRACT.md
Read and analyze: docs/features/[feature-name]/SPEC.MD
Read and analyze: docs/features/[feature-name]/api.md
Read and analyze: docs/features/[feature-name]/tasks.md
Read and analyze: docs/features/[feature-name]/progress.md

Verify API service exists from F2
Check UI/UX requirements from spec.md

YOUR TASK:
Create main UI component for [feature-name]
FILE TO CREATE:

frontend/src/components/[feature]/[Feature]Form.tsx (MAXIMUM 400 lines)

USE MOCK DATA FIRST:
Create component with hardcoded data to test UI
Don't connect to API yet (that's F5)
COMPONENT FEATURES:

Form fields for all inputs from spec
Validation on submit
Loading states
Error display
Success feedback
Responsive design with Tailwind CSS

COMPONENT STRUCTURE:

Use React hooks (useState, useEffect)
Separate concerns (UI vs logic)
Make it reusable

## TESTING PHASE (BEFORE GIT COMMIT):

### Step 1: Create Test File
CREATE: `frontend/tests/components/[feature]Form.test.tsx`
CONTENT: Test component rendering, form validation, user interactions

### Step 2: Run Test
COMMAND: `npm run test:frontend -- [feature]Form.test.tsx`
EXPECTED: All component rendering and interaction tests pass

### Step 3: Handle Results
✅ PASS → Proceed to git commit
❌ FAIL → Follow Error Resolution Flow

## ERROR RESOLUTION FLOW:

### If Test Fails:
1. UPDATE PROBLEMS-LOG.md:
   - Add new problem entry with exact error message
   - Note which component test failed

2. ANALYZE & FIX:
   - Check component implementation
   - Fix rendering issues
   - Verify props and state handling

3. RE-TEST:
   - Run test again
   - Verify component renders correctly

4. DOCUMENT SOLUTION:
   - Update PROBLEMS-LOG.md with solution
   - Mark as resolved

5. PROCEED TO GIT COMMIT

GIT OPERATIONS:
After test passes successfully:

Stage changes: git add frontend/src/components/[feature]/ frontend/tests/components/[feature]Form.test.tsx
Commit with message: git commit -m "feat([feature-name]): add UI component with form - [problem count] issues resolved"
Push to remote: git push origin feature/[feature-name]

AFTER COMPLETING:
Update docs/features/[feature-name]/CURRENT-STATE.md:

Add to "What Exists Now": ✅ frontend/src/components/[feature]/[Feature]Form.tsx - UI component created
Add to "Testing Summary": ✅ Component tests created and passing
Add to "Problems Resolved": [Count and brief description of any issues fixed]
Update "Next Task": F4.

Update: docs/features/[feature-name]/progress.md.

Task Checklist, Completed Tasks after each task, Current State, Testing Status
Add to "Git Status": Last commit hash and message.


## Frontend Task F4: Page/Route
MANDATORY FIRST STEPS:

Read and analyze: docs/features/[feature-name]/CURRENT-STATE.md
Read and analyze: docs/features/[feature-name]/API-CONTRACT.md
Read and analyze: docs/features/[feature-name]/SPEC.MD
Read and analyze: docs/features/[feature-name]/api.md
Read and analyze: docs/features/[feature-name]/tasks.md
Read and analyze: docs/features/[feature-name]/progress.md



Verify component exists from F3
Check Next.js app structure

YOUR TASK:
Create Next.js page for the feature
FILE TO CREATE:

frontend/src/app/[feature]/page.tsx (MAXIMUM 200 lines)

PAGE CONTENT:

Import and use the component from F3
Add page title and metadata
Include any layout requirements
Add navigation breadcrumbs if needed

ROUTE SETUP:
The file location creates the route automatically:

File: app/[feature]/page.tsx
Route: /[feature]

## TESTING PHASE (BEFORE GIT COMMIT):

### Step 1: Create Test File
CREATE: `frontend/tests/pages/[feature].page.test.tsx`
CONTENT: Test page rendering, navigation, metadata

### Step 2: Run Test
COMMAND: `npm run test:frontend -- [feature].page.test.tsx`
EXPECTED: All page rendering and routing tests pass

### Step 3: Handle Results
✅ PASS → Proceed to git commit
❌ FAIL → Follow Error Resolution Flow

## ERROR RESOLUTION FLOW:

### If Test Fails:
1. UPDATE PROBLEMS-LOG.md:
   - Add new problem entry with exact error message
   - Note which page test failed

2. ANALYZE & FIX:
   - Check page implementation
   - Fix routing issues
   - Verify component imports

3. RE-TEST:
   - Run test again
   - Verify page renders and routes correctly

4. DOCUMENT SOLUTION:
   - Update PROBLEMS-LOG.md with solution
   - Mark as resolved

5. PROCEED TO GIT COMMIT

GIT OPERATIONS:
After test passes successfully:

Stage changes: git add frontend/src/app/[feature]/ frontend/tests/pages/[feature].page.test.tsx
Commit with message: git commit -m "feat([feature-name]): add Next.js page and route - [problem count] issues resolved"
Push to remote: git push origin feature/[feature-name]

AFTER COMPLETING:
Update docs/features/[feature-name]/CURRENT-STATE.md:

Add to "What Exists Now": ✅ frontend/src/app/[feature]/page.tsx - Next.js page created
Add to "Testing Summary": ✅ Page tests created and passing
Add to "Problems Resolved": [Count and brief description of any issues fixed]
Update "Next Task": F5.

Update: docs/features/[feature-name]/progress.md.

Task Checklist, Completed Tasks after each task, Current State, Testing Status
Add to "Git Status": Last commit hash and message.


## Frontend Task F5: Backend Integration
MANDATORY FIRST STEPS:

Read and analyze: docs/features/[feature-name]/CURRENT-STATE.md
Read and analyze: docs/features/[feature-name]/API-CONTRACT.md
Read and analyze: docs/features/[feature-name]/SPEC.MD
Read and analyze: docs/features/[feature-name]/api.md
Read and analyze: docs/features/[feature-name]/tasks.md
Read and analyze: docs/features/[feature-name]/progress.md
Verify all frontend files exist
Test backend is working with Postman

YOUR TASK:
Connect frontend component to real backend API
FILES TO MODIFY:

frontend/src/components/[feature]/[Feature]Form.tsx

CHANGES TO MAKE:

Import API service from F2
Replace mock data with real API calls
Add proper loading states during API calls
Handle API errors and display to user
Add success handling (redirect or message)

TEST INTEGRATION:

Create operation works
Read operation shows data
Update operation saves changes
Delete operation removes item
Error cases show proper messages

## TESTING PHASE (BEFORE GIT COMMIT):

### Step 1: Create Test File
CREATE: `frontend/tests/integration/[feature].integration.test.ts`
CONTENT: Test full end-to-end feature functionality

### Step 2: Run Test
COMMAND: `npm run test:integration -- [feature].integration.test.ts`
EXPECTED: All integration tests pass

### Step 3: Handle Results
✅ PASS → Proceed to git commit
❌ FAIL → Follow Error Resolution Flow

## ERROR RESOLUTION FLOW:

### If Test Fails:
1. UPDATE PROBLEMS-LOG.md:
   - Add new problem entry with exact error message
   - Note which integration test failed

2. ANALYZE & FIX:
   - Check API integration
   - Verify backend connectivity
   - Fix component-service integration

3. RE-TEST:
   - Run test again
   - Verify full functionality works

4. DOCUMENT SOLUTION:
   - Update PROBLEMS-LOG.md with solution
   - Mark as resolved

5. PROCEED TO GIT COMMIT

GIT OPERATIONS:
After test passes successfully:

Stage changes: git add frontend/src/components/[feature]/ frontend/tests/integration/[feature].integration.test.ts
Commit with message: git commit -m "feat([feature-name]): complete backend integration - [problem count] issues resolved"
Push to remote: git push origin feature/[feature-name]

AFTER COMPLETING:
Update docs/features/[feature-name]/CURRENT-STATE.md:

Add to "What Exists Now": ✅ FEATURE COMPLETE - All components integrated
Add to "Testing Summary": ✅ Integration tests created and passing
Add to "Problems Resolved": [Total count and summary of all issues fixed]
Mark feature as COMPLETE

Update: docs/features/[feature-name]/progress.md.

Task Checklist, Completed Tasks after each task, Current State, Testing Status
Add to "Git Status": Last commit hash and message.

## FINAL TESTING SUMMARY:
- Total Tests Created: [count]
- Total Tests Passing: [count]
- Total Problems Resolved: [count]
- Feature Health: ✅ ALL GREEN

List all files created
Note any issues for PROBLEMS-LOG.md


[Continue with error handling prompt...]
Step 5: Initialize Tracking
Create docs/features/[feature-name]/progress.md:
markdown# [Feature Name] Progress

## Feature: [feature-name]
## Developer: [name]  
## Status: Not Started
## Branch: feature/[feature-name]

## Task Checklist:
### Backend:
- [ ] B1: MongoDB Schema
- [ ] B2: Service Layer
- [ ] B3: Controller  
- [ ] B4: Routes
- [ ] B5: Postman Tests

### Frontend:
- [ ] F1: TypeScript Types
- [ ] F2: API Service
- [ ] F3: UI Component
- [ ] F4: Page/Route
- [ ] F5: Backend Integration

## Completed Tasks:
<!-- AI updates this after each task -->

## Current State:
See CURRENT-STATE.md for details
Step 6: Generate Summary
Display:
✅ Feature "[feature-name]" created with AI MEMORY SYSTEM!

📁 AI Memory Files Created:
- CURRENT-STATE.md - AI tracks what exists (CRITICAL!)
- API-CONTRACT.md - Prevents API mismatches  
- TASK-LIST.md - Order of tasks
- PROBLEMS-LOG.md - AI learns from errors

📁 Documentation Created:
- spec.md - Feature specification
- api.md - Detailed API contracts
- tasks.md - All tasks for single developer
- task-prompts.md - Copy-paste prompts for EVERY task
- progress.md - Progress tracking

🚀 Developer Instructions:
1. You are assigned to complete this ENTIRE feature
2. Start with Task B1 - copy prompt from task-prompts.md
3. Complete ALL backend tasks first (B1-B5)
4. Test backend thoroughly with Postman
5. Then do ALL frontend tasks (F1-F5)
6. AI will track everything in CURRENT-STATE.md

⚠️ CRITICAL RULES:
- One developer does entire feature (no handoffs)
- Backend MUST be complete before starting frontend
- Every task prompt tells AI to read CURRENT-STATE.md first
- Maximum 400 lines per file (optimal for AI)
- Follow API-CONTRACT.md exactly (no variations)
- Every task includes git add, commit, push

🔄 If you get errors:
1. Copy exact error message
2. Use error fix prompt from task-prompts.md
3. AI will read PROBLEMS-LOG.md and fix itself

📊 Git Workflow:
- Every task creates a separate commit
- Commit messages describe what was done
- Push after every task to keep team updated
- Other developers can see progress in real-time

### Step 7: Create Integration Test Plan
Create `docs/features/[feature-name]/INTEGRATION-TESTS.md`:
```markdown
# Integration Test Plan

## Token Storage Tests:
- [ ] Access token retrieved from sessionStorage
- [ ] Refresh token retrieved from localStorage
- [ ] Tokens included in API headers

## API Integration Tests:
- [ ] Endpoints use /api/v1 prefix
- [ ] Response format matches contract
- [ ] Error handling consistent

## Feature Integration Tests:
- [ ] Works with existing auth system
- [ ] Permissions checked properly
- [ ] Data relationships maintained
```

### Step 8: Project Progress Update Instructions
Create `docs/features/[feature-name]/PROJECT-UPDATE.md`:
```markdown
# Project Progress Update Instructions

After feature is complete, add to docs/features/project-progress.md:

### [Feature Name]
**Status:** ✅ Completed  
**Developer:** [Name]  
**Branch:** feature/[feature-name]  
**Completed:** [Date]

**Description:** [Brief description of what the feature does]

**Files Created:**

*Backend:*
- List all backend files created

*Frontend:*
- List all frontend files created

*Shared:*
- List any shared/contract files

**Key Features Implemented:**
- List main functionality added

**Integration Points:**
- How it integrates with existing features

**Shared Code Created:**
- Reusable components/utilities created

**Lessons Learned:**
- Any important discoveries or patterns
```

## Task Prompt Updates

### Add to EVERY Task Prompt:

**MANDATORY INTEGRATION CHECKS:**
1. Read docs/features/[feature-name]/INTEGRATION-POINTS.md
2. Verify token storage: sessionStorage for access, localStorage for refresh
3. Verify API pattern: /api/v1/[resource]/[action]
4. Check response format matches existing patterns

### Add to Final Task (After F5):

## Final Task T1: Integration Testing
```
YOUR TASK:
Run integration tests to ensure feature works with existing system

TESTS TO RUN:
1. Login with existing user
2. Navigate to new feature
3. Verify tokens are found correctly
4. Verify API calls succeed
5. Test error scenarios

FIXES IF NEEDED:
- Token issues: Check sessionStorage/localStorage keys
- API 404: Ensure /api/v1 prefix is used
- Auth errors: Verify middleware is applied
```

## Final Task T2: Update Project Documentation
```
YOUR TASK:
Update the main project progress file

FILE TO UPDATE:
docs/features/project-progress.md

WHAT TO ADD:
Copy content from PROJECT-UPDATE.md and add to the file

GIT OPERATIONS:
git add docs/features/project-progress.md
git commit -m "docs: add [feature-name] to completed features"
git push origin feature/[feature-name]
```