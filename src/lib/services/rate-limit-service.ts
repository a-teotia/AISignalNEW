import { IRateLimitService, RateLimitConfig, RateLimitStatus, ServiceHealth } from './types';

interface RateLimitEntry {
  requestTimes: number[];
  queue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    operation: () => Promise<any>;
    addedAt: number;
  }>;
  isProcessing: boolean;
  config: RateLimitConfig;
}

export class RateLimitService implements IRateLimitService {
  public readonly serviceName = 'RateLimitService';
  
  private limiters = new Map<string, RateLimitEntry>();
  private health: ServiceHealth = {
    isHealthy: true,
    lastCheck: Date.now(),
    successRate: 1.0,
    totalRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0
  };
  private cleanupInterval?: NodeJS.Timeout;
  private readonly defaultConfig: RateLimitConfig;

  constructor(defaultConfig?: RateLimitConfig) {
    this.defaultConfig = defaultConfig || {
      maxRequests: 10,
      windowMs: 1000,
      queueLimit: 100
    };
  }

  async initialize(): Promise<void> {
    console.log(`🚀 Initializing ${this.serviceName}...`);
    
    // Start periodic cleanup of old request times
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000); // Cleanup every 30 seconds

    this.health.isHealthy = true;
    this.health.lastCheck = Date.now();
    
