import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import emailRoutes from './routes/email.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/user/profile.routes';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create Express app
const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3000", "http://localhost:5000"], // Allow images from both origins
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), {
  maxAge: '1h', // Cache for 1 hour (reduced for development)
  etag: true,
  setHeaders: (res, filePath) => {
    // Set proper content type for images
    if (filePath.match(/\.(jpg|jpeg|png|webp)$/i)) {
      res.setHeader('Content-Disposition', 'inline');
      const ext = path.extname(filePath).substring(1).toLowerCase();
      const mimeType = ext === 'jpg' ? 'jpeg' : ext;
      res.setHeader('Content-Type', `image/${mimeType}`);
    }
  }
}));

// API prefix
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Routes
app.use(`${API_PREFIX}/email`, emailRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/user`, profileRoutes);

// Health check route
app.get(`${API_PREFIX}/health`, (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'AirVikBook API Server',
      version: '1.0.0',
      apiDocs: `${API_PREFIX}/health`,
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

// Error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
});

// Database connection
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');
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
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();