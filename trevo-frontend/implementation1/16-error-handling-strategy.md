# Section 16: Error Handling Strategy

## Current State
Error handling is inconsistent across the codebase:

1. **API Routes**: Mixed patterns — some return `{ message: "..." }`, others return `{ error: "..." }`
2. **Client Axios Interceptor**: Catches 401/403 and redirects to login
3. **ErrorBoundary**: Single component-level error boundary
4. **React Query**: Default error handling with no central error handler
5. **No Toast Integration**: sonner Toast is set up but not used for API errors

## Proposed Error Handling Architecture

### 1. Standardized API Error Response
```typescript
// lib/utils/api-response.ts
interface ApiErrorResponse {
  success: false;
  error: {
    code: string; // e.g., "VALIDATION_ERROR", "AUTH_ERROR", "NOT_FOUND"
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

### 2. Centralized Error Handler
```typescript
// lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}
```

### 3. API Route Error Wrapper
```typescript
// lib/utils/api-handler.ts
import { NextResponse } from 'next/server';

export function withErrorHandler(handler: Function) {
  return async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { success: false, error: { code: error.code, message: error.message } },
          { status: error.statusCode }
        );
      }
      
      console.error('Unhandled error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
        { status: 500 }
      );
    }
  };
}
```

### 4. Global Error Handler (React Query)
```typescript
// providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
    mutations: {
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'An error occurred');
      },
    },
  },
});
```

### 5. Granular Error Boundaries
Create error boundaries per feature domain:
- `features/auth/AuthErrorBoundary.tsx`
- `features/doctype/DoctypeErrorBoundary.tsx`
- `features/workspace/WorkspaceErrorBoundary.tsx`
