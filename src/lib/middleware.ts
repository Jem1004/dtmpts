// Comprehensive middleware system
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as jwt from 'jsonwebtoken';
import { authConfig, apiConfig, securityConfig } from './config';
import logger from './logger';
import cache from './cache';
import { connectToDatabase } from './database';

// Types
export interface MiddlewareContext {
  req: NextRequest;
  res?: NextResponse;
  user?: any;
  session?: any;
  startTime: number;
  requestId: string;
  metadata: Record<string, any>;
}

export type MiddlewareFunction = (
  context: MiddlewareContext
) => Promise<NextResponse | void> | NextResponse | void;

export interface MiddlewareOptions {
  skipPaths?: string[];
  includePaths?: string[];
  methods?: string[];
  requireAuth?: boolean;
  requireRoles?: string[];
  rateLimit?: {
    windowMs: number;
    max: number;
    message?: string;
  };
  validation?: {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
  };
  cache?: {
    ttl: number;
    key?: string;
  };
}

// Utility functions
const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const shouldSkipPath = (pathname: string, skipPaths: string[] = []): boolean => {
  return skipPaths.some(path => {
    if (path.includes('*')) {
      const regex = new RegExp(path.replace(/\*/g, '.*'));
      return regex.test(pathname);
    }
    return pathname.startsWith(path);
  });
};

const shouldIncludePath = (pathname: string, includePaths: string[] = []): boolean => {
  if (includePaths.length === 0) return true;
  return includePaths.some(path => {
    if (path.includes('*')) {
      const regex = new RegExp(path.replace(/\*/g, '.*'));
      return regex.test(pathname);
    }
    return pathname.startsWith(path);
  });
};

