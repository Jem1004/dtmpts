// Comprehensive application constants

// API Routes
export const API_ROUTES = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    PROFILE: '/api/auth/profile',
  },
  
  // News/Berita
  BERITA: {
    BASE: '/api/berita',
    BY_ID: (id: string) => `/api/berita/${id}`,
    BY_SLUG: (slug: string) => `/api/berita/slug/${slug}`,
    CATEGORIES: '/api/berita/categories',
    TAGS: '/api/berita/tags',
    FEATURED: '/api/berita/featured',
    SEARCH: '/api/berita/search',
  },
  
  // Gallery
  GALLERY: {
    BASE: '/api/gallery',
    BY_ID: (id: string) => `/api/gallery/${id}`,
    CATEGORIES: '/api/gallery/categories',
    FEATURED: '/api/gallery/featured',
  },
  
  // Reports/Laporan
  LAPORAN: {
    BASE: '/api/laporan',
    BY_ID: (id: string) => `/api/laporan/${id}`,
    CATEGORIES: '/api/laporan/categories',
    STATUS: '/api/laporan/status',
    STATISTICS: '/api/laporan/statistics',
  },
  
  // Users
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
    PROFILE: '/api/users/profile',
    ROLES: '/api/users/roles',
  },
  
  // File uploads
  UPLOAD: {
    IMAGE: '/api/upload/image',
    DOCUMENT: '/api/upload/document',
    AVATAR: '/api/upload/avatar',
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    STATISTICS: '/api/admin/statistics',
    USERS: '/api/admin/users',
    CONTENT: '/api/admin/content',
    SETTINGS: '/api/admin/settings',
  },
} as const;

// Page Routes
export const PAGE_ROUTES = {
  // Public pages
  HOME: '/',
  ABOUT: '/tentang',
  CONTACT: '/kontak',
  SERVICES: '/layanan',
  
  // News/Berita
  BERITA: {
    LIST: '/berita',
    DETAIL: (slug: string) => `/berita/${slug}`,
    CATEGORY: (category: string) => `/berita/kategori/${category}`,
    TAG: (tag: string) => `/berita/tag/${tag}`,
    SEARCH: '/berita/cari',
  },
  
  // Gallery
  GALLERY: {
    LIST: '/galeri',
    DETAIL: (id: string) => `/galeri/${id}`,
    CATEGORY: (category: string) => `/galeri/kategori/${category}`,
  },
  
  // Reports/Laporan
  LAPORAN: {
    FORM: '/laporan/buat',
    TRACK: '/laporan/lacak',
    DETAIL: (id: string) => `/laporan/${id}`,
  },
  
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/lupa-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verifikasi-email',
  },
  
  // User dashboard
  DASHBOARD: {
    HOME: '/dashboard',
    PROFILE: '/dashboard/profil',
    REPORTS: '/dashboard/laporan',
    SETTINGS: '/dashboard/pengaturan',
  },
  
  // Admin
  ADMIN: {
    HOME: '/admin',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/pengguna',
    BERITA: '/admin/berita',
    GALLERY: '/admin/galeri',
    LAPORAN: '/admin/laporan',
    SETTINGS: '/admin/pengaturan',
  },
} as const;

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  EDITOR: 'editor',
  USER: 'user',
} as const;

// User Permissions
export const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Content management
  CONTENT_CREATE: 'content:create',
  CONTENT_READ: 'content:read',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
  
  // Report management
  REPORT_CREATE: 'report:create',
  REPORT_READ: 'report:read',
  REPORT_UPDATE: 'report:update',
  REPORT_DELETE: 'report:delete',
  REPORT_RESPOND: 'report:respond',
  
  // System administration
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
} as const;

// Content Categories
export const BERITA_CATEGORIES = {
  PENGUMUMAN: 'pengumuman',
  BERITA: 'berita',
  KEGIATAN: 'kegiatan',
  LAYANAN: 'layanan',
  REGULASI: 'regulasi',
} as const;

