// Comprehensive validation library
import { z } from 'zod';

// Common validation schemas
export const commonSchemas = {
  // Basic types
  email: z.string().email('Email tidak valid'),
  phone: z.string().regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Nomor telepon tidak valid'),
  url: z.string().url('URL tidak valid'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung'),
  
  // Indonesian specific
  nik: z.string().regex(/^[0-9]{16}$/, 'NIK harus 16 digit angka'),
  npwp: z.string().regex(/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\.[0-9]{1}-[0-9]{3}\.[0-9]{3}$/, 'Format NPWP tidak valid'),
  
  // Text validations
  nonEmptyString: z.string().min(1, 'Field ini wajib diisi'),
  shortText: z.string().min(1, 'Field ini wajib diisi').max(100, 'Maksimal 100 karakter'),
  mediumText: z.string().min(1, 'Field ini wajib diisi').max(500, 'Maksimal 500 karakter'),
  longText: z.string().min(1, 'Field ini wajib diisi').max(2000, 'Maksimal 2000 karakter'),
  
  // Numbers
  positiveNumber: z.number().positive('Harus berupa angka positif'),
  nonNegativeNumber: z.number().min(0, 'Tidak boleh negatif'),
  
  // Dates
  futureDate: z.date().refine(date => date > new Date(), 'Tanggal harus di masa depan'),
  pastDate: z.date().refine(date => date < new Date(), 'Tanggal harus di masa lalu'),
  
  // Files
  imageFile: z.object({
    type: z.string().refine(type => type.startsWith('image/'), 'File harus berupa gambar'),
    size: z.number().max(5 * 1024 * 1024, 'Ukuran file maksimal 5MB'),
  }),
  
  documentFile: z.object({
    type: z.string().refine(
      type => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(type),
      'File harus berupa PDF atau Word'
    ),
    size: z.number().max(10 * 1024 * 1024, 'Ukuran file maksimal 10MB'),
  }),
};

// User validation schemas
export const userSchemas = {
  register: z.object({
    name: commonSchemas.shortText,
    email: commonSchemas.email,
    password: z.string().min(8, 'Password minimal 8 karakter')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password harus mengandung huruf besar, huruf kecil, dan angka'),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  }),
  
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password wajib diisi'),
  }),
  
  profile: z.object({
    name: commonSchemas.shortText,
    email: commonSchemas.email,
    phone: commonSchemas.phone.optional(),
    address: commonSchemas.mediumText.optional(),
    bio: commonSchemas.longText.optional(),
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z.string().min(8, 'Password minimal 8 karakter')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password harus mengandung huruf besar, huruf kecil, dan angka'),
    confirmNewPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Konfirmasi password baru tidak cocok',
    path: ['confirmNewPassword'],
  }),
};

// News (Berita) validation schemas
export const beritaSchemas = {
  create: z.object({
    title: commonSchemas.shortText,
    content: commonSchemas.longText,
    excerpt: commonSchemas.mediumText.optional(),
    category: commonSchemas.nonEmptyString,
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    publishedAt: z.date().optional(),
    image: z.string().url('URL gambar tidak valid').optional(),
  }),
  
  update: z.object({
    title: commonSchemas.shortText.optional(),
    content: commonSchemas.longText.optional(),
    excerpt: commonSchemas.mediumText.optional(),
    category: commonSchemas.nonEmptyString.optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    publishedAt: z.date().optional(),
    image: z.string().url('URL gambar tidak valid').optional(),
  }),
  
  query: z.object({
    page: z.number().positive().default(1),
    limit: z.number().positive().max(100).default(10),
    category: z.string().optional(),
    search: z.string().optional(),
    featured: z.boolean().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

// Gallery validation schemas
export const gallerySchemas = {
  create: z.object({
    title: commonSchemas.shortText,
    description: commonSchemas.mediumText.optional(),
    image: z.string().url('URL gambar tidak valid'),
    category: commonSchemas.nonEmptyString,
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
  }),
  
  update: z.object({
    title: commonSchemas.shortText.optional(),
    description: commonSchemas.mediumText.optional(),
    image: z.string().url('URL gambar tidak valid').optional(),
    category: commonSchemas.nonEmptyString.optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
  }),
  
  query: z.object({
    page: z.number().positive().default(1),
    limit: z.number().positive().max(100).default(10),
    category: z.string().optional(),
    search: z.string().optional(),
    featured: z.boolean().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

// Report (Laporan) validation schemas
export const laporanSchemas = {
  create: z.object({
    title: commonSchemas.shortText,
    description: commonSchemas.longText,
    category: commonSchemas.nonEmptyString,
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    location: commonSchemas.mediumText.optional(),
    reporterName: commonSchemas.shortText,
    reporterEmail: commonSchemas.email,
    reporterPhone: commonSchemas.phone.optional(),
    attachments: z.array(z.string().url()).optional(),
  }),
  
  update: z.object({
    title: commonSchemas.shortText.optional(),
    description: commonSchemas.longText.optional(),
    category: commonSchemas.nonEmptyString.optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    status: z.enum(['pending', 'in_progress', 'resolved', 'rejected']).optional(),
    location: commonSchemas.mediumText.optional(),
    response: commonSchemas.longText.optional(),
    attachments: z.array(z.string().url()).optional(),
  }),
  
  query: z.object({
    page: z.number().positive().default(1),
    limit: z.number().positive().max(100).default(10),
    category: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    status: z.enum(['pending', 'in_progress', 'resolved', 'rejected']).optional(),
    search: z.string().optional(),
    reporterEmail: commonSchemas.email.optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

// API validation schemas
export const apiSchemas = {
  pagination: z.object({
    page: z.number().positive().default(1),
    limit: z.number().positive().max(100).default(10),
  }),
  
  search: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
  
  id: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID tidak valid'),
  }),
};

// Contact form validation
export const contactSchema = z.object({
  name: commonSchemas.shortText,
  email: commonSchemas.email,
  phone: commonSchemas.phone.optional(),
  subject: commonSchemas.shortText,
  message: commonSchemas.longText,
  captcha: z.string().min(1, 'Captcha wajib diisi'),
});

// File upload validation
export const fileUploadSchemas = {
  image: z.object({
    file: commonSchemas.imageFile,
    alt: commonSchemas.shortText.optional(),
    caption: commonSchemas.mediumText.optional(),
  }),
  
  document: z.object({
    file: commonSchemas.documentFile,
    title: commonSchemas.shortText.optional(),
    description: commonSchemas.mediumText.optional(),
  }),
};

// Validation utility functions
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validate data against schema
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError && error.issues.length > 0) {
      const firstError = error.issues[0];
      throw new ValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.code
      );
    }
    throw error;
  }
}

// Validate data and return result with errors
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

// Format validation errors for API responses
export function formatValidationErrors(error: z.ZodError) {
  return error.issues.map((err: z.ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

// Custom validation functions
export const customValidators = {
  // Check if string is a valid Indonesian postal code
  isValidPostalCode: (value: string): boolean => {
    return /^[0-9]{5}$/.test(value);
  },
  
  // Check if string is a valid Indonesian bank account
  isValidBankAccount: (value: string): boolean => {
    return /^[0-9]{10,16}$/.test(value);
  },
  
  // Check if date is within business hours
  isBusinessHours: (date: Date): boolean => {
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 5 && hour >= 8 && hour <= 17;
  },
  
  // Check if password is strong
  isStrongPassword: (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  },
  
  // Check if file type is allowed
  isAllowedFileType: (mimeType: string, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(mimeType);
  },
  
  // Check if file size is within limit
  isFileSizeValid: (size: number, maxSize: number): boolean => {
    return size <= maxSize;
  },
};

// Sanitization functions
export const sanitizers = {
  // Remove HTML tags
  stripHtml: (value: string): string => {
    return value.replace(/<[^>]*>/g, '');
  },
  
  // Normalize phone number
  normalizePhone: (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Convert to +62 format
    if (digits.startsWith('0')) {
      return '+62' + digits.substring(1);
    } else if (digits.startsWith('62')) {
      return '+' + digits;
    } else {
      return '+62' + digits;
    }
  },
  
  // Normalize email
  normalizeEmail: (email: string): string => {
    return email.toLowerCase().trim();
  },
  
  // Create slug from text
  createSlug: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },
  
  // Escape special characters for regex
  escapeRegex: (text: string): string => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },
};

// React hook for form validation
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const validate = (data: unknown) => {
    return safeValidateData(schema, data);
  };
  
  const validateField = (fieldName: string, value: unknown) => {
    try {
      const fieldSchema = (schema as any).shape[fieldName];
      if (fieldSchema) {
        fieldSchema.parse(value);
        return { isValid: true, error: null };
      }
      return { isValid: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError && error.issues.length > 0) {
        return { isValid: false, error: error.issues[0].message };
      }
      return { isValid: false, error: 'Validation error' };
    }
  };
  
  return {
    validate,
    validateField,
  };
}

// Export all schemas
export const schemas = {
  common: commonSchemas,
  user: userSchemas,
  berita: beritaSchemas,
  gallery: gallerySchemas,
  laporan: laporanSchemas,
  api: apiSchemas,
  contact: contactSchema,
  fileUpload: fileUploadSchemas,
};

export default schemas;