    console.log(`✅ ${this.serviceName} initialized successfully`);
  }

  async checkLimit(key: string, config?: RateLimitConfig): Promise<boolean> {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      const limiter = this.getLimiter(key, config);
      const now = Date.now();
      
      // Clean old request times
      limiter.requestTimes = limiter.requestTimes.filter(
        time => now - time < limiter.config.windowMs
      );
      
      const canProceed = limiter.requestTimes.length < limiter.config.maxRequests;
      
      this.updateHealth(startTime, true);
      return canProceed;
      
    } catch (error) {
      console.error(`❌ Rate limit check error for ${key}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return false;
    }
  }

  async executeWithLimit<T>(
    key: string,
    operation: () => Promise<T>,
    config?: RateLimitConfig
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const limiter = this.getLimiter(key, config);
      
      // Check queue limit
      if (limiter.queue.length >= (limiter.config.queueLimit || 100)) {
        reject(new Error(`Rate limit queue full for ${key}`));
        return;
      }
      
      // Add to queue
      limiter.queue.push({
        resolve,
        reject,
        operation,
        addedAt: Date.now()
      });
      
      // Start processing if not already processing
      if (!limiter.isProcessing) {
        this.processQueue(key);
      }
    });
  }

  getStatus(key: string): RateLimitStatus {
    const limiter = this.limiters.get(key);
    
    if (!limiter) {
      return {
        remainingRequests: this.defaultConfig.maxRequests,
        resetTime: Date.now() + this.defaultConfig.windowMs,
        queueLength: 0,
        isLimited: false
      };
    }
    
    const now = Date.now();
    
    // Clean old request times
    limiter.requestTimes = limiter.requestTimes.filter(
      time => now - time < limiter.config.windowMs
    );
    
    const remainingRequests = Math.max(0, limiter.config.maxRequests - limiter.requestTimes.length);
    const oldestRequest = limiter.requestTimes[0];
    const resetTime = oldestRequest ? oldestRequest + limiter.config.windowMs : now;
    
    return {
      remainingRequests,
      resetTime,
      queueLength: limiter.queue.length,
      isLimited: remainingRequests === 0
    };
  }

  clearLimits(key?: string): void {
    if (key) {
      const limiter = this.limiters.get(key);
      if (limiter) {
        limiter.requestTimes = [];
        // Don't clear the queue as it contains pending operations
        console.log(`🧹 Cleared rate limits for ${key}`);
      }
    } else {
      for (const [limiterKey, limiter] of this.limiters.entries()) {
        limiter.requestTimes = [];
        console.log(`🧹 Cleared rate limits for ${limiterKey}`);
      }
    }
  }

  getHealth(): ServiceHealth {
    return { ...this.health };
  }

  async shutdown(): Promise<void> {
    console.log(`🛑 Shutting down ${this.serviceName}...`);
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    
    // Reject all pending operations
    for (const [key, limiter] of this.limiters.entries()) {
      limiter.queue.forEach(item => {
        item.reject(new Error('Rate limit service is shutting down'));
      });
      limiter.queue = [];
    }
    
    this.limiters.clear();
    this.health.isHealthy = false;
    
    console.log(`✅ ${this.serviceName} shutdown complete`);
  }

  // Additional utility methods

  /**
   * Get all active rate limiters
   */
  getActiveLimiters(): Array<{ key: string; status: RateLimitStatus }> {
    return Array.from(this.limiters.keys()).map(key => ({
      key,
      status: this.getStatus(key)
    }));
  }

  /**
   * Get rate limit statistics
   */
  getStats(): {
    totalLimiters: number;
    totalQueuedRequests: number;
    averageQueueLength: number;
    limitersAtCapacity: number;
  } {
    const limiters = Array.from(this.limiters.values());
    const totalQueuedRequests = limiters.reduce((sum, limiter) => sum + limiter.queue.length, 0);
    const limitersAtCapacity = limiters.filter(limiter => {
      const now = Date.now();
      const recentRequests = limiter.requestTimes.filter(
        time => now - time < limiter.config.windowMs
      ).length;
      return recentRequests >= limiter.config.maxRequests;
    }).length;

    return {
      totalLimiters: this.limiters.size,
      totalQueuedRequests,
      averageQueueLength: limiters.length > 0 ? totalQueuedRequests / limiters.length : 0,
      limitersAtCapacity
    };
  }

  /**
   * Force execute an operation bypassing rate limits (use with caution)
   */
  async forceExecute<T>(key: string, operation: () => Promise<T>): Promise<T> {
    console.warn(`⚠️ Force executing operation for ${key}, bypassing rate limits`);
    
    const startTime = Date.now();
    this.health.totalRequests++;
    
    try {
      const result = await operation();
      
      // Still record the request time for tracking
      const limiter = this.getLimiter(key);
      limiter.requestTimes.push(Date.now());
      
      this.updateHealth(startTime, true);
      return result;
    } catch (error) {
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      throw error;
    }
  }

  private getLimiter(key: string, config?: RateLimitConfig): RateLimitEntry {
    let limiter = this.limiters.get(key);
    
    if (!limiter) {
      limiter = {
        requestTimes: [],
        queue: [],
        isProcessing: false,
        config: config || this.defaultConfig
      };
      this.limiters.set(key, limiter);
    } else if (config) {
      // Update config if provided
      limiter.config = config;
    }
    
    return limiter;
  }

  private async processQueue(key: string): Promise<void> {
    const limiter = this.limiters.get(key);
    if (!limiter || limiter.isProcessing) return;
    
    limiter.isProcessing = true;
    
    while (limiter.queue.length > 0) {
      const now = Date.now();
      
      // Clean old request times
      limiter.requestTimes = limiter.requestTimes.filter(
        time => now - time < limiter.config.windowMs
      );
      
      // Check if we can process a request
      if (limiter.requestTimes.length < limiter.config.maxRequests) {
        const item = limiter.queue.shift();
        if (!item) break;
        
        // Check if request has timed out (been in queue too long)
        const queueTime = now - item.addedAt;
        if (queueTime > 60000) { // 60 second timeout
          item.reject(new Error(`Request timed out in rate limit queue after ${queueTime}ms`));
          continue;
        }
        
        // Record the request time
        limiter.requestTimes.push(now);
        
        try {
          const result = await item.operation();
          item.resolve(result);
        } catch (error) {
          item.reject(error);
        }
      } else {
        // Calculate wait time
        const oldestRequest = limiter.requestTimes[0];
        const waitTime = limiter.config.windowMs - (now - oldestRequest);
        
        if (waitTime > 0) {
          console.log(`⏱️ Rate limit reached for ${key}, waiting ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime + 10)); // +10ms buffer
        }
      }
    }
    
    limiter.isProcessing = false;
  }

  private cleanup(): void {
    const now = Date.now();
    let removedEntries = 0;
    
    for (const [key, limiter] of this.limiters.entries()) {
      // Clean old request times
      const originalLength = limiter.requestTimes.length;
      limiter.requestTimes = limiter.requestTimes.filter(
        time => now - time < limiter.config.windowMs
      );
      
      // Remove empty limiters that haven't been used recently
      if (limiter.requestTimes.length === 0 && 
          limiter.queue.length === 0 && 
          !limiter.isProcessing) {
        this.limiters.delete(key);
        removedEntries++;
      }
      
      // Clean timed-out queue items
      limiter.queue = limiter.queue.filter(item => {
        const queueTime = now - item.addedAt;
        if (queueTime > 60000) { // 60 second timeout
          item.reject(new Error(`Request timed out in rate limit queue after ${queueTime}ms`));
          return false;
        }
        return true;
      });
    }
    
    if (removedEntries > 0) {
      console.log(`🧹 Rate limit cleanup: removed ${removedEntries} unused limiters`);
    }
  }

  private updateHealth(startTime: number, success: boolean): void {
    const responseTime = Date.now() - startTime;
    
    // Update average response time using exponential moving average
    this.health.averageResponseTime = this.health.averageResponseTime * 0.9 + responseTime * 0.1;
    
    // Update success rate
    if (this.health.totalRequests > 0) {
      this.health.successRate = (this.health.totalRequests - this.health.failedRequests) / this.health.totalRequests;
    }
    
    this.health.lastCheck = Date.now();
    this.health.isHealthy = this.health.successRate > 0.8; // Consider healthy if >80% success rate
  }
}