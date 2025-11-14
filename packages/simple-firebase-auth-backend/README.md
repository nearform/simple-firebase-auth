# @nearform/simple-firebase-auth-backend

Simple, opinionated Firebase authentication for Cloud Functions backend with Fastify.

Use this if you have a simple app that needs Google-based auth and you want protected routes/APIs on the backend and you're OK with this specific mix:

- 🔥 [Firebase Authentication](https://firebase.google.com/docs/auth)
- ☁️ Google [Cloud Functions for Firebase](https://firebase.google.com/docs/functions) runtime
- ⚡ [Fastify](https://fastify.dev/) server abstraction

## Installation

```bash
$ npm install @nearform/simple-firebase-auth-backend
```

### Peer Dependencies

You must also install these peer dependencies:

```bash
$ npm install firebase-admin firebase-functions fastify @fastify/auth
```

## Prerequisites

You'll need to set up a Firebase project with authentication and cloud functions, which we won't cover here.

**IMPORTANT**: You must initialize Firebase Admin yourself. This package does NOT call `admin.initializeApp()`.

```javascript
import admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions";

// YOU must do this before using the package
admin.initializeApp();
setGlobalOptions({ maxInstances: 5 });
```

## Quick Start

```javascript
// Step 1: Initialize Firebase Admin (YOUR responsibility)
import admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions";

admin.initializeApp();
setGlobalOptions({ maxInstances: 5 });

// Step 2: Use the Fastify adapter
import { adaptFastify } from "@nearform/simple-firebase-auth-backend";

export const api = adaptFastify({
  // Optional: restrict to specific email domain
  googleAuthDomain: "nearform.com",

  // Optional: custom URL prefix (default: "/api")
  functionsRewritePrefix: "/api",

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
    // All routes here require authentication
    fastify.get("/user", async (request) => {
      // Access decoded token from request
      return {
        email: request.decodedToken.email,
        uid: request.decodedToken.uid,
      };
    });

    fastify.get("/data", async () => ({
      data: "sensitive information",
    }));
  },
});
```

## Configuration Options

### `adaptFastify(options)`

| Option                   | Type       | Default                   | Description                                                |
| ------------------------ | ---------- | ------------------------- | ---------------------------------------------------------- |
| `addNoAuthRoutes`        | `Function` | `() => Promise.resolve()` | Async function to register public routes                   |
| `addAuthRoutes`          | `Function` | `() => Promise.resolve()` | Async function to register protected routes                |
| `googleAuthDomain`       | `string`   | `undefined`               | Optional email domain restriction (e.g., `"nearform.com"`) |
| `functionsRewritePrefix` | `string`   | `"/api"`                  | URL prefix for Cloud Functions URL rewriting               |

## Advanced Usage

### Manual Token Verification

If you need custom auth logic, you can use the token verification functions directly:

```javascript
import { verifyAuthToken } from "@nearform/simple-firebase-auth-backend";

export const api = adaptFastify({
  addNoAuthRoutes: async (fastify) => {
    fastify.get("/custom", async (request, reply) => {
      try {
        // Manually verify token with optional domain restriction
        const decodedToken = await verifyAuthToken(request, "nearform.com");

        return {
          email: decodedToken.email,
          customClaim: decodedToken.customClaim,
        };
      } catch (error) {
        reply.code(401).send({ error: error.message });
      }
    });
  },
});
```

### Accessing Decoded Token

In protected routes, the decoded token is available on `request.decodedToken`:

```javascript
addAuthRoutes: async (fastify) => {
  fastify.get("/profile", async (request) => {
    const { email, uid, name, picture } = request.decodedToken;

    return {
      email,
      uid,
      name,
      picture,
    };
  });
};
```

## API Reference

### `adaptFastify(options)`

Creates a Firebase Cloud Function with Fastify and authentication support.

**Returns**: `HttpsFunction` - Firebase Cloud Function handler

### `verifyAuthToken(request, googleAuthDomain?)`

Verifies the authorization token from the request.

**Parameters**:

- `request` - Fastify request object
- `googleAuthDomain` (optional) - Email domain to restrict (e.g., `"nearform.com"`)

**Returns**: `Promise<DecodedIdToken>` - Decoded Firebase ID token

**Throws**: `Error` - If token is invalid or domain doesn't match

### `getIdToken(request)`

Extracts and verifies the ID token from the Authorization header.

**Parameters**:

- `request` - Fastify request object

**Returns**: `Promise<DecodedIdToken>` - Decoded Firebase ID token

**Throws**: `Error` - If no authorization header or invalid token

### `isValidAuth(decodedToken, googleAuthDomain?)`

Validates the decoded token meets authentication requirements.

**Parameters**:

- `decodedToken` - Decoded Firebase ID token
- `googleAuthDomain` (optional) - Email domain to restrict

**Throws**: `Error` - If token is invalid or domain doesn't match

## Error Handling

The package throws some specific errors:

- `"No authorization header provided"` - Missing or malformed Authorization header
- `"Invalid email domain. Expected @domain.com, got user@other.com"` - Domain mismatch

and passes through other Firebase-generated authentication errors.

You can handle these in your routes like:

```javascript
addAuthRoutes: async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error.message.includes("authorization")) {
      reply.code(401).send({ error: error.message });
    } else {
      reply.code(500).send({ error: "Internal server error" });
    }
  });
};
```

## Firebase Configuration

### firebase.json

Configure URL rewriting to route requests to your Cloud Function:

```json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      }
    ]
  }
}
```

### Local Development with Emulator

The package works with Firebase Emulators. Start them with:

```bash
$ firebase emulators:start
```

Your frontend should connect to the emulator (see frontend package documentation).

## Complete Example

```javascript
// functions/index.js
import admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions";
import { adaptFastify } from "@nearform/simple-firebase-auth-backend";

// Initialize Firebase Admin
admin.initializeApp();
setGlobalOptions({
  maxInstances: 5,
  region: "us-central1",
});

// Create authenticated API
export const api = adaptFastify({
  googleAuthDomain: "nearform.com",
  functionsRewritePrefix: "/api",

  addNoAuthRoutes: async (fastify) => {
    // Health check
    fastify.get("/", async () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    }));

    // Public data
    fastify.get("/public", async () => ({
      message: "This is public data",
    }));
  },

  addAuthRoutes: async (fastify) => {
    // User info
    fastify.get("/user", async (request) => ({
      email: request.decodedToken.email,
      uid: request.decodedToken.uid,
    }));

    // Protected data
    fastify.get("/protected", async () => ({
      data: "This requires authentication",
    }));
  },
});
```

## TypeScript

This package is written in JavaScript with JSDoc comments for IDE support. TypeScript definitions may be added in a future release.

## License

MIT

## Contributing

Issues and PRs welcome at [https://github.com/nearform/simple-firebase-auth](https://github.com/nearform/simple-firebase-auth)
