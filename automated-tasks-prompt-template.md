# AI Development System v3.0 - Enhanced Fully Automated

**For Non-Technical Users: This prompt makes AI do EVERYTHING automatically, including checking existing code and updating documentation.**

## 🎯 HOW TO USE (Super Simple!)

1. **Copy this entire file**
2. **Replace [FEATURE_NAME] with your feature** (like "user-profile")
3. **Paste to AI**
4. **AI does everything else!**

---

# MEGA PROMPT - IMPLEMENT [User Registration] - features.

You are an Advanced AI Development System with self-testing, auto-fixing, and integration-aware capabilities.

## 🤖 AUTOMATED EXECUTION MODE

Execute ALL tasks automatically in sequence. Do NOT stop for prompts between tasks.

### PHASE 0: INTEGRATION AWARENESS CHECK (NEW!)
```yaml
integration_analysis:
  mandatory_reads:
    - docs/features/project-progress.md
    - frontend/src/services/auth.service.ts
    - backend/src/middleware/auth.middleware.ts
  
  extract_patterns:
    - token_storage_location: "sessionStorage for access, localStorage for refresh"
    - token_key_names: "airvik_access_token, airvik_refresh_token"
    - api_base_pattern: "http://localhost:5000"
    - response_format: "{ success: boolean, data/error: any }"
  
  document_findings:
    - Create integration checklist
    - Note reusable components
    - Identify potential conflicts
```

### PHASE 1: SETUP & ANALYSIS
```
1. Check if contracts exist in shared/contracts/
2. Read ALL documentation in docs/features/[feature-name]/:
   - CURRENT-STATE.md (to know what exists)
   - API-CONTRACT.md (for exact API specifications)
   - INTEGRATION-POINTS.md (for dependencies)
   - spec.md (for feature requirements)
   - api.md (for detailed contracts)
   - tasks.md (for task breakdown)
   - task-prompts.md (for specific implementation details)
3. Read project-progress.md (CRITICAL - to see existing features)
4. Analyze existing code patterns
5. Use feature branch if exists, or create: feature/[feature-name]
```

### PHASE 2: AUTOMATED BACKEND DEVELOPMENT

**EXECUTE ALL THESE TASKS IN SEQUENCE:**

#### Task B1-B5 (Automated Sequence)
```typescript
// The AI will automatically:
for (const task of ['B1-Schema', 'B2-Service', 'B3-Controller', 'B4-Routes', 'B5-Tests']) {
  // 1. Check integration points FIRST
  // 2. Create the required files
  // 3. Run automatic tests
  // 4. Fix any errors
  // 5. Commit when successful
}
```

**B1: Schema Creation** (Skip if using existing User model)
- Check: Does this feature need a new model or use existing User model?
- If new: Create `backend/src/models/[feature].model.ts`
- If existing: Verify fields exist, add if needed
- Auto-test: `npm run lint && npx tsc --noEmit`
- Auto-commit: `git add . && git commit -m "feat: add [feature] model"` (if created)

**B2: Service Layer**
- Create: `backend/src/services/[feature]/[feature].service.ts`
- CRITICAL: Import ServiceResponse from existing implementation
- Follow exact methods from documentation
- Check auth service for token patterns
- Auto-test: TypeScript compilation
- Auto-commit: `git add . && git commit -m "feat: add [feature] service"`

**B3: Controller**
- Create: `backend/src/controllers/[feature]/[feature].controller.ts`
- CRITICAL: Use same response format as auth controllers
- Import auth middleware correctly
- Auto-test: Check response formats
- Auto-commit: `git add . && git commit -m "feat: add [feature] controller"`

**B4: Routes**
- Create: `backend/src/routes/[feature].routes.ts`
- Update: `backend/src/server.ts` to include routes
- CRITICAL: Use /api/v1 prefix
- Auto-test: Verify routes are registered
- Auto-commit: `git add . && git commit -m "feat: add [feature] routes"`

**B5: Postman Tests**
- Create: `postman/[feature].postman_collection.json`
- Include auth token in headers
- Auto-test: `newman run postman/[feature].postman_collection.json`
- Auto-commit: `git add . && git commit -m "feat: add [feature] tests"`

### PHASE 3: AUTOMATED FRONTEND DEVELOPMENT

**PARALLEL EXECUTION** (Do F1 & F2 together, then F3 & F4 together, then F5)

#### Tasks F1-F5 (Automated Sequence)
```typescript
// Execute in parallel where possible
await Promise.all([
  createTypes(),     // F1
  createService()    // F2
]);
await Promise.all([
  createComponent(), // F3
  createPage()       // F4  
]);
await integrateFrontendBackend(); // F5
```

**CRITICAL for F2: API Service**
```typescript
// MUST check auth.service.ts for patterns:
const tokenStorage = {
  access: 'sessionStorage.getItem("airvik_access_token")',
  refresh: 'localStorage.getItem("airvik_refresh_token")'
};
const apiBaseUrl = 'http://localhost:5000';
const apiPrefix = '/api/v1';
```

### PHASE 4: AUTOMATIC TESTING & VALIDATION

```yaml
continuous_validation:
  after_each_file:
    - lint_check: "npm run lint || true"
    - type_check: "npx tsc --noEmit"
    - integration_check: "verify token storage matches auth"
    - api_check: "verify endpoints use /api/v1"
    - contract_validation: "validate against API-CONTRACT.md"
  
  if_any_fails:
    - analyze_error: true
    - check_integration_points: true
    - apply_fix_pattern: true
    - retry_up_to: 3
    - if_still_fails: "log to PROBLEMS-LOG.md"
```

### PHASE 5: ENHANCED ERROR PATTERN RECOGNITION

