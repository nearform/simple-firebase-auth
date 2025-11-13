# Simple Firebase Auth - Implementation Plan

## Overview

Create two standalone packages that provide Firebase authentication for static Firebase hosting + Cloud Functions apps. These packages abstract the auth implementation from `ai-tools-dashboard` and `simple-gcp-site`.

---

## Package 1: `simple-firebase-auth-frontend`

### Purpose

Frontend package for React apps using Firebase Auth with Google Sign-In, optimized for ESM delivery via esm.sh.

### Structure

```
packages/simple-firebase-auth-frontend/
├── package.json
├── README.md
├── src/
│   ├── index.js                 # Main exports
│   ├── config.js                # Firebase config initialization
│   ├── auth.js                  # Auth instance and emulator setup
│   ├── use-auth.js              # Core useAuth hook
│   ├── auth-context.js          # React Context provider
│   └── fetch.js                 # Authenticated fetch wrapper
```

### Dependencies (Minimal)

```json
{
  "dependencies": {},
  "peerDependencies": {
    "react": "^18.0.0",
    "firebase": "^10.0.0 || ^11.0.0"
  }
}
```

**Note**:

- **Zero runtime dependencies** - keeps package ultra-lightweight
- `react` and `firebase` are peer dependencies (user must install)
- User is responsible for Firebase initialization via `initializeApp()`

### Core Features

#### 1. **Config & Initialization** (`config.js`)

- **User initializes Firebase separately** (not handled by this package)
- Store package-specific config (auth domain, emulator URL, Google Auth options)
- Provide clear documentation on Firebase initialization requirements
- Simple config storage for package settings

#### 2. **Auth Instance** (`auth.js`)

- Get Firebase Auth instance via `getAuth()` (expects user to have initialized Firebase)
- **Configurable** emulator connection (user provides URL, package connects if configured)
- Lazy initialization pattern

#### 3. **useAuth Hook** (`use-auth.js`)

- Track auth state (user, loading, error)
- Google Sign-In with popup
- **Configurable** auth domain restriction (e.g., `@nearform.com`)
- **Configurable** Google Auth Provider options (scopes, custom parameters)
- Sign out functionality
- Error handling for:
  - Popup closed by user (not an error)
  - Account exists with different credential
  - Generic sign-in failures
- Return: `{ user, loading, error, isSignedIn, signIn, signOut }`

#### 4. **Auth Context** (`auth-context.js`)

- React Context wrapper using `useAuth` hook
- `AuthProvider` component
- `useAuthContext` hook for consumers
- Error if used outside provider

#### 5. **Authenticated Fetch** (`fetch.js`)

- Wrapper around native `fetch`
- Auto-inject `Authorization: Bearer <token>` header
- Get fresh ID token for each request
- Gracefully handle unauthenticated requests

### API Design

```javascript
// 1. Initialize Firebase first (USER RESPONSIBILITY)
import { initializeApp } from "firebase/app";

const FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

initializeApp(FIREBASE_CONFIG);

// 2. Initialize simple-firebase-auth (OPTIONAL CONFIG)
import { initAuth } from "@nearform/simple-firebase-auth-frontend";

initAuth({
  googleAuthDomain: "nearform.com", // Optional: restrict to specific email domain
  emulatorAuthUrl: "http://127.0.0.1:9099", // Optional: for local dev
  googleAuthOptions: {
    // Optional: customize Google Auth Provider
    scopes: ["https://www.googleapis.com/auth/userinfo.email"],
    customParameters: {
      hd: "nearform.com", // Hosted domain hint
      prompt: "select_account",
    },
  },
});

// 3. Wrap app with AuthProvider
import { AuthProvider } from "@nearform/simple-firebase-auth-frontend";

<AuthProvider>
  <App />
</AuthProvider>;

// 3. Use auth in components
import { useAuthContext } from "@nearform/simple-firebase-auth-frontend";

function MyComponent() {
  const { user, loading, error, isSignedIn, signIn, signOut } =
    useAuthContext();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return isSignedIn ? (
    <button onClick={signOut}>Sign Out</button>
  ) : (
    <button onClick={signIn}>Sign In with Google</button>
  );
}

// 4. Make authenticated requests
import { fetchWithAuth } from "@nearform/simple-firebase-auth-frontend";

const { user } = useAuthContext();
const response = await fetchWithAuth(user)("/api/data");
```

### ESM.sh Usage Guidance

**IMPORTANT**: You must initialize Firebase before using this package.

```html
<!-- In your HTML file -->
<script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18.3.1",
      "firebase/app": "https://esm.sh/firebase@11.0.1/app",
      "firebase/auth": "https://esm.sh/firebase@11.0.1/auth",
      "@nearform/simple-firebase-auth-frontend": "https://esm.sh/@nearform/simple-firebase-auth-frontend@0.1.0"
    }
  }
</script>

<script type="module">
  import { initializeApp } from "firebase/app";

  // Step 1: Initialize Firebase (YOUR responsibility)
  initializeApp({
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    // ... rest of config
  });

  // Step 2: Then initialize auth package (optional config)
  import { initAuth } from "@nearform/simple-firebase-auth-frontend";
  initAuth({
    googleAuthDomain: "nearform.com",
    emulatorAuthUrl: "http://127.0.0.1:9099",
  });
</script>
```

