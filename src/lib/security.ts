// Comprehensive security utilities
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import env from './env';
import logger from './logger';

// Security configuration
const SECURITY_CONFIG = {
  bcrypt: {
    saltRounds: 12,
  },
  jwt: {
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    algorithm: 'HS256' as const,
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDuration: 60 * 60 * 1000, // 1 hour
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};

// Password utilities
export const passwordUtils = {
  // Hash password
  async hash(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(SECURITY_CONFIG.bcrypt.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      logger.error('Password hashing failed', {}, error as Error);
      throw new Error('Password hashing failed');
    }
  },

  // Verify password
  async verify(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Password verification failed', {}, error as Error);
      return false;
    }
  },

  // Validate password strength
  validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = SECURITY_CONFIG.password;

    if (password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`);
    }

    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Generate secure random password
  generate(length = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each required category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  },
};

// JWT utilities
export const jwtUtils = {
  // Generate access token
  generateAccessToken(payload: object): string {
    return jwt.sign(
      payload,
      env.JWT_SECRET,
      {
        expiresIn: SECURITY_CONFIG.jwt.accessTokenExpiry,
        algorithm: SECURITY_CONFIG.jwt.algorithm,
      } as jwt.SignOptions
    );
  },

  // Generate refresh token
  generateRefreshToken(payload: object): string {
    return jwt.sign(
      payload,
      env.JWT_SECRET,
      {
        expiresIn: SECURITY_CONFIG.jwt.refreshTokenExpiry,
        algorithm: SECURITY_CONFIG.jwt.algorithm,
      } as jwt.SignOptions
    );
  },

  // Verify token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, env.JWT_SECRET, {
        algorithms: [SECURITY_CONFIG.jwt.algorithm],
      });
    } catch (error) {
      logger.warn('JWT verification failed', { token: token.substring(0, 20) + '...' }, error as Error);
      throw new Error('Invalid token');
    }
  },

  // Decode token without verification (for debugging)
  decodeToken(token: string): any {
    return jwt.decode(token);
  },

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  },
};

// Encryption utilities
export const encryptionUtils = {
  // Generate random key
  generateKey(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  },

  // Generate random IV
  generateIV(): string {
    return crypto.randomBytes(16).toString('hex');
  },

  // Encrypt data
  encrypt(text: string, key: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
    };
  },

  // Decrypt data
  decrypt(encryptedData: string, key: string, iv: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  },

  // Hash data with salt
  hashWithSalt(data: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', actualSalt).update(data).digest('hex');
    
    return { hash, salt: actualSalt };
  },

  // Verify hash
  verifyHash(data: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashWithSalt(data, salt);
    return computedHash === hash;
  },
};

// Rate limiting utilities
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number; blockedUntil?: number }> = new Map();

  // Check if request is allowed
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    // Check if currently blocked
    if (record?.blockedUntil && now < record.blockedUntil) {
      return false;
    }

    // Reset if window has passed
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + SECURITY_CONFIG.rateLimit.windowMs,
      });
      return true;
    }

    // Increment attempt count
    record.count++;

    // Block if max attempts exceeded
    if (record.count > SECURITY_CONFIG.rateLimit.maxAttempts) {
      record.blockedUntil = now + SECURITY_CONFIG.rateLimit.blockDuration;
      logger.warn('Rate limit exceeded', {
        identifier,
        attempts: record.count,
        blockedUntil: new Date(record.blockedUntil),
      });
      return false;
    }

    return true;
  }

  // Reset attempts for identifier
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  // Get remaining attempts
  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return SECURITY_CONFIG.rateLimit.maxAttempts;
    
    return Math.max(0, SECURITY_CONFIG.rateLimit.maxAttempts - record.count);
  }

  // Get time until reset
  getTimeUntilReset(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;
    
    return Math.max(0, record.resetTime - Date.now());
  }
}

// Global rate limiter instances
export const rateLimiters = {
  login: new RateLimiter(),
  api: new RateLimiter(),
  password: new RateLimiter(),
};

// Input sanitization utilities
export const sanitizeUtils = {
  // Remove HTML tags
  stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  },

  // Escape HTML entities
  escapeHtml(input: string): string {
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };
    
    return input.replace(/[&<>"'\/]/g, (char) => entityMap[char as keyof typeof entityMap]);
  },

  // Sanitize SQL input (basic)
  sanitizeSql(input: string): string {
    return input.replace(/[';"\\]/g, '');
  },

  // Sanitize file name
  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');
  },

  // Validate and sanitize URL
  sanitizeUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }
      
      return parsed.toString();
    } catch {
      return null;
    }
  },
};

// CSRF protection utilities
export const csrfUtils = {
  // Generate CSRF token
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  // Verify CSRF token
  verifyToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
  },

  // Create CSRF middleware
  createMiddleware() {
    return (req: any, res: any, next: any) => {
      if (req.method === 'GET') {
        // Generate token for GET requests
        req.csrfToken = this.generateToken();
        return next();
      }
      
      // Verify token for other methods
      const token = req.headers['x-csrf-token'] || req.body._csrf;
      const sessionToken = req.session?.csrfToken;
      
      if (!token || !sessionToken || !this.verifyToken(token, sessionToken)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
      
      next();
    };
  },
};

// Security headers utilities
export const securityHeaders = {
  // Get security headers
  getHeaders(): Record<string, string> {
    return {
      // Prevent XSS attacks
      'X-XSS-Protection': '1; mode=block',
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Force HTTPS
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
      ].join('; '),
      
      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
      ].join(', '),
    };
  },

  // Apply headers to response
  applyHeaders(response: Response): Response {
    const headers = this.getHeaders();
    
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        response.headers.set(key, value);
      }
    });
    
    return response;
  },
};

// Session utilities
export const sessionUtils = {
  // Generate session ID
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  // Create session data
  createSession(userId: string, additionalData?: object): object {
    return {
      id: this.generateSessionId(),
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      ...additionalData,
    };
  },

  // Validate session
  isSessionValid(session: any): boolean {
    if (!session || !session.id || !session.userId) {
      return false;
    }
    
    const now = Date.now();
    const lastActivity = new Date(session.lastActivity).getTime();
    const maxAge = SECURITY_CONFIG.session.maxAge;
    
    return (now - lastActivity) < maxAge;
  },

  // Update session activity
  updateActivity(session: any): object {
    return {
      ...session,
      lastActivity: new Date(),
    };
  },
};

// Audit logging utilities
export const auditUtils = {
  // Log security event
  logSecurityEvent(
    event: string,
    userId?: string,
    details?: object,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    logger.warn(`Security Event: ${event}`, {
      type: 'security_audit',
      event,
      userId,
      severity,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  // Log authentication event
  logAuthEvent(
    event: 'login_success' | 'login_failure' | 'logout' | 'password_change',
    userId?: string,
    ip?: string,
    userAgent?: string
  ): void {
    this.logSecurityEvent(event, userId, {
      ip,
      userAgent,
    }, event === 'login_failure' ? 'medium' : 'low');
  },

  // Log data access
  logDataAccess(
    resource: string,
    action: 'read' | 'create' | 'update' | 'delete',
    userId?: string,
    resourceId?: string
  ): void {
    logger.info(`Data Access: ${action} ${resource}`, {
      type: 'data_audit',
      resource,
      action,
      userId,
      resourceId,
      timestamp: new Date().toISOString(),
    });
  },
};

// Export security configuration
export { SECURITY_CONFIG };

// Export default security utilities
export default {
  password: passwordUtils,
  jwt: jwtUtils,
  encryption: encryptionUtils,
  rateLimiters,
  sanitize: sanitizeUtils,
  csrf: csrfUtils,
  headers: securityHeaders,
  session: sessionUtils,
  audit: auditUtils,
  config: SECURITY_CONFIG,
};