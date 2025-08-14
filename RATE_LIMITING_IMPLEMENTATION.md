# Rate Limiting Implementation

## Overview

This document explains how rate limiting is implemented in the AirVikBook application and how it's automatically disabled in development mode.

## Environment-Based Rate Limiting

The application automatically detects the environment and applies rate limiting accordingly:

### Development Mode (`NODE_ENV=development`)
- **Rate limiting is completely disabled**
- **Console message**: "🚀 Rate limiting DISABLED for development environment"
- **Health check shows**: `rateLimiting: 'DISABLED'`
- **All endpoints work without restrictions**

### Production/Staging Mode (`NODE_ENV=production` or `NODE_ENV=staging`)
- **Full rate limiting enabled**
- **Console message**: "🔒 Rate limiting enabled for production/staging environment"
- **All security measures active**

## Implementation Details

### Server-Level Rate Limiting

In `server.ts`, rate limiting is conditionally applied:

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

if (!isDevelopment) {
  // Apply all rate limiters
  app.use(globalLimiter);
  app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
  // ... other routes with rate limiting
} else {
  // No rate limiting applied
  app.use(`${API_PREFIX}/auth`, authRoutes);
  // ... other routes without rate limiting
}
```

### Controller-Level Rate Limiting

Each controller has rate limiters with `skip` functions:

```typescript
static registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { /* ... */ },
  skip: (_req: Request) => {
    return process.env.NODE_ENV === 'development';
  }
});
```

### Middleware-Level Rate Limiting

The auth middleware also respects the development environment:

```typescript
static createUserRateLimit(options) {
  return async (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      return next(); // Skip rate limiting
    }
    // ... rate limiting logic
  };
}
```

## Rate Limits (Production Only)

When rate limiting is enabled, the following limits apply:

| Endpoint Category | Limit | Window |
|------------------|-------|---------|
| **Global API** | 100 requests | 15 minutes |
| **Authentication** | 5 attempts | 15 minutes |
| **Registration** | 3 attempts | 1 hour |
| **Email** | 10 requests | 1 hour |
| **Health Check** | 10 requests | 1 minute |

## Testing

### Development Testing
1. Set `NODE_ENV=development`
2. No rate limiting will be applied
3. You can make unlimited requests for testing

### Production Testing
1. Set `NODE_ENV=production`
2. Full rate limiting will be applied
3. Test rate limit behavior and error responses

## Benefits

1. **Easy Development**: No interruptions during testing
2. **Production Security**: Full protection when deployed
3. **Automatic Detection**: No manual configuration needed
4. **Clear Logging**: Console messages show current status

## Environment Variables

The rate limiting behavior is controlled by:

```bash
NODE_ENV=development  # Disables rate limiting
NODE_ENV=production   # Enables rate limiting
NODE_ENV=staging      # Enables rate limiting
```

## Health Check Response

### Development
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "rateLimiting": "DISABLED"
}
```

### Production
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

This implementation ensures a smooth development experience while maintaining security in production environments.