### Testing Strategy

- Unit tests for individual functions
- Integration tests for auth flow
- Emulator-based testing

---

## Package 2: `simple-firebase-auth-backend`

### Purpose

Backend package for Firebase Cloud Functions that enforces authentication on Fastify routes.

### Structure

```
packages/simple-firebase-auth-backend/
├── package.json
├── README.md
├── src/
│   ├── index.js                 # Main exports
│   ├── config.js                # Backend config constants
│   ├── auth.js                  # Token verification & validation
│   └── fastify.js               # Fastify adapter with auth
```

### Dependencies (Minimal)

```json
{
  "dependencies": {},
  "peerDependencies": {
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.0.0",
    "fastify": "^5.0.0",
    "@fastify/auth": "^5.0.0"
  }
}
```

**Note**:

- **Zero runtime dependencies** - keeps package ultra-lightweight
- Core Firebase and Fastify packages are peer dependencies to avoid version conflicts
- User is responsible for Firebase Admin initialization via `admin.initializeApp()`

### Core Features

#### 1. **Configuration** (`config.js`)

- Functions rewrite prefix (default: `/api`)
- **Configurable** Google auth domain restriction (optional)
- Store package-specific settings

#### 2. **Auth Verification** (`auth.js`)

- Extract ID token from `Authorization: Bearer <token>` header
- Verify token using Firebase Admin SDK
- Validate email domain (optional)
- Clear error messages for debugging
- Functions:
  - `getIdToken(request)` - Extract & verify token
  - `isValidAuth(idToken, domain?)` - Validate auth
  - `verifyAuthToken(request, domain?)` - Combined verification

#### 3. **Fastify Adapter** (`fastify.js`)

- **User initializes Firebase Admin separately** (not handled by this package)
- Create Fastify instance with URL rewriting
- JSON payload adaptation for Cloud Functions
- Singleton pattern (reuse instance across invocations)
- Two route registration callbacks:
  - `addNoAuthRoutes(fastify)` - Public routes
  - `addAuthRoutes(fastify)` - Protected routes with auth preHandler
- Export Firebase Functions `onRequest` handler
- Provide clear documentation on Firebase Admin initialization requirements

### API Design

```javascript
// In your Cloud Functions index.js

// Step 1: Initialize Firebase Admin (YOUR responsibility)
import admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions";

admin.initializeApp();
setGlobalOptions({ maxInstances: 5 });

// Step 2: Use the Fastify adapter
import { adaptFastify } from "@nearform/simple-firebase-auth-backend";

export const api = adaptFastify({
  googleAuthDomain: "nearform.com", // Optional: restrict to domain
  functionsRewritePrefix: "/api", // Optional: default "/api"

  // Register public routes (no auth required)
  addNoAuthRoutes: async (fastify) => {
    fastify.get("/", async () => ({
      message: "Public API works",
    }));

    fastify.get("/health", async () => ({
      status: "ok",
    }));
  },

  // Register protected routes (auth required)
  addAuthRoutes: async (fastify) => {
    // All routes here automatically have auth preHandler
    fastify.get("/user", async (request) => {
      // request.user contains decoded token
      return {
        email: request.user.email,
      };
    });

    fastify.get("/data", async () => {
      return {
        data: "sensitive information",
      };
    });
  },
});
```

### Advanced Usage (Manual Auth)

For custom auth logic:

```javascript
import { verifyAuthToken } from "@nearform/simple-firebase-auth-backend";

fastify.get("/custom", async (request, reply) => {
  try {
    const decodedToken = await verifyAuthToken(request, "nearform.com");
    return { email: decodedToken.email };
  } catch (error) {
    reply.code(401).send({ error: error.message });
  }
});
```

### Error Handling

- 401 for missing/invalid token
- 403 for valid token but wrong email domain
- Clear error messages for debugging

---

## Implementation Approach

### Phase 1: Backend Package (Simpler, No UI)

1. Create `packages/simple-firebase-auth-backend/` structure
2. Write `package.json` with peer dependencies (zero runtime deps)
3. Implement `config.js` - Config constants
4. Implement `auth.js` - Token verification (assumes admin.initializeApp() called)
5. Implement `fastify.js` - Fastify adapter (does NOT call admin.initializeApp())
6. Create `index.js` with exports
7. Write comprehensive `README.md` with:
   - **Clear Firebase Admin initialization requirements**
   - Usage examples showing proper separation
   - Configuration options

### Phase 2: Frontend Package

