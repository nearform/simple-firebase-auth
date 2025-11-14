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

## Local Development

```bash
$ npm install
$ npm run format
```

Both packages support Firebase emulators:

```bash
$ firebase emulators:start
```

Connect frontend to emulator:

```javascript
import { connectAuthEmulator } from "firebase/auth";

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
}
```

Backend works automatically with emulator when using `admin.initializeApp()` locally.

## License

MIT
