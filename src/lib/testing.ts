// Comprehensive testing utilities
import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NextRequest, NextResponse } from 'next/server';

// Test database setup
let mongoServer: MongoMemoryServer;

export const testDb = {
  // Setup test database
  async setup(): Promise<void> {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  },

  // Cleanup test database
  async cleanup(): Promise<void> {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  },

  // Clear all collections
  async clearCollections(): Promise<void> {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  },

  // Get connection URI
  getUri(): string {
    return mongoServer?.getUri() || '';
  },
};

// Mock data generators
export const mockData = {
  // Generate user data
  user: (overrides: Partial<any> = {}) => ({
    _id: new mongoose.Types.ObjectId().toString(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: faker.helpers.arrayElement(['admin', 'user', 'moderator']),
    isActive: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  // Generate news/berita data
  berita: (overrides: Partial<any> = {}) => ({
    _id: new mongoose.Types.ObjectId().toString(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    excerpt: faker.lorem.paragraph(),
    slug: faker.lorem.slug(),
    category: faker.helpers.arrayElement(['pengumuman', 'berita', 'kegiatan']),
    tags: faker.lorem.words(3).split(' '),
    featured: faker.datatype.boolean(),
    image: faker.image.url(),
    author: new mongoose.Types.ObjectId().toString(),
    publishedAt: faker.date.past(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  // Generate gallery data
  gallery: (overrides: Partial<any> = {}) => ({
    _id: new mongoose.Types.ObjectId().toString(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    image: faker.image.url(),
    category: faker.helpers.arrayElement(['kegiatan', 'fasilitas', 'acara']),
    tags: faker.lorem.words(2).split(' '),
    featured: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  // Generate report/laporan data
  laporan: (overrides: Partial<any> = {}) => ({
    _id: new mongoose.Types.ObjectId().toString(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraphs(2),
    category: faker.helpers.arrayElement(['pelayanan', 'infrastruktur', 'administrasi']),
    priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
    status: faker.helpers.arrayElement(['pending', 'in_progress', 'resolved', 'rejected']),
    location: faker.location.streetAddress(),
    reporterName: faker.person.fullName(),
    reporterEmail: faker.internet.email(),
    reporterPhone: faker.phone.number(),
    response: faker.lorem.paragraph(),
    attachments: [faker.image.url()],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  // Generate array of data
  array: <T>(generator: () => T, count: number = 5): T[] => {
    return Array.from({ length: count }, generator);
  },
};

// API testing utilities
export const apiTest = {
  // Create mock NextRequest
  createRequest: (options: {
    method?: string;
    url?: string;
    body?: any;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  } = {}): NextRequest => {
    const {
      method = 'GET',
      url = 'http://localhost:3000/api/test',
      body,
      headers = {},
      searchParams = {},
    } = options;

    const urlWithParams = new URL(url);
    Object.entries(searchParams).forEach(([key, value]) => {
      urlWithParams.searchParams.set(key, value);
    });

    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      requestInit.body = JSON.stringify(body);
    }

    return new NextRequest(urlWithParams.toString(), requestInit);
  },

  // Parse NextResponse
  async parseResponse: (response: NextResponse) => {
    const text = await response.text();
    try {
      return {
        status: response.status,
        data: JSON.parse(text),
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch {
      return {
        status: response.status,
        data: text,
        headers: Object.fromEntries(response.headers.entries()),
      };
    }
  },

  // Test API endpoint
  async testEndpoint: (
    handler: (req: NextRequest) => Promise<NextResponse>,
    request: NextRequest
  ) => {
    const response = await handler(request);
    return apiTest.parseResponse(response);
  },
};

// React testing utilities
export const reactTest = {
  // Render component with providers
  renderWithProviders: (component: React.ReactElement, options: any = {}) => {
    // Add your providers here (Redux, Context, etc.)
    return render(component, options);
  },

  // User event utilities
  user: userEvent.setup(),

  // Common assertions
  assertions: {
    // Check if element exists
    elementExists: (selector: string) => {
      const element = screen.getByTestId(selector);
      if (!element) throw new Error(`Element with testId '${selector}' not found`);
    },

    // Check if text exists
    textExists: (text: string) => {
      const element = screen.getByText(text);
      if (!element) throw new Error(`Text '${text}' not found`);
    },

    // Check if element has class
    hasClass: (selector: string, className: string) => {
      const element = screen.getByTestId(selector);
      if (!element.classList.contains(className)) {
        throw new Error(`Element does not have class '${className}'`);
      }
    },

    // Check field value
    fieldHasValue: (fieldName: string, value: string) => {
      const element = screen.getByDisplayValue(value);
      if (!element) throw new Error(`Field with value '${value}' not found`);
    },

    // Check if button is disabled
    buttonDisabled: (buttonText: string) => {
      const button = screen.getByRole('button', { name: buttonText });
      if (!button.hasAttribute('disabled')) {
        throw new Error(`Button '${buttonText}' is not disabled`);
      }
    },
  },

  // Interaction helpers
  interactions: {
    // Click element
    click: async (selector: string) => {
      await reactTest.user.click(screen.getByTestId(selector));
    },

    // Type in input
    type: async (selector: string, text: string) => {
      await reactTest.user.type(screen.getByTestId(selector), text);
    },

    // Clear and type
    clearAndType: async (selector: string, text: string) => {
      const element = screen.getByTestId(selector);
      await reactTest.user.clear(element);
      await reactTest.user.type(element, text);
    },

    // Select option
    selectOption: async (selector: string, option: string) => {
      await reactTest.user.selectOptions(screen.getByTestId(selector), option);
    },

    // Upload file
    uploadFile: async (selector: string, file: File) => {
      const input = screen.getByTestId(selector);
      await reactTest.user.upload(input, file);
    },
  },
};

// Mock utilities
export const mocks = {
  // Mock fetch
  fetch: (response: any, status: number = 200) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
      } as Response)
    );
  },

  // Mock console methods
  console: () => {
    const originalConsole = { ...console };
    
    // Mock console methods
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    return {
      ...originalConsole,
      restore: () => {
        mockLog.mockRestore();
        mockError.mockRestore();
        mockWarn.mockRestore();
      }
    };
  },

  // Mock localStorage
  localStorage: () => {
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    return localStorageMock;
  },

  // Mock window.location
  location: (url: string = 'http://localhost:3000') => {
    delete (window as any).location;
    window.location = new URL(url) as any;
  },

  // Mock Date
  date: (date: string | Date) => {
    const mockDate = new Date(date);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    return mockDate;
  },

  // Mock Math.random
  random: (value: number = 0.5) => {
    jest.spyOn(Math, 'random').mockReturnValue(value);
  },
};

// Test helpers
export const testHelpers = {
  // Wait for element to appear
  waitForElement: async (selector: string, timeout: number = 5000) => {
    return waitFor(() => screen.getByTestId(selector), { timeout });
  },

  // Wait for text to appear
  waitForText: async (text: string, timeout: number = 5000) => {
    return waitFor(() => screen.getByText(text), { timeout });
  },

  // Create file for testing
  createFile: (name: string = 'test.txt', content: string = 'test content', type: string = 'text/plain') => {
    return new File([content], name, { type });
  },

  // Create image file for testing
  createImageFile: (name: string = 'test.jpg') => {
    return new File([''], name, { type: 'image/jpeg' });
  },

  // Sleep/delay
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random string
  randomString: (length: number = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },

  // Generate random number
  randomNumber: (min: number = 0, max: number = 100) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

// Performance testing utilities
export const performanceTest = {
  // Measure function execution time
  measureTime: async <T>(fn: () => Promise<T> | T): Promise<{ result: T; time: number }> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return { result, time: end - start };
  },

  // Measure multiple executions
  measureMultiple: async <T>(
    fn: () => Promise<T> | T,
    iterations: number = 10
  ): Promise<{ results: T[]; times: number[]; average: number; min: number; max: number }> => {
    const results: T[] = [];
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { result, time } = await performanceTest.measureTime(fn);
      results.push(result);
      times.push(time);
    }

    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    return { results, times, average, min, max };
  },

  // Assert performance threshold
  assertPerformance: (actualTime: number, maxTime: number, message?: string) => {
    if (actualTime >= maxTime) {
      throw new Error(`Performance assertion failed: ${actualTime}ms >= ${maxTime}ms`);
    }
    if (message) {
      console.log(`${message}: ${actualTime}ms (max: ${maxTime}ms)`);
    }
  },
};

// Test suite helpers
export const testSuite = {
  // Setup test environment
  setup: async () => {
    await testDb.setup();
    mocks.console();
  },

  // Cleanup test environment
  cleanup: async () => {
    await testDb.cleanup();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  },

  // Setup for each test
  beforeEach: async () => {
    await testDb.clearCollections();
    jest.clearAllMocks();
  },

  // Create test context
  createContext: (overrides: any = {}) => ({
    user: mockData.user(),
    ...overrides,
  }),
};

// Export all utilities
export {
  render,
  screen,
  fireEvent,
  waitFor,
  userEvent,
  faker,
};

// Export default testing utilities
export default {
  db: testDb,
  mock: mockData,
  api: apiTest,
  react: reactTest,
  mocks,
  helpers: testHelpers,
  performance: performanceTest,
  suite: testSuite,
};