1. Create `packages/simple-firebase-auth-frontend/` structure
2. Write `package.json` with peer dependencies (zero runtime deps)
3. Implement `config.js` - Package config storage (NOT Firebase init)
4. Implement `auth.js` - Auth instance getter & emulator connection
5. Implement `use-auth.js` - Core hook
6. Implement `auth-context.js` - React Context
7. Implement `fetch.js` - Authenticated fetch
8. Create `index.js` with exports
9. Write comprehensive `README.md` with:
   - **Clear Firebase initialization requirements**
   - Installation from npm
   - ESM.sh usage with Firebase init example
   - Import maps example
   - Full usage guide with separation of concerns

### Phase 3: Documentation

1. Add root `README.md` with overview
2. Add comprehensive usage examples in both package READMEs
3. Include simple SignIn button component example in frontend README
4. Document peer dependency requirements
5. Add JSDoc comments to all exports
6. Document all configuration options

---

## Key Design Principles

### 1. **Zero Runtime Dependencies**

- **ZERO** runtime dependencies in both packages
- Use peer dependencies for all external libraries
- No unnecessary utility libraries
- Keep bundle size as small as possible

### 2. **Framework Agnostic (where possible)**

- Frontend: React-based but core logic extractable
- Backend: Fastify-based but auth logic standalone

### 3. **Developer Experience**

- Clear error messages
- Comprehensive README files
- Type-safe where possible (JSDoc)
- Sensible defaults

### 4. **Production Ready**

- Singleton patterns for Cloud Functions efficiency
- Proper error handling
- Emulator support for local development
- Security best practices (token verification, domain restriction)

### 5. **Separation of Concerns**

- **User controls Firebase initialization** (we don't hide it)
- Packages focus solely on auth logic and convenience
- Clear documentation on what user must do vs what package does
- Packages work independently or together
- Config options for common variations
- Manual auth API for custom logic

---

## Testing Strategy

### Frontend

- Test `useAuth` hook with Firebase Auth mocks
- Test context provider wrapping
- Test `fetchWithAuth` token injection
- Test error handling scenarios

### Backend

- Test token extraction and verification
- Test domain validation
- Test Fastify route registration
- Test error responses
- Integration tests with Firebase Auth emulator

---

## Publishing Considerations

### Package Names

- `@nearform/simple-firebase-auth-frontend`
- `@nearform/simple-firebase-auth-backend`

### Versioning

- Start with `0.1.0` (unstable API)
- Follow semver strictly
- Keep frontend & backend versions in sync initially

### NPM Fields

```json
{
  "main": "./src/index.js",
  "type": "module",
  "exports": {
    ".": "./src/index.js"
  },
  "files": ["src", "README.md"],
  "license": "MIT"
}
```

### ESM.sh Compatibility

- Ensure all imports are explicit (no bare imports without peer deps)
- Test with esm.sh before publishing
- Document import maps usage

---

## Future Enhancements (Out of Scope)

- TypeScript definitions
- Support for other auth providers (GitHub, email/password)
- Built-in UI components
- Session management
- Refresh token handling
- Multiple auth domain support
- Custom claims validation
- Rate limiting hooks
- Audit logging

---

## Success Criteria

### Must Have

✅ Both packages installable via npm
✅ Frontend works with esm.sh
✅ Backend works with Firebase Cloud Functions
✅ Clear documentation with examples
✅ Minimal dependencies
✅ Emulator support for local dev
✅ Domain-restricted authentication
✅ Error handling for common scenarios

### Nice to Have

- JSDoc comments for IDE support (INCLUDE THIS)
- Automated tests
- CI/CD for publishing

---

## Timeline Estimate

- Phase 1 (Backend): 2-3 hours
- Phase 2 (Frontend): 3-4 hours
- Phase 3 (Docs): 1-2 hours
- **Total**: ~6-9 hours

---

## Decisions Made

1. ✅ Use `@nearform` scope for both packages
2. ✅ No TypeScript definitions initially (JSDoc only)
3. ✅ No separate example projects - include examples in package READMEs
4. ✅ Google auth only - make domain restriction fully configurable
5. ✅ No UI components - provide simple example in README
6. ✅ Expose `googleAuthOptions` object for full Google Auth Provider customization (scopes, customParameters, etc.)
7. ✅ **Zero runtime dependencies** - all dependencies are peer dependencies
8. ✅ **User handles Firebase initialization** - package does NOT call `initializeApp()` or `admin.initializeApp()`, with extensive documentation on proper setup

---

## References

### Primary Reference

- `ai-tools-dashboard/frontend/firebase/` - Modern, clean implementation
- `ai-tools-dashboard/backend/firebase/` - Fastify adapter pattern

### Secondary Reference

- `simple-gcp-site/public/app/firebase/` - Older but similar patterns
- `simple-gcp-site/functions/` - Alternative backend structure

### Key Patterns to Extract

1. **Frontend**: Emulator detection, domain restriction, error handling
2. **Backend**: Singleton Fastify instance, URL rewriting, auth preHandler
3. **Both**: Clear separation of public/private routes
