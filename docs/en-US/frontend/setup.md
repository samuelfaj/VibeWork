# Frontend Setup Guide

Complete guide to setting up the frontend development environment.

## Prerequisites

- Bun 1.0+
- Node.js 18+ (optional, for compatibility)
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Backend running on http://localhost:3000

## Step 1: Clone Repository

```bash
git clone <repo-url> VibeWork
cd VibeWork
```

## Step 2: Install Dependencies

```bash
cd frontend
bun install
```

This installs all dependencies from `package.json`:

- React, React DOM
- Vite
- TypeScript
- Ant Design
- TanStack Query
- Eden RPC
- i18next
- Testing libraries

## Step 3: Configure Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# Application
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=debug
```

**Variables Explained:**

| Variable           | Purpose              | Default               |
| ------------------ | -------------------- | --------------------- |
| `VITE_API_URL`     | Backend API URL      | http://localhost:3000 |
| `VITE_API_TIMEOUT` | Request timeout (ms) | 10000                 |
| `VITE_ENVIRONMENT` | Environment name     | development           |
| `VITE_LOG_LEVEL`   | Logging level        | debug                 |

### Production Configuration

```env
# Production
VITE_API_URL=https://api.example.com
VITE_ENVIRONMENT=production
VITE_LOG_LEVEL=warn
```

## Step 4: Start Development Server

```bash
cd frontend
bun run dev
```

**Expected Output:**

```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

### Access the Application

Open http://localhost:5173 in your browser.

## Step 5: Verify Setup

### Check Frontend is Running

1. Open http://localhost:5173
2. You should see login page
3. No console errors

### Check API Connection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to sign up or log in
4. Should see requests to http://localhost:3000

### Check Backend Connection

If you see CORS or connection errors:

```bash
# Ensure backend is running
curl http://localhost:3000/healthz

# Should return: {"status":"ok"}
```

## Development Commands

### Running Development Server

```bash
bun run dev
```

Hot reload enabled - changes appear immediately.

### Building for Production

```bash
bun run build
```

Creates optimized bundle in `dist/` directory.

### Preview Production Build

```bash
bun run preview
```

Serves built files locally for testing before deployment.

### Type Checking

```bash
bun run typecheck
```

Runs TypeScript type checking (no build).

### Code Quality

**Linting:**

```bash
bun run lint           # Check for issues
bun run lint:fix       # Auto-fix issues
```

**Formatting:**

```bash
bun run format         # Format code
bun run format:check   # Check formatting
```

**All at once:**

```bash
bun run lint:fix && bun run format && bun run typecheck
```

## Testing

### Unit Tests

```bash
bun run test           # Run once
bun run test:watch     # Watch mode
bun run test:coverage  # Coverage report
```

### E2E Tests

From `/e2e` workspace:

```bash
bun run test:e2e              # Headless
bun run test:e2e:headed       # With browser
bun run test:e2e:debug        # Debug mode
```

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src",
      "sourceMaps": true
    }
  ]
}
```

### Browser DevTools

**React DevTools:**

1. Install extension for [Chrome](https://chrome.google.com/webstore) or [Firefox](https://addons.mozilla.org/firefox/)
2. Open DevTools (F12)
3. Find "Components" tab
4. Inspect React components

**Network Tab:**

1. Open DevTools (F12)
2. Go to Network tab
3. Make requests to see API calls
4. Check response data and status

**Console:**

1. Open DevTools (F12)
2. Go to Console tab
3. Check for errors and warnings
4. Run JavaScript commands

### Logging

Enable debug logging:

```typescript
// In components
console.log('Debug info:', data)

// Or use localStorage
localStorage.debug = 'vibe:*'
```

## IDE Setup

### VS Code

**Recommended Extensions:**

- ESLint
- Prettier - Code formatter
- Vite
- Tailwind CSS IntelliSense (optional)

**Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### WebStorm/IntelliJ IDEA

1. Open project
2. Configure Node interpreter (Bun)
3. Set up run configuration:
   - Working directory: `frontend/`
   - Script: `dev`

## Common Issues and Solutions

### Port Already in Use

```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
VITE_PORT=5174 bun run dev
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install

# Or use fresh install flag
bun install --force
```

### API Connection Errors

**CORS Error:**

```
Access to XMLHttpRequest at 'http://localhost:3000/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**

1. Ensure backend is running
2. Check `VITE_API_URL` is correct
3. Verify backend CORS configuration

**Timeout Error:**

```
Fetch timeout
```

**Solution:**

1. Check backend is responding: `curl http://localhost:3000/healthz`
2. Increase timeout: `VITE_API_TIMEOUT=20000`
3. Check network for slow responses

### Type Errors

```bash
# Run type checking
bun run typecheck

# Check for errors
# Fix errors in affected files
# Re-run typecheck
```

### Build Errors

```bash
# Clean build
bun run clean
bun run build

# Check output
ls -la dist/

# Verify no errors
# Try preview
bun run preview
```

## Environment File Checklist

- [ ] `.env.local` file created
- [ ] `VITE_API_URL` set correctly
- [ ] Backend is running
- [ ] No TypeScript errors (`bun run typecheck`)
- [ ] Dev server starts without errors
- [ ] Can access http://localhost:5173
- [ ] Can see API requests in Network tab

## Troubleshooting Checklist

- [ ] Bun installed and up to date
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] `.env.local` file configured
- [ ] Backend running on http://localhost:3000
- [ ] No port conflicts (5173)
- [ ] No TypeScript errors
- [ ] No CORS errors in console
- [ ] Can sign up/login successfully

## Project File Structure

```
frontend/
├── src/
│   ├── main.tsx          # Entry point
│   ├── App.tsx           # Root component
│   ├── features/         # Feature modules
│   ├── lib/              # Utilities (api, query, etc.)
│   ├── i18n/             # Translations
│   └── __tests__/        # Tests
├── public/               # Static files
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── playwright.config.ts  # E2E test configuration
├── package.json          # Dependencies
└── .env.example          # Example env file
```

## First Run Checklist

1. ✅ Clone repository
2. ✅ `cd frontend`
3. ✅ `bun install`
4. ✅ Create `.env.local`
5. ✅ `bun run dev`
6. ✅ Open http://localhost:5173
7. ✅ Verify API connection
8. ✅ Try signing up
9. ✅ Check console for errors
10. ✅ Start developing!

## Next Steps

1. **Understand Components**: Read [Components Guide](./components.md)
2. **Learn State Management**: Read [State Management Guide](./state-management.md)
3. **Explore API Integration**: Review `src/lib/api.ts`
4. **Learn i18n**: Read [Internationalization Guide](./internationalization.md)
5. **Run Tests**: `bun run test`
6. **Make a Change**: Modify a component and see hot reload
7. **Commit Changes**: Follow [Contributing Guide](../contributing.md)

## Getting Help

- Check browser console for errors (F12)
- Review [Debugging](#debugging) section
- Check [Common Issues](#common-issues-and-solutions)
- Review component source code in `src/features/`
- Read test files for usage examples
- Check [Architecture Overview](../architecture.md)

---

**Last Updated**: December 2024
