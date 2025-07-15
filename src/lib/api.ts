// Comprehensive API utilities
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from './logger';
import { validateData, formatValidationErrors } from './validation';
import { connectToDatabase } from './mongodb';

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// API error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Common API errors
export const ApiErrors = {
  BadRequest: (message = 'Bad Request', details?: any) => 
    new ApiError(message, 400, 'BAD_REQUEST', details),
  
  Unauthorized: (message = 'Unauthorized') => 
    new ApiError(message, 401, 'UNAUTHORIZED'),
  
  Forbidden: (message = 'Forbidden') => 
    new ApiError(message, 403, 'FORBIDDEN'),
  
  NotFound: (message = 'Not Found') => 
    new ApiError(message, 404, 'NOT_FOUND'),
  
  MethodNotAllowed: (message = 'Method Not Allowed') => 
    new ApiError(message, 405, 'METHOD_NOT_ALLOWED'),
  
  Conflict: (message = 'Conflict') => 
    new ApiError(message, 409, 'CONFLICT'),
  
  UnprocessableEntity: (message = 'Unprocessable Entity', details?: any) => 
    new ApiError(message, 422, 'UNPROCESSABLE_ENTITY', details),
  
  TooManyRequests: (message = 'Too Many Requests') => 
    new ApiError(message, 429, 'TOO_MANY_REQUESTS'),
  
  InternalServerError: (message = 'Internal Server Error') => 
    new ApiError(message, 500, 'INTERNAL_SERVER_ERROR'),
  
  ServiceUnavailable: (message = 'Service Unavailable') => 
    new ApiError(message, 503, 'SERVICE_UNAVAILABLE'),
};

// Success response helpers
export const ApiSuccess = {
  ok: <T>(data: T, message?: string): ApiResponse<T> => {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    if (message !== undefined) {
      response.message = message;
    }
    return response;
  },

  created: <T>(data: T, message = 'Resource created successfully'): ApiResponse<T> => ({
    success: true,
    data,
    message,
  }),

  updated: <T>(data: T, message = 'Resource updated successfully'): ApiResponse<T> => ({
    success: true,
    data,
    message,
  }),

  deleted: (message = 'Resource deleted successfully'): ApiResponse => ({
    success: true,
    message,
  }),

  paginated: <T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): ApiResponse<T[]> => {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    if (message !== undefined) {
      response.message = message;
    }
    return response;
  },
};

// Error response helper
export function createErrorResponse(error: any): NextResponse {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_SERVER_ERROR';
  let details: any;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'API_ERROR';
    details = error.details;
  } else if (error instanceof z.ZodError) {
    statusCode = 422;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    details = formatValidationErrors(error);
  } else if (error.name === 'ValidationError') {
    statusCode = 422;
    message = error.message;
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE_RESOURCE';
  }

  const response: ApiResponse = {
    success: false,
    message,
    errors: details ? [{ code, details }] : [{ code, message }],
  };

  // Log error
  logger.error(`API Error: ${message}`, {
    statusCode,
    code,
    details,
    stack: error.stack,
  }, error);

  return NextResponse.json(response, { status: statusCode });
}

// Success response helper
export function createSuccessResponse<T>(
  data: ApiResponse<T>,
  statusCode = 200
): NextResponse {
  return NextResponse.json(data, { status: statusCode });
}

// API handler wrapper with error handling
export function withErrorHandling(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

// Validation middleware
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, data: T, context?: any) => Promise<NextResponse>
) {
  return withErrorHandling(async (req: NextRequest, context?: any) => {
    let requestData: any;

    // Parse request data based on method
    if (req.method === 'GET' || req.method === 'DELETE') {
      const url = new URL(req.url);
      requestData = Object.fromEntries(url.searchParams.entries());
      
      // Convert string numbers to actual numbers
      Object.keys(requestData).forEach(key => {
        const value = requestData[key];
        if (!isNaN(Number(value)) && value !== '') {
          requestData[key] = Number(value);
        }
        if (value === 'true') requestData[key] = true;
        if (value === 'false') requestData[key] = false;
      });
    } else {
      try {
        requestData = await req.json();
      } catch {
        throw ApiErrors.BadRequest('Invalid JSON in request body');
      }
    }

    // Validate data
    const validatedData = validateData(schema, requestData);

    return handler(req, validatedData, context);
  });
}

// Rate limiting middleware
export function withRateLimit(
  maxRequests: number,
  windowMs: number,
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withErrorHandling(async (req: NextRequest, context?: any) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Simple in-memory rate limiting (implement your own logic here)
    // For now, we'll skip rate limiting implementation
    // const isRateLimited = await rateLimit(ip, maxRequests, windowMs);
    
    // if (isRateLimited) {
    //   throw ApiErrors.TooManyRequests('Rate limit exceeded');
    // }
    
    return handler(req, context);
  });
}

