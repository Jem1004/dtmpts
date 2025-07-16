// Performance monitoring utilities
import { isDevelopment } from './env';

// Performance metrics interface
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Performance monitor class
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe navigation timing
    try {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart);
            this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
            this.recordMetric('first_byte', navEntry.responseStart - navEntry.fetchStart);
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    } catch (error) {
      console.warn('Navigation timing observer not supported:', error);
    }

    // Observe paint timing
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry.name.replace('-', '_'), entry.startTime);
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (error) {
      console.warn('Paint timing observer not supported:', error);
    }

    // Observe largest contentful paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordMetric('largest_contentful_paint', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }

    // Observe cumulative layout shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.recordMetric('cumulative_layout_shift', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }
  }

  // Record a custom metric
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      ...(metadata && { metadata }),
    };

    this.metrics.push(metric);

    if (isDevelopment) {
      console.log(`Performance Metric: ${name} = ${value}ms`, metadata);
    }

    // In production, you might want to send this to an analytics service
    // this.sendToAnalytics(metric);
  }

  // Get all metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Get metrics by name
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  // Get latest metric by name
  getLatestMetric(name: string): PerformanceMetric | undefined {
    const metrics = this.getMetricsByName(name);
    return metrics[metrics.length - 1];
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = [];
  }

  // Disconnect all observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  // Get performance summary
  getSummary() {
    const summary: Record<string, any> = {};
    
    const metricNames = Array.from(new Set(this.metrics.map(m => m.name)));
    
    metricNames.forEach(name => {
      const metrics = this.getMetricsByName(name);
      const values = metrics.map(m => m.value);
      
      summary[name] = {
        count: values.length,
        latest: values[values.length - 1],
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });
    
    return summary;
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Export the monitor instance
export default performanceMonitor;

// Utility functions for measuring performance

// Measure function execution time
export function measureFunction<T extends (...args: any[]) => any>(
  fn: T,
  name?: string
): T {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = fn(...args);
    const endTime = performance.now();
    
    const metricName = name || fn.name || 'anonymous_function';
    performanceMonitor.recordMetric(`function_${metricName}`, endTime - startTime);
    
    return result;
  }) as T;
}

// Measure async function execution time
export function measureAsyncFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name?: string
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = await fn(...args);
    const endTime = performance.now();
    
    const metricName = name || fn.name || 'anonymous_async_function';
    performanceMonitor.recordMetric(`async_function_${metricName}`, endTime - startTime);
    
    return result;
  }) as T;
}

// Measure API call performance
export async function measureApiCall<T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    
    performanceMonitor.recordMetric(`api_call_${endpoint}`, endTime - startTime, {
      status: 'success',
      endpoint,
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    
    performanceMonitor.recordMetric(`api_call_${endpoint}`, endTime - startTime, {
      status: 'error',
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    throw error;
  }
}

// Performance timing decorator
export function performanceTiming(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}_${propertyKey}`;
    
    descriptor.value = function (...args: any[]) {
      const startTime = performance.now();
      const result = originalMethod.apply(this, args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const endTime = performance.now();
          performanceMonitor.recordMetric(`method_${metricName}`, endTime - startTime);
        });
      } else {
        const endTime = performance.now();
        performanceMonitor.recordMetric(`method_${metricName}`, endTime - startTime);
        return result;
      }
    };
    
    return descriptor;
  };
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const recordMetric = (name: string, value: number, metadata?: Record<string, any>) => {
    performanceMonitor.recordMetric(name, value, metadata);
  };
  
  const measureRender = (componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      recordMetric(`component_render_${componentName}`, endTime - startTime);
    };
  };
  
  return {
    recordMetric,
    measureRender,
    getMetrics: () => performanceMonitor.getMetrics(),
    getSummary: () => performanceMonitor.getSummary(),
  };
}

// Web Vitals measurement
export function measureWebVitals() {
  if (typeof window === 'undefined') return;
  
  // Measure First Input Delay (FID)
  const measureFID = () => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Type assertion for PerformanceEventTiming which has processingStart
        const eventEntry = entry as PerformanceEventTiming;
        if ('processingStart' in eventEntry) {
          const fid = eventEntry.processingStart - eventEntry.startTime;
          performanceMonitor.recordMetric('first_input_delay', fid);
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID measurement not supported:', error);
    }
  };
  
  // Measure Time to First Byte (TTFB)
  const measureTTFB = () => {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.fetchStart;
      performanceMonitor.recordMetric('time_to_first_byte', ttfb);
    }
  };
  
  measureFID();
  measureTTFB();
}

// Initialize web vitals measurement when the module loads
if (typeof window !== 'undefined') {
  // Wait for the page to load before measuring
  if (document.readyState === 'complete') {
    measureWebVitals();
  } else {
    window.addEventListener('load', measureWebVitals);
  }
}

// Export utility functions
export {
  PerformanceMonitor,
  type PerformanceMetric,
};