// Core middleware functions
export const middlewares = {
  // Request logging middleware
  logging: (): MiddlewareFunction => {
    return async (context: MiddlewareContext) => {
      const { req, requestId, startTime } = context;
      const { method, url, headers } = req;
      
      // Log request
      logger.info('API Request', {
        requestId,
        method,
        url,
        userAgent: headers.get('user-agent') || 'unknown',
        ip: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
        timestamp: new Date().toISOString(),
      });
      
      // Add response logging
      context.metadata.logResponse = (response: NextResponse) => {
        const duration = Date.now() - startTime;
        logger.info('API Response', {
          requestId,
          method,
          url,
          status: response.status,
          duration,
          timestamp: new Date().toISOString(),
        });
      };
      
      return undefined;
    };
  },

  // CORS middleware
  cors: (): MiddlewareFunction => {
    return async (context: MiddlewareContext) => {
      const { req } = context;
      const origin = req.headers.get('origin');
      const { cors } = securityConfig;
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        
        if (origin && cors.origin.includes(origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin);
        }
        
        response.headers.set('Access-Control-Allow-Methods', cors.methods.join(', '));
        response.headers.set('Access-Control-Allow-Headers', cors.allowedHeaders.join(', '));
        
        if (cors.credentials) {
          response.headers.set('Access-Control-Allow-Credentials', 'true');
        }
        
        return response;
      }
      
      // Set CORS headers for actual requests
      context.metadata.corsHeaders = {
        'Access-Control-Allow-Origin': origin && cors.origin.includes(origin) ? origin : cors.origin[0],
        'Access-Control-Allow-Credentials': cors.credentials ? 'true' : 'false',
      };
    };
  },

  // Security headers middleware
  security: (): MiddlewareFunction => {
    return async (context: MiddlewareContext) => {
      context.metadata.securityHeaders = {
        ...securityConfig.headers,
        'Content-Security-Policy': Object.entries(securityConfig.csp)
          .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
          .join('; '),
      };
      
      return undefined;
    };
  },

  // Rate limiting middleware
  rateLimit: (options: MiddlewareOptions['rateLimit']): MiddlewareFunction => {
    const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
    
    return async (context: MiddlewareContext) => {
      if (!options) return undefined;
      
      const { req } = context;
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const key = `rate_limit:${ip}`;
      const now = Date.now();
      
      let rateLimitData = rateLimitMap.get(key);
      
      if (!rateLimitData || now > rateLimitData.resetTime) {
        rateLimitData = {
          count: 0,
          resetTime: now + options.windowMs,
        };
      }
      
      rateLimitData.count++;
      rateLimitMap.set(key, rateLimitData);
      
      if (rateLimitData.count > options.max) {
        logger.warn('Rate limit exceeded', {
          ip,
          path: req.nextUrl.pathname,
          count: rateLimitData.count,
          limit: options.max,
        });
        
        return NextResponse.json(
          { error: options.message || 'Too many requests' },
          { status: 429 }
        );
      }
      
      // Add rate limit headers
      context.metadata.rateLimitHeaders = {
        'X-RateLimit-Limit': options.max.toString(),
        'X-RateLimit-Remaining': Math.max(0, options.max - rateLimitData.count).toString(),
        'X-RateLimit-Reset': Math.ceil(rateLimitData.resetTime / 1000).toString(),
      };
    };
  },

  // Authentication middleware
  auth: (requireAuth: boolean = true): MiddlewareFunction => {
    return async (context: MiddlewareContext) => {
      const { req } = context;
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        if (requireAuth) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
        return undefined;
      }
      
      try {
        const decoded = jwt.verify(token, authConfig.jwt.secret) as any;
        context.user = decoded;
        
        // Log authentication
        logger.info('Authentication successful', {
          userId: decoded.id,
          email: decoded.email,
          ip: req.headers.get('x-forwarded-for') || 'unknown',
        });
      } catch (error) {
        logger.warn('Authentication failed', {
          token: token.substring(0, 10) + '...',
          error: error instanceof Error ? error.message : 'Unknown error',
          ip: req.headers.get('x-forwarded-for') || 'unknown',
        });
        
        if (requireAuth) {
          return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
          );
        }
      }
      return undefined;
    };
  },

  // Role-based authorization middleware
  authorize: (requiredRoles: string[]): MiddlewareFunction => {
    return async (context: MiddlewareContext) => {
      const { user } = context;
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      const userRoles = Array.isArray(user.roles) ? user.roles : [user.role].filter(Boolean);
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        logger.warn('Authorization failed', {
          userId: user.id,
          requiredRoles,
          userRoles,
          path: context.req.nextUrl.pathname,
        });
        
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      return undefined;
    };
  },

  // Request validation middleware
  validate: (schemas: MiddlewareOptions['validation']): MiddlewareFunction => {
    return async (context: MiddlewareContext) => {
      const { req } = context;
      
      try {
        // Validate body
        if (schemas?.body && req.method !== 'GET') {
          const body = await req.json().catch(() => ({}));
          context.metadata.validatedBody = schemas.body.parse(body);
        }
        
        // Validate query parameters
        if (schemas?.query) {
          const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
          context.metadata.validatedQuery = schemas.query.parse(searchParams);
        }
        
        // Validate URL parameters
        if (schemas?.params) {
          const pathname = req.nextUrl.pathname;
          const segments = pathname.split('/').filter(Boolean);
          const params: Record<string, string> = {};
          
          // Extract dynamic segments (this is a simplified version)
          // In a real implementation, you'd need route matching logic
          segments.forEach((segment, index) => {
            if (segment.startsWith('[') && segment.endsWith(']')) {
              const paramName = segment.slice(1, -1);
              params[paramName] = segments[index] || '';
            }
          });
          
          context.metadata.validatedParams = schemas.params.parse(params);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              details: error.issues.map((err: z.ZodIssue) => ({
                path: err.path.join('.'),
                message: err.message,
              })),
            },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: 'Invalid request data' },
          { status: 400 }
        );
      }
    };
  },

  // Caching middleware
  cache: (options: MiddlewareOptions['cache']): MiddlewareFunction => {
    return async (context: MiddlewareContext) => {
      if (!options || context.req.method !== 'GET') return undefined;
      
      const cacheKey = options.key || `api:${context.req.nextUrl.pathname}:${context.req.nextUrl.search}`;
      
      try {
        const cached = await cache.get(cacheKey);
        if (cached) {
          const response = NextResponse.json(cached);
          response.headers.set('X-Cache', 'HIT');
          return response;
        }
        
        // Store cache key for later use
        context.metadata.cacheKey = cacheKey;
        context.metadata.cacheTTL = options.ttl;
      } catch (error) {
        logger.error('Cache middleware error:', error as Error);
      }
      return undefined;
    };
  },

  // Database connection middleware
  database: (): MiddlewareFunction => {
    return async () => {
      try {
        await connectToDatabase();
      } catch (error) {
        logger.error('Database connection failed:', error as Error);
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 503 }
        );
      }
      return undefined;
    };
  },

  // Method validation middleware
  methods: (allowedMethods: string[]): MiddlewareFunction => {
    return async (context: MiddlewareContext) => {
      const { req } = context;
      
      if (!allowedMethods.includes(req.method)) {
        return NextResponse.json(
          { error: `Method ${req.method} not allowed` },
          { status: 405, headers: { Allow: allowedMethods.join(', ') } }
        );
      }
    };
  },

  // Error handling middleware
  errorHandler: (): MiddlewareFunction => {
    return async (context: MiddlewareContext) => {
      // This middleware should be used to wrap other middlewares
      // and catch any unhandled errors
      context.metadata.errorHandler = (error: Error) => {
        logger.error('Middleware error:', {
          error: error.message,
          stack: error.stack,
          requestId: context.requestId,
          path: context.req.nextUrl.pathname,
        });
        
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      };
    };
  },
};

