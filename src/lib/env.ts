// Environment variables validation
interface Environment {
  MONGODB_URI: string;
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  JWT_SECRET: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

function validateEnv(): Environment {
  const requiredEnvVars = {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV as Environment['NODE_ENV'],
  };

  const missingVars: string[] = [];

  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  return requiredEnvVars as Environment;
}

// Validate environment variables on module load
const env = validateEnv();

export default env;

// Type-safe environment variable access
export const getEnvVar = (key: keyof Environment): string => {
  return env[key];
};

// Check if we're in development mode
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Database configuration
export const dbConfig = {
  uri: env.MONGODB_URI,
  options: {
    bufferCommands: false,
    maxPoolSize: isProduction ? 10 : 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
  },
};

// JWT configuration
export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: '7d',
  algorithm: 'HS256' as const,
};

// NextAuth configuration
export const authConfig = {
  url: env.NEXTAUTH_URL,
  secret: env.NEXTAUTH_SECRET,
};

// API configuration
export const apiConfig = {
  baseUrl: env.NEXTAUTH_URL,
  timeout: 10000,
  retries: 3,
};

// Logging configuration
export const logConfig = {
  level: isDevelopment ? 'debug' : 'info',
  enableConsole: isDevelopment,
  enableFile: isProduction,
};

// Cache configuration
export const cacheConfig = {
  defaultTTL: 300, // 5 minutes
  maxKeys: 1000,
  checkPeriod: 600, // 10 minutes
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // requests per window
  message: 'Too many requests from this IP, please try again later.',
};

// File upload configuration
export const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
  ],
  uploadDir: 'uploads',
};

// Pagination configuration
export const paginationConfig = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultPage: 1,
};

// Security configuration
export const securityConfig = {
  bcryptRounds: 12,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  csrfProtection: isProduction,
  httpsOnly: isProduction,
};

// Performance configuration
export const performanceConfig = {
  enableCompression: isProduction,
  enableCaching: isProduction,
  enableMinification: isProduction,
  enableSourceMaps: isDevelopment,
};

// Monitoring configuration
export const monitoringConfig = {
  enableMetrics: isProduction,
  enableTracing: isProduction,
  enableErrorReporting: isProduction,
  sampleRate: isProduction ? 0.1 : 1.0,
};