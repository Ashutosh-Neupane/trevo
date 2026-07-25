# Section 17: Logging & Monitoring Strategy

## Current State
**No logging or monitoring infrastructure exists.** Errors are only logged to `console.error`.

## Proposed Solution

### 1. Structured Logging
```typescript
// lib/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  component?: string;
  error?: unknown;
  meta?: Record<string, unknown>;
}

class Logger {
  private level: LogLevel = 'info';
  
  constructor(private component: string) {}
  
  info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta);
  }
  
  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    this.log('error', message, { ...meta, error });
  }
  
  warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta);
  }
  
  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component: this.component,
      ...meta,
    };
    
    if (process.env.NODE_ENV === 'production') {
      // In production, send to logging service
      console.log(JSON.stringify(entry));
    } else {
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.component}]`;
      if (level === 'error') {
        console.error(prefix, message, meta?.error ?? '');
      } else {
        console.log(prefix, message, meta ?? '');
      }
    }
  }
}

export function createLogger(component: string): Logger {
  return new Logger(component);
}
```

### 2. Monitoring Integration
- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: Web Vitals and usage analytics
- **Custom API metrics**: Track endpoint usage, latency, error rates

### 3. API Metrics Middleware
```typescript
// lib/utils/metrics.ts
export async function withMetrics(handler: Function, route: string) {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    const result = await handler();
    const duration = Date.now() - start;
    
    // Log metric
    logger.info('API request completed', {
      route,
      duration,
      statusCode: result.status,
      requestId,
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('API request failed', error, { route, duration, requestId });
    throw error;
  }
}
```

### 4. Client-Side Error Tracking
- Add React Error Boundary with Sentry integration
- Track unhandled promise rejections
- Track console errors in production

### 5. Request ID Propagation
- Generate request ID in middleware
- Pass through API calls and log it
- Include in error responses for debugging

## Implementation Priority
1. Create structured logger
2. Add Sentry integration
3. Add request ID propagation
4. Add API metrics tracking
5. Add client-side error tracking
