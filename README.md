# Simple Firebase Auth

Simple Firebase authentication packages for React frontend and Cloud Functions backend.

**Zero runtime dependencies. Peer dependencies only.**

## Packages

This monorepo contains two independent packages that work great together:

### [@nearform/simple-firebase-auth-frontend](./packages/simple-firebase-auth-frontend)

React hooks and components for Firebase authentication with Google Sign-In.

- Zero runtime dependencies
- ESM.sh compatible for no-build workflows
- React hooks (`useAuth`, `useAuthContext`)
- Context provider (`AuthProvider`)
- Authenticated fetch wrapper
- Configurable domain restriction
- Emulator support

```bash
npm install @nearform/simple-firebase-auth-frontend
```

[Frontend Documentation →](./packages/simple-firebase-auth-frontend/README.md)

### [@nearform/simple-firebase-auth-backend](./packages/simple-firebase-auth-backend)

Fastify adapter for Firebase Cloud Functions with authentication middleware.

- Zero runtime dependencies
- Built for Cloud Functions v2
- Fastify-based routing
- Token verification
- Domain restriction support
- Separate public/protected routes

```bash
npm install @nearform/simple-firebase-auth-backend
```

[Backend Documentation →](./packages/simple-firebase-auth-backend/README.md)

## Quick Start

### Prerequisites

Both packages require **you** to initialize Firebase yourself. They do NOT call `initializeApp()` or `admin.initializeApp()`.

### Frontend

```javascript
import { initializeApp } from "firebase/app";
import {
  initAuth,
  AuthProvider,
  useAuthContext,
} from "@nearform/simple-firebase-auth-frontend";

// Step 1: Initialize Firebase (YOUR responsibility)
initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // ... rest of config
});

// Step 2: Configure auth (optional)
initAuth({
  googleAuthDomain: "nearform.com",
  emulatorAuthUrl: "http://127.0.0.1:9099",
});

// Step 3: Use in your React app
function App() {
  return (
    <AuthProvider>
      <MyApp />
    </AuthProvider>
  );
}

function MyApp() {
  const { user, isSignedIn, signIn, signOut } = useAuthContext();

  return isSignedIn ? (
    <button onClick={signOut}>Sign Out</button>
  ) : (
    <button onClick={signIn}>Sign In with Google</button>
  );
}
```

### Backend

```javascript
import admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions";
import { adaptFastify } from "@nearform/simple-firebase-auth-backend";

// Step 1: Initialize Firebase Admin (YOUR responsibility)
admin.initializeApp();
setGlobalOptions({ maxInstances: 5 });

// Step 2: Create your API
export const api = adaptFastify({
  googleAuthDomain: "nearform.com",

  // Public routes (no auth)
  addNoAuthRoutes: async (fastify) => {
    fastify.get("/", async () => ({ message: "API works" }));
  },

  // Protected routes (auth required)
  addAuthRoutes: async (fastify) => {
    fastify.get("/user", async (request) => ({
      email: request.decodedToken.email,
    }));
  },
});
```

## Features

### Frontend Features

- **React Hooks**: `useAuth()` and `useAuthContext()` for auth state
- **Context Provider**: `<AuthProvider>` for app-wide auth
- **Authenticated Fetch**: `fetchWithAuth()` wrapper with token injection
- **Google Sign-In**: Popup-based authentication
- **Domain Restriction**: Limit sign-ins to specific email domains
- **Configurable**: Full control over Google Auth Provider options
- **Emulator Support**: Automatic detection and connection
- **Error Handling**: Graceful handling of auth errors
- **ESM.sh Ready**: Use directly from CDN with import maps

### Backend Features

- **Fastify Integration**: Fast, low-overhead routing
- **Token Verification**: Automatic JWT validation
- **Domain Restriction**: Validate user email domains
- **Route Separation**: Distinct public and protected routes
- **Middleware**: Auth preHandler for protected routes
- **Error Messages**: Clear, actionable error responses
- **Singleton Pattern**: Efficient instance reuse
- **URL Rewriting**: Cloud Functions URL prefix handling

## Design Philosophy

### Zero Dependencies

Both packages have **zero runtime dependencies**. All external libraries are peer dependencies, keeping your bundle small and avoiding version conflicts.

### User Controls Firebase Init

We **do not** call `initializeApp()` or `admin.initializeApp()`. You control Firebase initialization, giving you:

- Full control over Firebase setup
- Flexibility in configuration
- Clear separation of concerns
- No hidden magic

### Minimal & Focused

These packages do one thing well: Firebase authentication with Google Sign-In. They don't try to be everything.

### ESM First

Pure ES modules. Works with modern bundlers, import maps, and esm.sh.

## Project Structure

```
simple-firebase-auth/
├── packages/
│   ├── simple-firebase-auth-backend/
│   │   ├── src/
│   │   │   ├── index.js       # Main exports
│   │   │   ├── auth.js        # Token verification
│   │   │   └── fastify.js     # Fastify adapter
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── simple-firebase-auth-frontend/
│       ├── src/
│       │   ├── index.js       # Main exports
│       │   ├── config.js      # Config storage
│       │   ├── auth.js        # Auth instance
│       │   ├── use-auth.js    # Core hook
│       │   ├── auth-context.js # React Context
│       │   └── fetch.js       # Authenticated fetch
│       ├── package.json
│       └── README.md
│
├── package.json               # Workspace root
└── README.md                  # This file
```

## Local Development

### Setup

```bash
# Install dependencies
npm install

# Lint and format
npm run format
```

### Firebase Emulator

Both packages support Firebase emulators for local development:

```bash
firebase emulators:start
```

Configure frontend to use emulator:

```javascript
initAuth({
  emulatorAuthUrl: "http://127.0.0.1:9099",
});
```

Backend automatically works with emulator when using `admin.initializeApp()` locally.

## Use Cases

### Perfect For

- Firebase Hosting + Cloud Functions apps
- React frontends with Firebase backend
- No-build ESM workflows
- Domain-restricted authentication
- Simple Google Sign-In flows

### Not Designed For

- Multiple auth providers (only Google Sign-In)
- Custom UI flows (use Firebase Auth directly)
- Non-React frameworks (frontend only)
- Non-Fastify backends (backend only)

## Requirements

### Frontend

- React 18+
- Firebase 10 or 11
- Modern browser with ES modules support

### Backend

- Node.js 18+
- Firebase Admin SDK 13+
- Firebase Functions 6+
- Fastify 5+

## Contributing

Issues and PRs welcome!

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR

## License

MIT

## Credits

Built by [NearForm](https://nearform.com)

Extracted from real-world Firebase applications for easier reuse and maintenance.