export const GALLERY_CATEGORIES = {
  KEGIATAN: 'kegiatan',
  FASILITAS: 'fasilitas',
  ACARA: 'acara',
  DOKUMENTASI: 'dokumentasi',
} as const;

export const LAPORAN_CATEGORIES = {
  PELAYANAN: 'pelayanan',
  INFRASTRUKTUR: 'infrastruktur',
  ADMINISTRASI: 'administrasi',
  PERIZINAN: 'perizinan',
  PENGADUAN: 'pengaduan',
  SARAN: 'saran',
} as const;

// Status Types
export const LAPORAN_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  CLOSED: 'closed',
} as const;

export const LAPORAN_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  SCHEDULED: 'scheduled',
} as const;

// File Types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

// File Size Limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  AVATAR: 2 * 1024 * 1024, // 2MB
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
  },
  
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  
  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  PHONE: {
    PATTERN: /^(\+62|62|0)[0-9]{9,13}$/,
  },
  
  NIK: {
    LENGTH: 16,
    PATTERN: /^[0-9]{16}$/,
  },
  
  NPWP: {
    PATTERN: /^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\.[0-9]{1}-[0-9]{3}\.[0-9]{3}$/,
  },
  
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 200,
  },
  
  CONTENT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 50000,
  },
  
  EXCERPT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
  
  SLUG: {
    PATTERN: /^[a-z0-9-]+$/,
    MAX_LENGTH: 100,
  },
} as const;

// UI Constants
export const UI_CONSTANTS = {
  // Breakpoints (matching Tailwind CSS)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
  
  // Animation durations (in milliseconds)
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Common spacing values
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    '2XL': 48,
    '3XL': 64,
  },
} as const;

// Date/Time Constants
export const DATE_FORMATS = {
  DISPLAY: 'dd MMMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMMM yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  INPUT_WITH_TIME: 'yyyy-MM-dd HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  API: 'yyyy-MM-dd HH:mm:ss',
} as const;