// Middleware composer
export class MiddlewareComposer {
  private middlewares: MiddlewareFunction[] = [];
  private options: MiddlewareOptions = {};

  constructor(options: MiddlewareOptions = {}) {
    this.options = options;
  }

  use(middleware: MiddlewareFunction): this {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(req: NextRequest): Promise<NextResponse> {
    const { pathname } = req.nextUrl;
    
    // Check if path should be skipped
    if (shouldSkipPath(pathname, this.options.skipPaths)) {
      return NextResponse.next();
    }
    
    // Check if path should be included
    if (!shouldIncludePath(pathname, this.options.includePaths)) {
      return NextResponse.next();
    }
    
    // Check method
    if (this.options.methods && !this.options.methods.includes(req.method)) {
      return NextResponse.next();
    }
    
    // Create context
    const context: MiddlewareContext = {
      req,
      startTime: Date.now(),
      requestId: generateRequestId(),
      metadata: {},
    };
    
    try {
      // Execute middlewares in sequence
      for (const middleware of this.middlewares) {
        const result = await middleware(context);
        if (result instanceof NextResponse) {
          return result;
        }
      }
      
      // If no middleware returned a response, continue
      const response = NextResponse.next();
      
      // Apply collected headers
      const allHeaders = {
        ...context.metadata.corsHeaders,
        ...context.metadata.securityHeaders,
        ...context.metadata.rateLimitHeaders,
      };
      
      Object.entries(allHeaders).forEach(([key, value]) => {
        if (value && typeof value === 'string') response.headers.set(key, value);
      });
      
      // Log response if logging middleware was used
      if (context.metadata.logResponse) {
        context.metadata.logResponse(response);
      }
      
      return response;
    } catch (error) {
      if (context.metadata.errorHandler) {
        return context.metadata.errorHandler(error as Error);
      }
      
      logger.error('Unhandled middleware error:', error as Error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}

// Predefined middleware chains
export const chains = {
  // Basic API middleware
  api: (options: MiddlewareOptions = {}) => {
    return new MiddlewareComposer(options)
      .use(middlewares.errorHandler())
      .use(middlewares.logging())
      .use(middlewares.cors())
      .use(middlewares.security())
      .use(middlewares.database());
  },
  
  // Protected API middleware
  protectedApi: (options: MiddlewareOptions = {}) => {
    return chains.api(options)
      .use(middlewares.auth(options.requireAuth))
      .use(middlewares.authorize(options.requireRoles || []));
  },
  
  // Public API with rate limiting
  publicApi: (options: MiddlewareOptions = {}) => {
    return chains.api(options)
      .use(middlewares.rateLimit(options.rateLimit || apiConfig.rateLimit));
  },
  
  // Full-featured API middleware
  fullApi: (options: MiddlewareOptions = {}) => {
    const composer = chains.api(options)
      .use(middlewares.methods(options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']))
      .use(middlewares.rateLimit(options.rateLimit || apiConfig.rateLimit));
    
    if (options.validation) {
      composer.use(middlewares.validate(options.validation));
    }
    
    if (options.cache) {
      composer.use(middlewares.cache(options.cache));
    }
    
    if (options.requireAuth) {
      composer.use(middlewares.auth(options.requireAuth));
    }
    
    if (options.requireRoles) {
      composer.use(middlewares.authorize(options.requireRoles));
    }
    
    return composer;
  },
};

// Export utilities
export const createMiddleware = (options: MiddlewareOptions = {}) => {
  return chains.fullApi(options);
};

export const createApiHandler = (handler: MiddlewareFunction, options: MiddlewareOptions = {}) => {
  const composer = createMiddleware(options).use(handler);
  return (req: NextRequest) => composer.execute(req);
};

// Export default
export default {
  middlewares,
  MiddlewareComposer,
  chains,
  createMiddleware,
  createApiHandler,
};