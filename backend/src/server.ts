import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import emailRoutes from './routes/email.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/user/profile.routes';
import storageRoutes from './routes/storage.routes';
import securityRoutes from './routes/security.routes';
import SanitizationMiddleware from './middleware/sanitization.middleware';
import HttpsMiddleware from './middleware/https.middleware';
import ApiVersioningMiddleware from './middleware/apiVersioning.middleware';
import RequestLoggingMiddleware from './middleware/requestLogging.middleware';
import DatabaseConfigService from './config/database.config';

// Load environment variables
dotenv.config();
console.log('🔧 Environment variables loaded:');

// Create Express app
const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xXssProtection: true,
}));
// Environment-specific CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Apply input sanitization middleware
app.use(SanitizationMiddleware.sanitizeBody);
app.use(SanitizationMiddleware.sanitizeQuery);
app.use(SanitizationMiddleware.sanitizeParams);

// Apply HTTPS enforcement in production
app.use(HttpsMiddleware.enforceHttps);
app.use(HttpsMiddleware.addSecurityHeaders);

// Apply API versioning middleware
app.use(ApiVersioningMiddleware.handleVersioning);
app.use(ApiVersioningMiddleware.addDeprecationWarning);

// Apply enhanced request logging
app.use(RequestLoggingMiddleware.logRequest);

// Rate limiting configuration
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global limiter
app.use(globalLimiter);

// Specific limiters for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  skipSuccessfulRequests: true,
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour
  message: {
    success: false,
    error: 'Too many registration attempts',
    code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
  },
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 email requests per hour
  message: {
    success: false,
    error: 'Too many email requests',
    code: 'EMAIL_RATE_LIMIT_EXCEEDED',
  },
});

// Secure file serving - requires authentication
// Remove public static file serving for security
// app.use('/uploads', express.static(...));

// Add secure file serving route (will be implemented with authentication middleware)
app.get('/uploads/:filename', (_req, res) => {
  // TODO: Add authentication middleware here
  // For now, return 403 to prevent unauthorized access
  res.status(403).json({
    success: false,
    error: 'File access requires authentication',
    code: 'AUTHENTICATION_REQUIRED',
  });
});

// API prefix
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Routes with rate limiting
app.use(`${API_PREFIX}/email`, emailLimiter, emailRoutes);
app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/user`, profileRoutes);
app.use(`${API_PREFIX}/storage`, storageRoutes);
app.use(`${API_PREFIX}/security`, securityRoutes);

// Apply registration limiter to specific registration endpoint
app.use(`${API_PREFIX}/auth/register`, registrationLimiter);

// Health check route with enhanced security
app.get(`${API_PREFIX}/health`, rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many health check requests',
    code: 'HEALTH_CHECK_RATE_LIMIT_EXCEEDED',
  },
}), (_req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Minimal response for production
  if (isProduction) {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  } else {
    // Development response with more details
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    });
  }
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'AirVikBook API Server',
      version: '1.0.0',
      apiDocs: `${API_PREFIX}/health`,
      securityStatus: `${API_PREFIX}/security/status`,
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
  });
});

// Error handler with enhanced logging
app.use((err: any, req: Request, res: Response, next: any) => {
  // Log error with enhanced logging middleware
  RequestLoggingMiddleware.logError(err, req, res, next);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(err.status || 500).json({
    success: false,
    error: isProduction ? 'Internal server error' : err.message,
    code: err.code || 'INTERNAL_ERROR',
    stack: isProduction ? undefined : err.stack,
  });
});

// Database connection with enhanced error handling
const connectDB = async () => {
  try {
    const connectionTest = await DatabaseConfigService.testConnection();
    if (connectionTest.success) {
      console.log('✅ PostgreSQL connected successfully with connection pooling');
    } else {
      throw new Error(connectionTest.error);
    }
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API available at http://localhost:${PORT}${API_PREFIX}`);
    console.log(`🏥 Health check at http://localhost:${PORT}${API_PREFIX}/health`);
    console.log(`🔒 Security status at http://localhost:${PORT}${API_PREFIX}/security/status`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Gracefully shutting down...');
  await DatabaseConfigService.closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Gracefully shutting down...');
  await DatabaseConfigService.closeConnections();
  process.exit(0);
});

// Start the server
startServer();