export const TIME_ZONES = {
  WIB: 'Asia/Jakarta', // UTC+7
  WITA: 'Asia/Makassar', // UTC+8
  WIT: 'Asia/Jayapura', // UTC+9
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  AUTH: {
    INVALID_CREDENTIALS: 'Email atau password tidak valid',
    ACCOUNT_LOCKED: 'Akun Anda telah dikunci',
    EMAIL_NOT_VERIFIED: 'Email belum diverifikasi',
    TOKEN_EXPIRED: 'Token telah kedaluwarsa',
    UNAUTHORIZED: 'Anda tidak memiliki akses',
    FORBIDDEN: 'Akses ditolak',
  },
  
  // Validation
  VALIDATION: {
    REQUIRED: 'Field ini wajib diisi',
    INVALID_EMAIL: 'Format email tidak valid',
    INVALID_PHONE: 'Format nomor telepon tidak valid',
    INVALID_NIK: 'Format NIK tidak valid',
    INVALID_NPWP: 'Format NPWP tidak valid',
    PASSWORD_TOO_SHORT: 'Password minimal 8 karakter',
    PASSWORD_TOO_WEAK: 'Password terlalu lemah',
    PASSWORDS_NOT_MATCH: 'Password tidak sama',
    FILE_TOO_LARGE: 'Ukuran file terlalu besar',
    INVALID_FILE_TYPE: 'Tipe file tidak didukung',
  },
  
  // Network
  NETWORK: {
    CONNECTION_ERROR: 'Koneksi bermasalah',
    TIMEOUT: 'Request timeout',
    SERVER_ERROR: 'Terjadi kesalahan server',
    NOT_FOUND: 'Data tidak ditemukan',
    RATE_LIMIT: 'Terlalu banyak request',
  },
  
  // General
  GENERAL: {
    UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
    OPERATION_FAILED: 'Operasi gagal',
    DATA_NOT_FOUND: 'Data tidak ditemukan',
    ACCESS_DENIED: 'Akses ditolak',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  AUTH: {
    LOGIN_SUCCESS: 'Login berhasil',
    LOGOUT_SUCCESS: 'Logout berhasil',
    REGISTER_SUCCESS: 'Registrasi berhasil',
    EMAIL_VERIFIED: 'Email berhasil diverifikasi',
    PASSWORD_RESET: 'Password berhasil direset',
  },
  
  // CRUD Operations
  CRUD: {
    CREATE_SUCCESS: 'Data berhasil dibuat',
    UPDATE_SUCCESS: 'Data berhasil diperbarui',
    DELETE_SUCCESS: 'Data berhasil dihapus',
    SAVE_SUCCESS: 'Data berhasil disimpan',
  },
  
  // File Operations
  FILE: {
    UPLOAD_SUCCESS: 'File berhasil diupload',
    DELETE_SUCCESS: 'File berhasil dihapus',
  },
  
  // Reports
  REPORT: {
    SUBMIT_SUCCESS: 'Laporan berhasil dikirim',
    RESPONSE_SUCCESS: 'Tanggapan berhasil dikirim',
  },
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  BERITA_LIST: (page: number, limit: number) => `berita:list:${page}:${limit}`,
  BERITA_DETAIL: (slug: string) => `berita:detail:${slug}`,
  BERITA_CATEGORIES: 'berita:categories',
  GALLERY_LIST: (page: number, limit: number) => `gallery:list:${page}:${limit}`,
  LAPORAN_STATS: 'laporan:stats',
  ADMIN_DASHBOARD: 'admin:dashboard',
} as const;

// Event Names
export const EVENTS = {
  // User events
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_REGISTER: 'user:register',
  USER_PROFILE_UPDATE: 'user:profile:update',
  
  // Content events
  BERITA_CREATE: 'berita:create',
  BERITA_UPDATE: 'berita:update',
  BERITA_DELETE: 'berita:delete',
  BERITA_PUBLISH: 'berita:publish',
  
  // Report events
  LAPORAN_SUBMIT: 'laporan:submit',
  LAPORAN_RESPOND: 'laporan:respond',
  LAPORAN_STATUS_CHANGE: 'laporan:status:change',
  
  // System events
  SYSTEM_ERROR: 'system:error',
  SYSTEM_WARNING: 'system:warning',
} as const;

// Indonesian Provinces
export const PROVINCES = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Sumatera Selatan',
  'Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Banten',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Sulawesi Tengah',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Gorontalo',
  'Sulawesi Barat',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
  'Papua Selatan',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Barat Daya',
] as const;

// Common Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+62|62|0)[0-9]{9,13}$/,
  NIK: /^[0-9]{16}$/,
  NPWP: /^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\.[0-9]{1}-[0-9]{3}\.[0-9]{3}$/,
  SLUG: /^[a-z0-9-]+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// Export type helpers
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type BeritaCategory = typeof BERITA_CATEGORIES[keyof typeof BERITA_CATEGORIES];
export type GalleryCategory = typeof GALLERY_CATEGORIES[keyof typeof GALLERY_CATEGORIES];
export type LaporanCategory = typeof LAPORAN_CATEGORIES[keyof typeof LAPORAN_CATEGORIES];
export type LaporanStatus = typeof LAPORAN_STATUS[keyof typeof LAPORAN_STATUS];
export type LaporanPriority = typeof LAPORAN_PRIORITY[keyof typeof LAPORAN_PRIORITY];
export type ContentStatus = typeof CONTENT_STATUS[keyof typeof CONTENT_STATUS];
export type Province = typeof PROVINCES[number];

// Export all constants as default
export default {
  API_ROUTES,
  PAGE_ROUTES,
  USER_ROLES,
  PERMISSIONS,
  BERITA_CATEGORIES,
  GALLERY_CATEGORIES,
  LAPORAN_CATEGORIES,
  LAPORAN_STATUS,
  LAPORAN_PRIORITY,
  CONTENT_STATUS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  FILE_SIZE_LIMITS,
  VALIDATION_RULES,
  UI_CONSTANTS,
  DATE_FORMATS,
  TIME_ZONES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CACHE_KEYS,
  EVENTS,
  PROVINCES,
  REGEX_PATTERNS,
};