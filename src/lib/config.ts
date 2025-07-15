// Comprehensive configuration management
import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  MONGODB_DB_NAME: z.string().default('dpmptsp_db'),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // API
  API_BASE_URL: z.string().url().default('http://localhost:3000'),
  API_TIMEOUT: z.string().transform(Number).default('30000'),
  
  // File uploads
  UPLOAD_MAX_SIZE: z.string().transform(Number).default('10485760'), // 10MB
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/webp,application/pdf'),
  UPLOAD_DIR: z.string().default('./public/uploads'),
  
  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  
  // Redis (optional)
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // Rate limiting
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SESSION_TIMEOUT: z.string().transform(Number).default('86400000'), // 24 hours
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FILE: z.string().optional(),
  
  // Analytics (optional)
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  
  // External APIs (optional)
  WEATHER_API_KEY: z.string().optional(),
  MAPS_API_KEY: z.string().optional(),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
};

// Environment variables
export const env = parseEnv();

// Database configuration
export const dbConfig = {
  uri: env.MONGODB_URI,
  dbName: env.MONGODB_DB_NAME,
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    bufferMaxEntries: 0,
  },
} as const;

// Authentication configuration
export const authConfig = {
  nextAuth: {
    url: env.NEXTAUTH_URL,
    secret: env.NEXTAUTH_SECRET,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },
  session: {
    timeout: env.SESSION_TIMEOUT,
  },
} as const;

// API configuration
export const apiConfig = {
  baseUrl: env.API_BASE_URL,
  timeout: env.API_TIMEOUT,
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW,
    max: env.RATE_LIMIT_MAX,
  },
} as const;

// File upload configuration
export const uploadConfig = {
  maxSize: env.UPLOAD_MAX_SIZE,
  allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(','),
  directory: env.UPLOAD_DIR,
  paths: {
    images: '/uploads/images',
    documents: '/uploads/documents',
    temp: '/uploads/temp',
  },
} as const;

// Email configuration
export const emailConfig = {
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: env.SMTP_USER && env.SMTP_PASS ? {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    } : undefined,
  },
  from: env.SMTP_FROM,
  enabled: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
} as const;

// Redis configuration
export const redisConfig = {
  url: env.REDIS_URL,
  password: env.REDIS_PASSWORD,
  enabled: !!env.REDIS_URL,
  options: {
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
  },
} as const;

// Logging configuration
export const logConfig = {
  level: env.LOG_LEVEL,
  file: env.LOG_FILE,
  console: env.NODE_ENV !== 'production',
  format: env.NODE_ENV === 'production' ? 'json' : 'pretty',
} as const;

// Security configuration
export const securityConfig = {
  cors: {
    origin: env.NODE_ENV === 'production' 
      ? [env.API_BASE_URL] 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'frame-src': ["'none'"],
  },
} as const;

// Feature flags
export const features = {
  // Core features
  authentication: true,
  userRegistration: true,
  emailVerification: emailConfig.enabled,
  
  // Content features
  newsComments: true,
  galleryUpload: true,
  reportSubmission: true,
  
  // Admin features
  adminDashboard: true,
  userManagement: true,
  contentModeration: true,
  
  // External integrations
  analytics: !!env.GOOGLE_ANALYTICS_ID,
  maps: !!env.MAPS_API_KEY,
  weather: !!env.WEATHER_API_KEY,
  
  // Performance features
  caching: redisConfig.enabled,
  compression: true,
  imageOptimization: true,
  
  // Development features
  debugMode: env.NODE_ENV === 'development',
  apiDocs: env.NODE_ENV !== 'production',
  testMode: env.NODE_ENV === 'test',
} as const;

// Application configuration
export const appConfig = {
  name: 'DPMPTSP Website',
  version: '1.0.0',
  description: 'Website Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu',
  
  // Pagination
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    defaultPage: 1,
  },
  
  // Search
  search: {
    minQueryLength: 2,
    maxResults: 50,
    highlightResults: true,
  },
  
  // Cache TTL (in seconds)
  cache: {
    static: 3600, // 1 hour
    dynamic: 300, // 5 minutes
    user: 900, // 15 minutes
    session: 1800, // 30 minutes
  },
  
  // UI configuration
  ui: {
    theme: {
      primary: '#1e40af',
      secondary: '#64748b',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    layout: {
      maxWidth: '1200px',
      sidebarWidth: '280px',
      headerHeight: '64px',
    },
    animation: {
      duration: 200,
      easing: 'ease-in-out',
    },
  },
  
  // Content limits
  limits: {
    title: {
      min: 5,
      max: 200,
    },
    content: {
      min: 10,
      max: 50000,
    },
    excerpt: {
      min: 10,
      max: 500,
    },
    tags: {
      max: 10,
      maxLength: 50,
    },
    comments: {
      min: 1,
      max: 1000,
    },
  },
} as const;

// Validation schemas for configuration
export const configSchemas = {
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(appConfig.pagination.maxLimit).default(appConfig.pagination.defaultLimit),
  }),
  
  search: z.object({
    q: z.string().min(appConfig.search.minQueryLength).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'relevance']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
  
  upload: z.object({
    file: z.any().refine(
      (file) => file instanceof File,
      'Must be a valid file'
    ).refine(
      (file) => file.size <= uploadConfig.maxSize,
      `File size must be less than ${uploadConfig.maxSize / 1024 / 1024}MB`
    ).refine(
      (file) => uploadConfig.allowedTypes.includes(file.type),
      `File type must be one of: ${uploadConfig.allowedTypes.join(', ')}`
    ),
  }),
};

// Configuration utilities
export const configUtils = {
  // Check if feature is enabled
  isFeatureEnabled: (feature: keyof typeof features): boolean => {
    return features[feature];
  },
  
  // Get environment-specific config
  getEnvConfig: () => ({
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  }),
  
  // Validate configuration object
  validateConfig: <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    return schema.parse(data);
  },
  
  // Get cache key with prefix
  getCacheKey: (prefix: string, ...parts: string[]): string => {
    return `${appConfig.name}:${prefix}:${parts.join(':')}`;
  },
  
  // Format file size
  formatFileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },
  
  // Get allowed file types for input
  getAllowedFileTypes: (): string => {
    return uploadConfig.allowedTypes.join(',');
  },
  
  // Check if email is configured
  isEmailConfigured: (): boolean => {
    return emailConfig.enabled;
  },
  
  // Check if Redis is configured
  isRedisConfigured: (): boolean => {
    return redisConfig.enabled;
  },
  
  // Get CORS configuration
  getCorsConfig: () => securityConfig.cors,
  
  // Get CSP header value
  getCSPHeader: (): string => {
    return Object.entries(securityConfig.csp)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  },
};

// Export all configurations
export default {
  env,
  db: dbConfig,
  auth: authConfig,
  api: apiConfig,
  upload: uploadConfig,
  email: emailConfig,
  redis: redisConfig,
  log: logConfig,
  security: securityConfig,
  features,
  app: appConfig,
  schemas: configSchemas,
  utils: configUtils,
};

// Type exports
export type Environment = z.infer<typeof envSchema>;
export type Features = typeof features;
export type AppConfig = typeof appConfig;
export type SecurityConfig = typeof securityConfig;