// Authentication middleware
export function withAuth(
  handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>
) {
  return withErrorHandling(async (req: NextRequest, context?: any) => {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiErrors.Unauthorized('Missing or invalid authorization header');
    }

    const authToken = authHeader.substring(7);
    
    try {
      // Here you would verify the JWT token
      // const user = await verifyToken(authToken);
      // For now, we'll just pass a mock user
      const user = { id: 'mock-user-id', email: 'user@example.com' };
      
      return handler(req, user, context);
    } catch (error) {
      throw ApiErrors.Unauthorized('Invalid token');
    }
  });
}

// Method validation middleware
export function withMethods(
  allowedMethods: string[],
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withErrorHandling(async (req: NextRequest, context?: any) => {
    if (!allowedMethods.includes(req.method!)) {
      throw ApiErrors.MethodNotAllowed(`Method ${req.method} not allowed`);
    }

    return handler(req, context);
  });
}

// CORS middleware
export function withCors(
  options: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
  } = {},
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers = ['Content-Type', 'Authorization'],
    credentials = false,
  } = options;

  return async (req: NextRequest, context?: any) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': Array.isArray(origin) ? origin.join(', ') : origin,
          'Access-Control-Allow-Methods': methods.join(', '),
          'Access-Control-Allow-Headers': headers.join(', '),
          'Access-Control-Allow-Credentials': credentials.toString(),
        },
      });
    }

    const response = await handler(req, context);

    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', Array.isArray(origin) ? origin.join(', ') : origin);
    response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', headers.join(', '));
    response.headers.set('Access-Control-Allow-Credentials', credentials.toString());

    return response;
  };
}

// Combine multiple middlewares
export function withMiddleware(
  ...middlewares: Array<(handler: any) => any>
) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

// Database connection middleware
export function withDatabase(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withErrorHandling(async (req: NextRequest, context?: any) => {
    try {
      // Import and connect to database
      const { connectToDatabase } = await import('./mongodb');
      await connectToDatabase();
      
      return handler(req, context);
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      logger.error('Database connection failed:', errorInstance);
      throw ApiErrors.ServiceUnavailable('Database connection failed');
    }
  });
}

// Request logging middleware
export function withLogging(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    // Log request
    logger.info('API Request:', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    });

    try {
      const response = await handler(req, context);
      const duration = Date.now() - startTime;
      
      // Log successful response
      logger.info('API Response:', {
        requestId,
        status: response.status,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      // Log error response
      logger.error('API Error Response:', {
        requestId,
        duration,
        error: errorInstance.message,
      });

      throw errorInstance;
    }
  };
}

// Pagination helper
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// Search helper
export function parseSearch(searchParams: URLSearchParams) {
  const search = searchParams.get('search') || searchParams.get('q') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

  return { search, sortBy, sortOrder };
}

// Create API route handler with common middleware
export function createApiHandler(options: {
  methods?: string[];
  validation?: z.ZodSchema;
  auth?: boolean;
  rateLimit?: { maxRequests: number; windowMs: number };
  cors?: boolean;
}) {
  return (handler: (req: NextRequest, data?: any, user?: any, context?: any) => Promise<NextResponse>) => {
    let wrappedHandler = handler;

    // Apply middlewares in reverse order
    wrappedHandler = withLogging(wrappedHandler);
    wrappedHandler = withDatabase(wrappedHandler);
    
    if (options.cors) {
      wrappedHandler = withCors({}, wrappedHandler);
    }
    
    if (options.rateLimit) {
      wrappedHandler = withRateLimit(
        options.rateLimit.maxRequests,
        options.rateLimit.windowMs,
        wrappedHandler
      );
    }
    
    if (options.auth) {
      wrappedHandler = withAuth(wrappedHandler);
    }
    
    if (options.validation) {
      wrappedHandler = withValidation(options.validation, wrappedHandler);
    }
    
    if (options.methods) {
      wrappedHandler = withMethods(options.methods, wrappedHandler);
    }

    return wrappedHandler;
  };
}

// Export default API utilities
export default {
  errors: ApiErrors,
  success: ApiSuccess,
  createErrorResponse,
  createSuccessResponse,
  withErrorHandling,
  withValidation,
  withAuth,
  withMethods,
  withCors,
  withRateLimit,
  withDatabase,
  withLogging,
  withMiddleware,
  parsePagination,
  parseSearch,
  createApiHandler,
};

// Export types
export type { ApiResponse, ApiError };