// Performance Monitoring Service for 1000+ Users
import { performance } from 'perf_hooks';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'api' | 'database' | 'memory' | 'cpu' | 'network' | 'websocket';
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memoryUsage: {
    used: number;
    free: number;
    percentage: number;
  };
  cpuUsage: number;
  activeConnections: number;
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  throughput: number; // requests per second
}

interface EndpointMetrics {
  endpoint: string;
  method: string;
  totalRequests: number;
  averageResponseTime: number;
  errorCount: number;
  errorRate: number;
  slowestRequests: Array<{
    duration: number;
    timestamp: Date;
    userAgent?: string;
  }>;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private requestTimes: Map<string, number> = new Map();
  private endpointStats: Map<string, {
    count: number;
    totalTime: number;
    errors: number;
    slowRequests: Array<{ duration: number; timestamp: Date; userAgent?: string }>;
  }> = new Map();
  private startTime = Date.now();

  /**
   * Start timing a request or operation
   */
  startTimer(id: string): void {
    this.requestTimes.set(id, performance.now());
  }

  /**
   * End timing and record metric
   */
  endTimer(id: string, category: PerformanceMetric['category'], name: string): number {
    const startTime = this.requestTimes.get(id);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.requestTimes.delete(id);

    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      category
    });

    return duration;
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory bloat
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Record API request metrics
   */
  recordApiRequest(method: string, endpoint: string, duration: number, isError: boolean, userAgent?: string): void {
    const key = `${method} ${endpoint}`;
    
    if (!this.endpointStats.has(key)) {
      this.endpointStats.set(key, {
        count: 0,
        totalTime: 0,
        errors: 0,
        slowRequests: []
      });
    }

    const stats = this.endpointStats.get(key)!;
    stats.count++;
    stats.totalTime += duration;
    
    if (isError) {
      stats.errors++;
    }

    // Record slow requests (>2000ms)
    if (duration > 2000) {
      stats.slowRequests.push({
        duration,
        timestamp: new Date(),
        userAgent
      });

      // Keep only last 10 slow requests
      if (stats.slowRequests.length > 10) {
        stats.slowRequests = stats.slowRequests.slice(-10);
      }
    }

    // Record as metric
    this.recordMetric({
      name: `API Request: ${key}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      category: 'api'
    });
  }

  /**
   * Get current system health status
   */
  getSystemHealth(): SystemHealth {
    const memUsage = process.memoryUsage();
    const uptime = (Date.now() - this.startTime) / 1000;

    // Calculate response time stats from recent API metrics
    const recentApiMetrics = this.metrics
      .filter(m => m.category === 'api' && Date.now() - m.timestamp.getTime() < 300000) // Last 5 minutes
      .map(m => m.value);

    const responseTime = {
      average: recentApiMetrics.length > 0 ? 
        recentApiMetrics.reduce((a, b) => a + b, 0) / recentApiMetrics.length : 0,
      p95: this.getPercentile(recentApiMetrics, 95),
      p99: this.getPercentile(recentApiMetrics, 99)
    };

    // Calculate error rate
    const totalRequests = Array.from(this.endpointStats.values())
      .reduce((sum, stats) => sum + stats.count, 0);
    const totalErrors = Array.from(this.endpointStats.values())
      .reduce((sum, stats) => sum + stats.errors, 0);
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    // Memory usage percentage (rough estimate)
    const memoryPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    // Determine overall health status
    let status: SystemHealth['status'] = 'healthy';
    if (responseTime.average > 2000 || errorRate > 10 || memoryPercentage > 90) {
      status = 'critical';
    } else if (responseTime.average > 1000 || errorRate > 5 || memoryPercentage > 75) {
      status = 'warning';
    }

    return {
      status,
      uptime,
      memoryUsage: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        free: Math.round((memUsage.heapTotal - memUsage.heapUsed) / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage)
      },
      cpuUsage: this.getCurrentCpuUsage(),
      activeConnections: this.getActiveConnectionCount(),
      responseTime,
      errorRate: Math.round(errorRate * 100) / 100,
      throughput: this.getCurrentThroughput()
    };
  }

  /**
   * Get endpoint performance metrics
   */
  getEndpointMetrics(): EndpointMetrics[] {
    return Array.from(this.endpointStats.entries()).map(([key, stats]) => {
      const [method, endpoint] = key.split(' ', 2);
      return {
        endpoint,
        method,
        totalRequests: stats.count,
        averageResponseTime: Math.round(stats.totalTime / stats.count),
        errorCount: stats.errors,
        errorRate: Math.round((stats.errors / stats.count) * 100 * 100) / 100,
        slowestRequests: stats.slowRequests.slice(-5) // Last 5 slow requests
      };
    }).sort((a, b) => b.totalRequests - a.totalRequests); // Sort by request count
  }

  /**
   * Get performance alerts
   */
  getPerformanceAlerts(): Array<{
    severity: 'warning' | 'critical';
    message: string;
    category: string;
    timestamp: Date;
  }> {
    const alerts = [];
    const health = this.getSystemHealth();

    if (health.memoryUsage.percentage > 90) {
      alerts.push({
        severity: 'critical' as const,
        message: `High memory usage: ${health.memoryUsage.percentage}%`,
        category: 'memory',
        timestamp: new Date()
      });
    }

    if (health.responseTime.average > 2000) {
      alerts.push({
        severity: 'critical' as const,
        message: `High response time: ${Math.round(health.responseTime.average)}ms`,
        category: 'performance',
        timestamp: new Date()
      });
    }

    if (health.errorRate > 10) {
      alerts.push({
        severity: 'critical' as const,
        message: `High error rate: ${health.errorRate}%`,
        category: 'errors',
        timestamp: new Date()
      });
    }

    if (health.memoryUsage.percentage > 75) {
      alerts.push({
        severity: 'warning' as const,
        message: `Elevated memory usage: ${health.memoryUsage.percentage}%`,
        category: 'memory',
        timestamp: new Date()
      });
    }

    return alerts;
  }

  /**
   * Get performance metrics for specific category
   */
  getMetricsByCategory(category: PerformanceMetric['category'], hours: number = 1): PerformanceMetric[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.metrics.filter(m => 
      m.category === category && m.timestamp.getTime() > cutoff
    );
  }

  /**
   * Get real-time performance dashboard data
   */
  getDashboardData() {
    const health = this.getSystemHealth();
    const endpointMetrics = this.getEndpointMetrics().slice(0, 10); // Top 10 endpoints
    const alerts = this.getPerformanceAlerts();
    
    // Recent trends (last hour)
    const recentMetrics = this.metrics.filter(m => 
      Date.now() - m.timestamp.getTime() < 3600000
    );

    const metricsByCategory = {
      api: recentMetrics.filter(m => m.category === 'api').length,
      database: recentMetrics.filter(m => m.category === 'database').length,
      memory: recentMetrics.filter(m => m.category === 'memory').length,
      websocket: recentMetrics.filter(m => m.category === 'websocket').length
    };

    return {
      systemHealth: health,
      topEndpoints: endpointMetrics,
      alerts,
      metricCounts: metricsByCategory,
      recentActivity: recentMetrics.slice(-20) // Last 20 metrics
    };
  }

  /**
   * Clear old metrics and stats (housekeeping)
   */
  cleanup(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > oneDayAgo);
    
    console.log(`Performance Monitor: Cleaned up metrics, kept ${this.metrics.length} metrics`);
  }

  // Helper methods
  private getPercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private getCurrentCpuUsage(): number {
    // Mock CPU usage (in real app, would use actual CPU monitoring)
    return Math.random() * 40 + 20; // 20-60%
  }

  private getActiveConnectionCount(): number {
    // Mock active connections (in real app, would track actual connections)
    return Math.floor(Math.random() * 500) + 100; // 100-600 connections
  }

  private getCurrentThroughput(): number {
    // Calculate requests per second from recent metrics
    const recentRequests = this.metrics.filter(m => 
      m.category === 'api' && Date.now() - m.timestamp.getTime() < 60000
    ).length;
    return Math.round(recentRequests / 60 * 10) / 10; // requests per second
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Cleanup task (run every hour)
setInterval(() => {
  performanceMonitor.cleanup();
}, 60 * 60 * 1000);