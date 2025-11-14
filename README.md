# Simple Firebase Auth

Simple Firebase authentication packages for React frontend and Cloud Functions backend.

## Packages

### [@nearform/simple-firebase-auth-frontend](./packages/simple-firebase-auth-frontend)

React hooks and components for Firebase authentication with Google Sign-In.

```bash
$ npm install @nearform/simple-firebase-auth-frontend
```

_or_

```html
<script type="importmap">
  {
    "imports": {
      // ...
      "@nearform/simple-firebase-auth-frontend": "https://esm.sh/@nearform/simple-firebase-auth-frontend"
    }
  }
</script>
```

[Frontend Documentation →](./packages/simple-firebase-auth-frontend/README.md)

### [@nearform/simple-firebase-auth-backend](./packages/simple-firebase-auth-backend)

Fastify adapter for Firebase Cloud Functions with authentication middleware.

```bash
$ npm install @nearform/simple-firebase-auth-backend
```

[Backend Documentation →](./packages/simple-firebase-auth-backend/README.md)

## Quick Start

### Prerequisites

You must initialize Firebase yourself. We don't call `initializeApp()` or `admin.initializeApp()`.

### Frontend

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  AuthProvider,
  useAuthContext,
} from "@nearform/simple-firebase-auth-frontend";

const app = initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
});

const auth = getAuth(app);

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
}

function App() {
  const config = {
    googleAuthOptions: {
      customParameters: { hd: "nearform.com" },
    },
  };

  return (
    <AuthProvider auth={auth} config={config}>
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

admin.initializeApp();
setGlobalOptions({ maxInstances: 5 });

export const api = adaptFastify({
  googleAuthDomain: "nearform.com",

  addNoAuthRoutes: async (fastify) => {
    fastify.get("/", async () => ({ message: "API works" }));
  },

  addAuthRoutes: async (fastify) => {
    fastify.get("/user", async (request) => ({
      email: request.decodedToken.email,
    }));
  },
});
```

## Features

### Frontend

- React hooks (`useAuth`, `useAuthContext`) and `<AuthProvider>` context
- `fetchWithAuth()` for authenticated requests
- Google Sign-In popup with domain restriction
- Emulator support
- ESM.sh compatible

### Backend

- Fastify adapter for Cloud Functions
- Automatic JWT verification and domain validation
- Separate public and protected route handlers
- URL rewriting for Firebase Hosting

## Design Philosophy

- **Zero runtime dependencies** - All external libraries are peer dependencies
- **User controls Firebase init** - We don't call `initializeApp()` or `admin.initializeApp()`
- **Minimal & focused** - Firebase authentication with Google Sign-In only
- **ESM first** - Pure ES modules, works with bundlers and import maps

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

```bash
npm install
npm run format
```

Both packages support Firebase emulators:

```bash
firebase emulators:start
```

Connect frontend to emulator:

```javascript
import { connectAuthEmulator } from "firebase/auth";

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
}
```

Backend works automatically with emulator when using `admin.initializeApp()` locally.

## Use Cases

**Perfect for:** Firebase Hosting + Cloud Functions, React + Firebase, ESM workflows, domain-restricted Google Sign-In.

**Not designed for:** Multiple auth providers, custom UI flows, non-React frontends, non-Fastify backends.

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

Issues and PRs welcome. Fork, branch, change, PR.

## License

MIT

## Credits

Built by [NearForm](https://nearform.com). Extracted from real-world Firebase applications.