```typescript
// Common errors and automatic fixes
const ERROR_PATTERNS = {
  "Cannot find module '../auth/user-auth.service'": {
    fix: "Check path and adjust imports based on actual file location",
    validate: "Import resolves correctly"
  },
  "Property 'x' does not exist": {
    fix: "Add missing property to interface/type definition",
    validate: "TypeScript compiles without errors"
  },
  "Test failed: Expected 200 but got 404": {
    fix: "Ensure route is registered in server.ts with /api/v1 prefix",
    validate: "Route appears in Express route list"
  },
  "Validation error": {
    fix: "Match validation rules exactly from contract",
    validate: "Request passes validation"
  },
  // NEW INTEGRATION PATTERNS
  "Token not found in localStorage": {
    fix: "Use sessionStorage for access token: sessionStorage.getItem('airvik_access_token')",
    validate: "Token retrieved successfully"
  },
  "404 on API call": {
    fix: "Ensure full path: http://localhost:5000/api/v1/[endpoint]",
    validate: "API responds with success"
  },
  "Unauthorized error": {
    fix: "Include Authorization header: Bearer ${token}",
    validate: "Request authorized successfully"
  }
};
```

### PHASE 6: CONTRACT VALIDATION

```typescript
// After creating each endpoint, validate:
function validateContract(endpoint: string, implementation: any) {
  // 1. Check request format matches contract
  // 2. Check response format matches contract
  // 3. Check error codes match contract
  // 4. Check HTTP methods match contract
  // 5. Check token usage matches auth pattern
  // 6. Check API prefix is /api/v1
  
  if (!valid) {
    autoFix();
    retest();
  }
}
```

### PHASE 7: INTEGRATION TESTING (NEW!)

```yaml
integration_testing:
  backend_tests:
    - with_auth: "Test endpoints with valid tokens"
    - without_auth: "Test endpoints return 401 without tokens"
    - with_invalid_token: "Test endpoints handle invalid tokens"
  
  frontend_tests:
    - token_retrieval: "Verify tokens found in correct storage"
    - api_calls: "Verify API calls include /api/v1 prefix"
    - error_handling: "Verify errors displayed properly"
  
  end_to_end:
    - login_flow: "Login and access new feature"
    - data_flow: "Create, read, update, delete operations"
    - error_scenarios: "Test all error cases"
```

### PHASE 8: AUTO-COMMIT STRATEGY

```bash
# After EVERY successful task:
git add .
git commit -m "feat([feature]): [specific task completed]"
git push origin feature/[feature-name]

# Commit messages:
# - "feat(profile): add MongoDB schema with validation"
# - "feat(profile): add service layer with business logic"
# - "feat(profile): add controller with request handling"
# - "feat(profile): integrate with auth middleware"
# - "feat(profile): add frontend with proper token handling"
# etc.
```

### PHASE 9: PROJECT DOCUMENTATION UPDATE (NEW!)

```yaml
update_project_docs:
  after_all_tests_pass:
    - file: "docs/features/project-progress.md"
    - find_section: "## Completed Features"
    - add_new_feature:
        status: "✅ Completed"
        developer: "AI Assistant"
        branch: "feature/[feature-name]"
        completed: "[current-date]"
        description: "[what feature does]"
        files_created: "[list all files]"
        key_features: "[list main functionality]"
        integration_points: "[how it connects to existing features]"
        shared_code: "[reusable components created]"
    - commit: "docs: add [feature] to completed features"
```

## 🛡️ SELF-HEALING MECHANISMS

```typescript
// If any step fails:
async function selfHeal(error: Error, attempt: number = 1) {
  if (attempt > 3) {
    logToProblemLog(error);
    return false;
  }
  
  // Try fixes in order:
  const fixes = [
    () => checkIntegrationPoints(), // NEW: Check token/API patterns first
    () => checkImportPaths(),
    () => installMissingDependencies(),
    () => fixTypeScriptErrors(),
    () => adjustToExistingPatterns(),
    () => regenerateWithDifferentApproach()
  ];
  
  for (const fix of fixes) {
    if (await fix()) {
      return rerunTask();
    }
  }
  
  return selfHeal(error, attempt + 1);
}
```

## 📊 PROGRESS TRACKING (Automatic)

The system will automatically update these files:
- `CURRENT-STATE.md` - After each task
- `progress.md` - Task completion status
- `PROBLEMS-LOG.md` - Any errors and solutions
- `project-progress.md` - FINAL update when complete (NEW!)

## 🎯 FINAL VALIDATION

Before marking complete:
1. Run all backend tests
2. Run all frontend tests
3. Test full integration with login
4. Verify tokens work correctly
5. Generate screenshots
6. Update project-progress.md
7. Create pull request

## 💬 WHAT YOU'LL SEE

```
Starting implementation of [feature]...
Analyzing existing features in project-progress.md...
✓ Found authentication patterns
✓ Token storage: sessionStorage/localStorage confirmed
✓ API pattern: /api/v1 confirmed
✓ Documentation analyzed
✓ B1: Using existing User model (no new schema needed)
✓ B2: Service created with proper imports
✓ B3: Controller created with auth middleware
✓ B4: Routes created with /api/v1 prefix
✓ B5: Postman tests passing
✓ F1 & F2: Types and service created (parallel)
✓ F3 & F4: Components and pages created (parallel)
✓ F5: Frontend-backend integration complete
✓ Integration tests passing
✓ Project documentation updated
✓ All tests passing
✓ Screenshots generated

Feature implementation complete!
Branch: feature/[feature]
Commits: 12 (all pushed)
Status: Ready for review
Project docs: Updated
```

## 🚨 ONLY ASK USER WHEN:
1. A visual/UX decision is needed
2. After 3 failed auto-fix attempts
3. When feature is complete for approval

---

**START AUTOMATED IMPLEMENTATION NOW**