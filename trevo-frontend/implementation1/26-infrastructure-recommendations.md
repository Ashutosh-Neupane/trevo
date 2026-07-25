# Section 26: Infrastructure Recommendations

## Current State
- Single `Dockerfile` exists (not reviewed)
- No `docker-compose.yml`
- No infrastructure-as-code
- Hosted via Vercel or manual deployment

## Recommendations

### 1. Docker Configuration
```dockerfile
# Optimized multi-stage Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FRAPPE_BACKEND_URL=${FRAPPE_BACKEND_URL}
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Redis for session caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

### 3. Deployment Targets
| Target | Best For | Cost |
|--------|----------|------|
| Vercel | Serverless, quick deploys, edge functions | Pay-per-use |
| Docker (VPS) | Full control, persistent connections | Fixed monthly |
| Kubernetes | Scalability, complex deployments | High |

### 4. Monitoring Stack
- **Error Tracking**: Sentry
- **Performance**: Vercel Analytics / Lighthouse CI
- **Uptime**: Better Uptime or Pingdom
- **Logging**: Papertrail or Logtail

### 5. Environment Strategy
- **Development**: `.env.local`, local Frappe instance
- **Staging**: `.env.staging`, staging Frappe, preview deployments
- **Production**: `.env.production`, production Frappe, Vercel production

### 6. Infrastructure Requirements
- Node.js 20+ runtime
- Minimum 512MB RAM (for production)
- Access to Frappe backend (network connectivity)
- Redis 7+ (optional, for enhanced caching)
