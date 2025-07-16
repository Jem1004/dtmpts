// Comprehensive database utilities
import mongoose, { Connection, Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import env from './env';
import logger from './logger';
import performanceMonitor from './performance';
import cache from './cache';

// Database configuration
interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
  retryAttempts: number;
  retryDelay: number;
  enableQueryLogging: boolean;
  enableCaching: boolean;
  cacheTTL: number;
}

const DEFAULT_CONFIG: DatabaseConfig = {
  uri: env.MONGODB_URI,
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  },
  retryAttempts: 3,
  retryDelay: 1000,
  enableQueryLogging: env.NODE_ENV === 'development',
  enableCaching: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

// Database connection manager
class DatabaseManager {
  private connection: Connection | null = null;
  private config: DatabaseConfig;
  private isConnecting = false;
  private connectionPromise: Promise<Connection> | null = null;

  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupEventListeners();
  }

  // Connect to database
  async connect(): Promise<Connection> {
    if (this.connection?.readyState === 1) {
      return this.connection;
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this.attemptConnection();

    try {
      this.connection = await this.connectionPromise;
      return this.connection;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  // Attempt connection with retries
  private async attemptConnection(): Promise<Connection> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        logger.info(`Database connection attempt ${attempt}/${this.config.retryAttempts}`);
        
        const startTime = performance.now();
        await mongoose.connect(this.config.uri, this.config.options);
        const endTime = performance.now();

        performanceMonitor.recordMetric('database_connection_time', endTime - startTime);
        
        logger.info('Database connected successfully');
        return mongoose.connection;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Database connection attempt ${attempt} failed`, { error: error instanceof Error ? error.message : String(error) });

        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    throw new Error(`Failed to connect to database after ${this.config.retryAttempts} attempts: ${lastError?.message}`);
  }

  // Disconnect from database
  async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      logger.info('Database disconnected');
    }
  }

  // Get connection status
  getStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
  }

  // Check if connected
  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  // Setup event listeners
  private setupEventListeners(): void {
    mongoose.connection.on('connected', () => {
      logger.info('Database connection established');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('Database connection error', {}, error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Database connection lost');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Database reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global database manager instance
const dbManager = new DatabaseManager();

// Repository base class
export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;
  protected modelName: string;
  protected enableCaching: boolean;
  protected cacheTTL: number;

  constructor(
    model: Model<T>,
    options: {
      enableCaching?: boolean;
      cacheTTL?: number;
    } = {}
  ) {
    this.model = model;
    this.modelName = model.modelName;
    this.enableCaching = options.enableCaching ?? DEFAULT_CONFIG.enableCaching;
    this.cacheTTL = options.cacheTTL ?? DEFAULT_CONFIG.cacheTTL;
  }

  // Find by ID
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    const cacheKey = `${this.modelName}:findById:${id}`;
    
    if (this.enableCaching) {
      const cached = cache.get(cacheKey);
      if (cached) {
        performanceMonitor.recordMetric(`${this.modelName}_cache_hit`, 0);
        return cached;
      }
    }

    const startTime = performance.now();
    
    try {
      await dbManager.connect();
      const result = await this.model.findById(id, null, options);
      const endTime = performance.now();

      performanceMonitor.recordMetric(`${this.modelName}_findById`, endTime - startTime);
      
      if (this.enableCaching && result) {
        cache.set(cacheKey, result, this.cacheTTL);
      }

      if (DEFAULT_CONFIG.enableQueryLogging) {
        logger.debug(`${this.modelName}.findById`, { id, duration: endTime - startTime });
      }

      return result;
    } catch (error) {
      logger.error(`${this.modelName}.findById failed`, { id }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Find one document
  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    const cacheKey = `${this.modelName}:findOne:${JSON.stringify(filter)}`;
    
    if (this.enableCaching) {
      const cached = cache.get(cacheKey);
      if (cached) {
        performanceMonitor.recordMetric(`${this.modelName}_cache_hit`, 0);
        return cached;
      }
    }

    const startTime = performance.now();
    
    try {
      await dbManager.connect();
      const result = await this.model.findOne(filter, null, options);
      const endTime = performance.now();

      performanceMonitor.recordMetric(`${this.modelName}_findOne`, endTime - startTime);
      
      if (this.enableCaching && result) {
        cache.set(cacheKey, result, this.cacheTTL);
      }

      if (DEFAULT_CONFIG.enableQueryLogging) {
        logger.debug(`${this.modelName}.findOne`, { filter, duration: endTime - startTime });
      }

      return result;
    } catch (error) {
      logger.error(`${this.modelName}.findOne failed`, { filter }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Find multiple documents
  async find(
    filter: FilterQuery<T> = {},
    options?: QueryOptions & {
      page?: number;
      limit?: number;
      sort?: any;
    }
  ): Promise<{ data: T[]; total: number; page?: number; totalPages?: number }> {
    const { page, limit, sort, ...queryOptions } = options || {};
    const cacheKey = `${this.modelName}:find:${JSON.stringify({ filter, options })}`;
    
    if (this.enableCaching) {
      const cached = cache.get(cacheKey);
      if (cached) {
        performanceMonitor.recordMetric(`${this.modelName}_cache_hit`, 0);
        return cached;
      }
    }

    const startTime = performance.now();
    
    try {
      await dbManager.connect();
      
      let query = this.model.find(filter, null, queryOptions);
      
      if (sort) {
        query = query.sort(sort);
      }
      
      if (page && limit) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
      }
      
      const [data, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filter)
      ]);
      
      const endTime = performance.now();
      
      const result = {
        data,
        total,
        ...(page && limit && {
          page,
          totalPages: Math.ceil(total / limit)
        })
      };

      performanceMonitor.recordMetric(`${this.modelName}_find`, endTime - startTime);
      
      if (this.enableCaching) {
        cache.set(cacheKey, result, this.cacheTTL);
      }

      if (DEFAULT_CONFIG.enableQueryLogging) {
        logger.debug(`${this.modelName}.find`, { 
          filter, 
          resultCount: data.length, 
          duration: endTime - startTime 
        });
      }

      return result;
    } catch (error) {
      logger.error(`${this.modelName}.find failed`, { filter }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Create document
  async create(data: Partial<T>): Promise<T> {
    const startTime = performance.now();
    
    try {
      await dbManager.connect();
      const result = await this.model.create(data);
      const endTime = performance.now();

      performanceMonitor.recordMetric(`${this.modelName}_create`, endTime - startTime);
      
      // Invalidate related cache entries
      this.invalidateCache();

      if (DEFAULT_CONFIG.enableQueryLogging) {
        logger.debug(`${this.modelName}.create`, { 
          id: result._id, 
          duration: endTime - startTime 
        });
      }

      logger.info(`${this.modelName} created`, { id: result._id });
      return result;
    } catch (error) {
      logger.error(`${this.modelName}.create failed`, { data }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Update document by ID
  async updateById(
    id: string, 
    update: UpdateQuery<T>, 
    options: QueryOptions = { new: true }
  ): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      await dbManager.connect();
      const result = await this.model.findByIdAndUpdate(id, update, options);
      const endTime = performance.now();

      performanceMonitor.recordMetric(`${this.modelName}_updateById`, endTime - startTime);
      
      // Invalidate related cache entries
      this.invalidateCache(id);

      if (DEFAULT_CONFIG.enableQueryLogging) {
        logger.debug(`${this.modelName}.updateById`, { 
          id, 
          duration: endTime - startTime 
        });
      }

      if (result) {
        logger.info(`${this.modelName} updated`, { id });
      }
      
      return result;
    } catch (error) {
      logger.error(`${this.modelName}.updateById failed`, { id, update }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Delete document by ID
  async deleteById(id: string): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      await dbManager.connect();
      const result = await this.model.findByIdAndDelete(id);
      const endTime = performance.now();

      performanceMonitor.recordMetric(`${this.modelName}_deleteById`, endTime - startTime);
      
      // Invalidate related cache entries
      this.invalidateCache(id);

      if (DEFAULT_CONFIG.enableQueryLogging) {
        logger.debug(`${this.modelName}.deleteById`, { 
          id, 
          duration: endTime - startTime 
        });
      }

      if (result) {
        logger.info(`${this.modelName} deleted`, { id });
      }
      
      return result;
    } catch (error) {
      logger.error(`${this.modelName}.deleteById failed`, { id }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Count documents
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    const cacheKey = `${this.modelName}:count:${JSON.stringify(filter)}`;
    
    if (this.enableCaching) {
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        performanceMonitor.recordMetric(`${this.modelName}_cache_hit`, 0);
        return cached;
      }
    }

    const startTime = performance.now();
    
    try {
      await dbManager.connect();
      const result = await this.model.countDocuments(filter);
      const endTime = performance.now();

      performanceMonitor.recordMetric(`${this.modelName}_count`, endTime - startTime);
      
      if (this.enableCaching) {
        cache.set(cacheKey, result, this.cacheTTL);
      }

      if (DEFAULT_CONFIG.enableQueryLogging) {
        logger.debug(`${this.modelName}.count`, { 
          filter, 
          result, 
          duration: endTime - startTime 
        });
      }

      return result;
    } catch (error) {
      logger.error(`${this.modelName}.count failed`, { filter }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Aggregate query
  async aggregate(pipeline: any[]): Promise<any[]> {
    const cacheKey = `${this.modelName}:aggregate:${JSON.stringify(pipeline)}`;
    
    if (this.enableCaching) {
      const cached = cache.get(cacheKey);
      if (cached) {
        performanceMonitor.recordMetric(`${this.modelName}_cache_hit`, 0);
        return cached;
      }
    }

    const startTime = performance.now();
    
    try {
      await dbManager.connect();
      const result = await this.model.aggregate(pipeline);
      const endTime = performance.now();

      performanceMonitor.recordMetric(`${this.modelName}_aggregate`, endTime - startTime);
      
      if (this.enableCaching) {
        cache.set(cacheKey, result, this.cacheTTL);
      }

      if (DEFAULT_CONFIG.enableQueryLogging) {
        logger.debug(`${this.modelName}.aggregate`, { 
          pipelineLength: pipeline.length, 
          resultCount: result.length, 
          duration: endTime - startTime 
        });
      }

      return result;
    } catch (error) {
      logger.error(`${this.modelName}.aggregate failed`, { pipeline }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Invalidate cache entries
  private invalidateCache(id?: string): void {
    if (!this.enableCaching) return;
    
    const keys = cache.keys().filter(key => key.startsWith(`${this.modelName}:`));
    
    if (id) {
      // Invalidate specific ID-based entries
      const idKeys = keys.filter(key => key.includes(id));
      idKeys.forEach(key => cache.delete(key));
    } else {
      // Invalidate all entries for this model
      keys.forEach(key => cache.delete(key));
    }
  }

  // Get model statistics
  async getStats(): Promise<any> {
    try {
      await dbManager.connect();
      const db = mongoose.connection.db;
      const stats = await db.command({ collStats: this.model.collection.name });
      return stats;
    } catch (error) {
      logger.error(`${this.modelName}.getStats failed`, {}, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}

// Transaction helper
export class TransactionManager {
  private session: mongoose.ClientSession | null = null;

  async startTransaction(): Promise<void> {
    await dbManager.connect();
    this.session = await mongoose.startSession();
    this.session.startTransaction();
    logger.debug('Transaction started');
  }

  async commitTransaction(): Promise<void> {
    if (!this.session) {
      throw new Error('No active transaction');
    }
    
    await this.session.commitTransaction();
    await this.session.endSession();
    this.session = null;
    logger.debug('Transaction committed');
  }

  async abortTransaction(): Promise<void> {
    if (!this.session) {
      throw new Error('No active transaction');
    }
    
    await this.session.abortTransaction();
    await this.session.endSession();
    this.session = null;
    logger.debug('Transaction aborted');
  }

  getSession(): mongoose.ClientSession | null {
    return this.session;
  }

  async withTransaction<T>(operation: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
    await this.startTransaction();
    
    try {
      const result = await operation(this.session!);
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.abortTransaction();
      throw error;
    }
  }
}

// Database health check
export async function healthCheck(): Promise<{
  status: string;
  connected: boolean;
  readyState: number;
  host?: string;
  name?: string;
}> {
  try {
    const connection = mongoose.connection;
    
    return {
      status: dbManager.getStatus(),
      connected: dbManager.isConnected(),
      readyState: connection.readyState,
      host: connection.host,
      name: connection.name,
    };
  } catch (error) {
    logger.error('Database health check failed', {}, error instanceof Error ? error : new Error(String(error)));
    return {
      status: 'error',
      connected: false,
      readyState: 0,
    };
  }
}

// Export database manager and utilities
export {
  dbManager,
  DatabaseManager,
  type DatabaseConfig,
};

// Export connection function for backward compatibility
export const connectToDatabase = () => dbManager.connect();

// Export default database manager
export default dbManager;