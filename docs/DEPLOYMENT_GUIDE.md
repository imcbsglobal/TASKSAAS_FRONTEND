# Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Task WebApp Frontend to various environments, with special considerations for the modular architecture and production-ready features.

## 🏗️ Build Process

### Prerequisites
```bash
# Node.js version
node --version  # Should be >= 18.0.0

# Package manager
npm --version   # or yarn --version

# Environment variables
cp .env.example .env.production
```

### Build Commands
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Build with analysis
npm run build:analyze
```

### Build Output
```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Main bundle
│   ├── vendor-[hash].js    # Vendor dependencies
│   ├── punchin-[hash].js   # Punchin feature chunk
│   └── *.css               # Stylesheets
└── static/
    └── images/             # Optimized images
```

## 🌍 Environment Configuration

### Environment Variables
```bash
# .env.production
NODE_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=Task WebApp Frontend
VITE_LOG_LEVEL=error
VITE_CACHE_DURATION=300000
VITE_DEBOUNCE_DELAY=300

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=https://your-sentry-dsn

# Optional: Feature flags
VITE_ENABLE_PWA=true
VITE_ENABLE_SERVICE_WORKER=true
```

### Environment-Specific Configurations

#### Development (.env.development)
```bash
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001
VITE_LOG_LEVEL=debug
VITE_ENABLE_MOCK_API=true
```

#### Staging (.env.staging)
```bash
NODE_ENV=staging
VITE_API_BASE_URL=https://staging-api.yourdomain.com
VITE_LOG_LEVEL=warn
VITE_ENABLE_ANALYTICS=false
```

#### Production (.env.production)
```bash
NODE_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_LOG_LEVEL=error
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

## 🚀 Deployment Platforms

### 1. Vercel Deployment

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-api-domain.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api-base-url",
    "VITE_LOG_LEVEL": "@log-level"
  },
  "build": {
    "env": {
      "VITE_API_BASE_URL": "@api-base-url-build"
    }
  }
}
```

### 2. Netlify Deployment

#### Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Configuration (netlify.toml)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  VITE_API_BASE_URL = "https://api.yourdomain.com"

[[redirects]]
  from = "/api/*"
  to = "https://your-api-domain.com/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_LOG_LEVEL = "error"

[context.staging.environment]
  VITE_LOG_LEVEL = "warn"
  VITE_API_BASE_URL = "https://staging-api.yourdomain.com"
```

### 3. AWS S3 + CloudFront

#### Build and Deploy Script
```bash
#!/bin/bash
# deploy-aws.sh

# Build the application
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Create CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

#### CloudFormation Template (infrastructure.yml)
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Task WebApp Frontend Infrastructure'

Resources:
  S3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${AWS::StackName}-frontend'
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false
        IgnorePublicAcls: false
        RestrictPublicBuckets: false

  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        DefaultRootObject: index.html
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt S3Bucket.DomainName
            S3OriginConfig:
              OriginAccessIdentity: ''
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad
        CustomErrorResponses:
          - ErrorCode: 404
            ResponseCode: 200
            ResponsePagePath: /index.html
```

### 4. Docker Deployment

#### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration (nginx.conf)
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (optional)
        location /api/ {
            proxy_pass https://your-api-domain.com/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
}
```

#### Docker Compose (docker-compose.yml)
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped

  # Optional: Add backend service
  backend:
    image: your-backend-image
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Run E2E tests
        run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          VITE_LOG_LEVEL: error

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/

      - name: Deploy to Staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/

      - name: Deploy to Production
        run: |
          # Deploy to production environment
          echo "Deploying to production..."

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to production completed!'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## 📊 Performance Optimization

### Build Optimization
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'react-icons'],
          maps: ['leaflet'],
          punchin: [
            './src/features/punchin/components/Punchin.jsx',
            './src/features/punchin/components/wizard/CustomerSelectionStep.jsx',
            './src/features/punchin/components/wizard/PhotoCaptureStep.jsx',
            './src/features/punchin/components/wizard/LocationCaptureStep.jsx',
            './src/features/punchin/components/wizard/ConfirmationStep.jsx'
          ]
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### Performance Monitoring
```javascript
// src/utils/performance.js
export const measurePerformance = (name, fn) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} took ${end - start} milliseconds`);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      gtag('event', 'timing_complete', {
        name: name,
        value: Math.round(end - start)
      });
    }
    
    return result;
  };
};
```

## 🔒 Security Considerations

### Content Security Policy
```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.yourdomain.com;
">
```

### Environment Secrets
```bash
# Never commit these to version control
# Set in deployment platform environment variables

# Production secrets
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=https://your-sentry-dsn

# Deployment secrets (not exposed to client)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
VERCEL_TOKEN=your-vercel-token
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Build successful without warnings
- [ ] Environment variables configured
- [ ] Performance metrics verified
- [ ] Security scan completed
- [ ] Accessibility testing done
- [ ] Browser compatibility verified

### Post-Deployment
- [ ] Health check endpoints responding
- [ ] Analytics tracking working
- [ ] Error monitoring active
- [ ] Performance monitoring enabled
- [ ] User acceptance testing completed
- [ ] Rollback plan ready

### Monitoring Setup
- [ ] Application performance monitoring (APM)
- [ ] Error tracking (Sentry, Bugsnag)
- [ ] Analytics (Google Analytics, Mixpanel)
- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Log aggregation (LogRocket, FullStory)

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build

# Check for outdated dependencies
npm outdated
npm update
```

#### Environment Variable Issues
```bash
# Verify environment variables are loaded
npm run build -- --mode production

# Check Vite variable naming (must start with VITE_)
echo $VITE_API_BASE_URL
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check for memory leaks
npm run dev -- --profile
```

### Rollback Procedures

#### Vercel Rollback
```bash
# List deployments
vercel list

# Rollback to previous deployment
vercel rollback <deployment-url>
```

#### AWS Rollback
```bash
# Restore from backup
aws s3 sync s3://backup-bucket/ s3://production-bucket/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

This deployment guide ensures reliable, secure, and performant deployment of the Task WebApp Frontend across various platforms and environments.
