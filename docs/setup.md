---
**Title:** Task WebApp Frontend - Setup Guide  
**Description:** Complete installation, environment setup, dependencies, and configuration instructions  
**Last Updated:** October 2, 2025  
**Status:** Production Ready
---

# Setup Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Development Setup](#development-setup)
- [Database Configuration](#database-configuration)
- [Troubleshooting Setup](#troubleshooting-setup)
- [Next Steps](#next-steps)
- [See Also](#see-also)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended Version | Download Link |
|----------|----------------|---------------------|---------------|
| **Node.js** | 18.0.0 | 20.x LTS | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0.0 | 10.x | Bundled with Node.js |
| **Git** | 2.30.0 | Latest | [git-scm.com](https://git-scm.com/) |
| **VS Code** | 1.80.0 | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "syler.sass-indented",
    "dsznajder.es7-react-js-snippets",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "visualstudioexptteam.vscodeintellicode"
  ]
}
```

Save this as `.vscode/extensions.json` in your project root.

### Knowledge Prerequisites

- **JavaScript ES6+** - Familiarity with modern JavaScript syntax
- **React Fundamentals** - Components, hooks, state management
- **Git Basics** - Clone, commit, push, pull, branches
- **Command Line** - Basic terminal/command prompt usage

> **Note:** If you're new to React, we recommend completing the [official React tutorial](https://react.dev/learn) first.

---

## System Requirements

### Development Machine

**Minimum:**
- CPU: Dual-core processor
- RAM: 4 GB
- Storage: 2 GB free space
- OS: Windows 10, macOS 10.15+, Ubuntu 20.04+

**Recommended:**
- CPU: Quad-core processor or better
- RAM: 8 GB or more
- Storage: 5 GB free space (SSD preferred)
- OS: Latest stable version

### Supported Browsers (Development)

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

### Production Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: 12.2+
- Android Chrome: 90+

---

## Installation

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/sajith231/TASK_WEBAPP_FRONTEND.git

# OR clone via SSH (if configured)
git clone git@github.com:sajith231/TASK_WEBAPP_FRONTEND.git

# Navigate to project directory
cd TASK_WEBAPP_FRONTEND
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - Production dependencies (~180 MB)
# - Development dependencies (~220 MB)
# - Total: ~400 MB
```

**Expected Output:**
```
added 1234 packages in 45s

123 packages are looking for funding
  run `npm fund` for details
```

> **Tip:** If you encounter errors, try clearing the npm cache:
> ```bash
> npm cache clean --force
> npm install
> ```

### Step 3: Verify Installation

```bash
# Check Node.js version
node --version
# Expected: v20.x.x or higher

# Check npm version
npm --version
# Expected: 10.x.x or higher

# Verify project structure
ls -la
# Should see: node_modules/, src/, public/, package.json, etc.
```

---

## Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# OR create manually
touch .env
```

### Step 2: Configure Environment Variables

Edit `.env` file with your configuration:

```bash
# ======================
# API Configuration
# ======================
VITE_API_BASE_URL=http://localhost:3001/api

# ======================
# Environment
# ======================
VITE_APP_ENV=development

# ======================
# Feature Flags (Optional)
# ======================
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false

# ======================
# Map Configuration (Optional)
# ======================
VITE_MAP_DEFAULT_LAT=0.0
VITE_MAP_DEFAULT_LNG=0.0
VITE_MAP_DEFAULT_ZOOM=13

# ======================
# Punch-In Configuration
# ======================
VITE_LOCATION_RADIUS_METERS=100
```

### Environment Files by Environment

| File | Purpose | Git Tracked |
|------|---------|-------------|
| `.env.example` | Template with all variables | ✅ Yes |
| `.env` | Local development | ❌ No |
| `.env.development` | Development overrides | ✅ Yes |
| `.env.production` | Production config | ✅ Yes (without secrets) |

### Configuration Object

The app loads configuration from `src/app/config.js`:

```javascript
// src/app/config.js
const config = {
  development: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
    API_TIMEOUT: 10000,
    LOG_LEVEL: 'warn',
    ENABLE_DEV_TOOLS: true,
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
    API_TIMEOUT: 15000,
    LOG_LEVEL: 'error',
    ENABLE_DEV_TOOLS: false,
  }
};

const environment = import.meta.env.MODE || 'development';
export default config[environment];
```

### Accessing Environment Variables

```jsx
// In components or services
import config from './app/config';

console.log(config.API_BASE_URL); // http://localhost:3001/api
console.log(config.API_TIMEOUT);  // 10000

// Direct access (less preferred)
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

> **Warning:** Never commit `.env` files with secrets to version control!

---

## Development Setup

### Step 1: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v7.0.4  ready in 423 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h to show help
```

The application will be available at `http://localhost:5173`

### Step 2: Configure Backend Connection

Ensure your backend API is running and accessible. Update `.env`:

```bash
# Local backend
VITE_API_BASE_URL=http://localhost:3001/api

# Remote development backend
VITE_API_BASE_URL=https://dev-api.taskwebapp.com/api

# Staging backend
VITE_API_BASE_URL=https://staging-api.taskwebapp.com/api
```

### Step 3: Test the Connection

1. Open browser to `http://localhost:5173`
2. Open DevTools Console (F12)
3. Navigate to Login page
4. Check for API connection errors

**Successful Connection:**
```
API Client initialized
Base URL: http://localhost:3001/api
```

**Connection Error:**
```
API Error: Network Error
Failed to connect to http://localhost:3001/api
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Check bundle size
npm run build -- --analyze
```

---

## Database Configuration

> **Note:** The frontend connects to the backend API, which manages the database. No direct database configuration is needed in the frontend.

### Backend API Requirements

The backend must provide these endpoints:

```
POST /login                    # Authentication
GET  /punch-in/active         # Get active punch-in
POST /punch-in                # Submit punch-in
POST /punch-out/:id           # Submit punch-out
GET  /customers               # Get customer list
GET  /dashboard/admin         # Admin dashboard data
GET  /dashboard/user          # User dashboard data
GET  /finance/cashbook        # Cash book entries
GET  /finance/bankbook        # Bank book entries
GET  /finance/debtors         # Debtor list
```

### API Response Format

Expected response format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "timestamp": "2025-10-02T10:30:00Z"
}
```

Error response format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-02T10:30:00Z"
}
```

---

## Troubleshooting Setup

### Common Issues & Solutions

#### 1. Port Already in Use

**Error:**
```
Port 5173 is already in use
```

**Solution:**
```bash
# Find and kill the process using port 5173
# On Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti :5173 | xargs kill -9

# OR use a different port
npm run dev -- --port 3000
```

#### 2. Node Version Mismatch

**Error:**
```
The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check your Node version
node --version

# Install correct version using nvm
nvm install 20
nvm use 20

# Verify
node --version  # Should be v20.x.x
```

#### 3. npm Install Fails

**Error:**
```
npm ERR! code EACCES
npm ERR! syscall access
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If permission issues persist (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
```

#### 4. Module Not Found

**Error:**
```
Error: Cannot find module 'axios'
```

**Solution:**
```bash
# Reinstall dependencies
npm install

# Install specific package
npm install axios

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. API Connection Refused

**Error:**
```
Network Error: connect ECONNREFUSED
```

**Solution:**
```bash
# 1. Check if backend is running
curl http://localhost:3001/api/health

# 2. Verify API_BASE_URL in .env
cat .env | grep VITE_API_BASE_URL

# 3. Check CORS configuration on backend
# Backend must allow your frontend origin

# 4. Try without trailing slash
VITE_API_BASE_URL=http://localhost:3001/api
# Not: http://localhost:3001/api/
```

#### 6. Sass Compilation Error

**Error:**
```
Sass error: Can't find stylesheet to import
```

**Solution:**
```bash
# Reinstall sass
npm uninstall sass
npm install sass@latest

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Getting Help

If you're still stuck:

1. **Check Existing Issues:** [GitHub Issues](https://github.com/sajith231/TASK_WEBAPP_FRONTEND/issues)
2. **Search Documentation:** Full-text search in `/docs`
3. **Ask for Help:** Create a new issue with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment details (OS, Node version, npm version)
   - Screenshots if applicable

---

## Next Steps

After successful setup:

1. **Read the Usage Guide** → [usage.md](./usage.md)
2. **Explore the Architecture** → [architecture.md](./architecture.md)
3. **Review Development Guide** → [development.md](./development.md)
4. **Check Code Examples** → [code-examples.md](./code-examples.md)

### Quick Start Checklist

- [ ] Node.js 20+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Development server running (`npm run dev`)
- [ ] Backend API accessible
- [ ] Application loads in browser
- [ ] Login page accessible
- [ ] No console errors

---

## See Also

- [Introduction](./introduction.md) - Project overview
- [Development Guide](./development.md) - Coding standards and workflows
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- [API Reference](./api-reference.md) - Backend API documentation
- [FAQ](./faq.md) - Frequently asked questions
