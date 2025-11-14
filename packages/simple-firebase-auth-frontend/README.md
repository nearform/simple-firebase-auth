# @nearform/simple-firebase-auth-frontend

Simple, opinionated Firebase authentication for React apps with Google Sign-In.

## Conventional (Installed) Usage

You can install and use this library as part of a normal, built (vite, webpack, whatever) frontend React app.

### Installation

```bash
npm install @nearform/simple-firebase-auth-frontend
```

### Peer Dependencies

You must also install these peer dependencies:

```bash
npm install firebase react
```

## Prerequisites

**IMPORTANT**: You must initialize Firebase yourself and call `getAuth()`. This package does NOT call `initializeApp()` or `getAuth()`.

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Step 1: Initialize Firebase (YOUR responsibility)
const app = initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
});

// Step 2: Get Auth instance (YOUR responsibility)
const auth = getAuth(app);

// Step 3: Connect to emulator if needed (YOUR responsibility)
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
}
```

Get your Firebase config from: [Firebase Console](https://console.firebase.google.com/) → Project Settings → General → Your apps

## Quick Start

```javascript
// Step 1: Initialize Firebase and get Auth instance (YOUR responsibility)
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const app = initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // ... rest of config
});

const auth = getAuth(app);

// Step 2: Connect to emulator if needed (YOUR responsibility)
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
}

// Step 3: Wrap your app with AuthProvider
import { AuthProvider } from "@nearform/simple-firebase-auth-frontend";

function App() {
  const config = {
    googleAuthOptions: {
      scopes: ["https://www.googleapis.com/auth/userinfo.email"],
      customParameters: {
        hd: "nearform.com", // Hosted domain hint
        prompt: "select_account",
      },
    },
  };

  return (
    <AuthProvider auth={auth} config={config}>
      <YourApp />
    </AuthProvider>
  );
}

// Step 4: Use auth in your components
import { useAuthContext } from "@nearform/simple-firebase-auth-frontend";

function MyComponent() {
  const { user, loading, error, isSignedIn, signIn, signOut } =
    useAuthContext();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return isSignedIn ? (
    <button onClick={signOut}>Sign Out ({user.email})</button>
  ) : (
    <button onClick={signIn}>Sign In with Google</button>
  );
}
```

## Using with ESM.sh (No Build Step)

Alternately, if you have a frontend application that gets ESM dependencies from a CDN, you can just add a few lines to your `importmap` and be off to the races! Here's a working example:

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@18.3.1",
          "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
          "firebase/app": "https://esm.sh/firebase@11.0.1/app",
          "firebase/auth": "https://esm.sh/firebase@11.0.1/auth",
          "@nearform/simple-firebase-auth-frontend": "https://esm.sh/@nearform/simple-firebase-auth-frontend@0.1.0"
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>

    <script type="module">
      import { createRoot } from "react-dom/client";
      import { createElement as h } from "react";
      import { initializeApp } from "firebase/app";
      import { getAuth, connectAuthEmulator } from "firebase/auth";
      import {
        AuthProvider,
        useAuthContext,
      } from "@nearform/simple-firebase-auth-frontend";

      // Step 1: Initialize Firebase
      const app = initializeApp({
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID",
      });

      // Step 2: Get Auth instance
      const auth = getAuth(app);

      // Step 3: Connect to emulator if needed
      if (window.location.hostname === "localhost") {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", {
          disableWarnings: true,
        });
      }

      // Step 4: Create your app
      function SignInButton() {
        const { user, isSignedIn, signIn, signOut } = useAuthContext();

        return h(
          "div",
          null,
          isSignedIn
            ? h("button", { onClick: signOut }, `Sign Out (${user.email})`)
            : h("button", { onClick: signIn }, "Sign In with Google"),
        );
      }

      function App() {
        const config = {
          googleAuthOptions: {
            scopes: ["https://www.googleapis.com/auth/userinfo.email"],
            customParameters: {
              hd: "nearform.com",
            },
          },
        };

        return h(
          AuthProvider,
          { auth, config },
          h("div", null, h("h1", null, "My App"), h(SignInButton)),
        );
      }

      // Step 5: Render
      createRoot(document.getElementById("root")).render(h(App));
    </script>
  </body>
</html>
```

## Configuration Options

### Config Object

Pass a configuration object to `AuthProvider` via the `config` prop. All options are optional.

| Option              | Type     | Default   | Description                        |
| ------------------- | -------- | --------- | ---------------------------------- |
| `googleAuthOptions` | `object` | See below | Google Auth Provider customization |

#### `googleAuthOptions` object

| Option             | Type       | Default                                              | Description                             |
| ------------------ | ---------- | ---------------------------------------------------- | --------------------------------------- |
| `scopes`           | `string[]` | `["https://www.googleapis.com/auth/userinfo.email"]` | OAuth scopes to request                 |
| `customParameters` | `object`   | `{}`                                                 | Custom parameters for Google Auth popup |

**Common custom parameters:**

- `hd`: Hosted domain (e.g., `"nearform.com"`) - hints domain in popup
- `prompt`: `"select_account"`, `"consent"`, or `"none"`
- `login_hint`: Email hint for the popup

## API Reference

### Hooks

#### `useAuth(auth, config)`

Core authentication hook. Returns auth state and methods.

**Parameters:**

- `auth` - Firebase Auth instance from `getAuth()`
- `config` - Optional configuration object (same structure as `AuthProvider` config prop)

**Returns:**

- `user` - Firebase user object or `null`
- `loading` - Boolean indicating auth state loading
- `error` - Error message string or `null`
- `isSignedIn` - Boolean shorthand for `!!user`
- `signIn()` - Async function to sign in with Google popup
- `signOut()` - Async function to sign out

```javascript
import { getAuth } from "firebase/auth";
import { useAuth } from "@nearform/simple-firebase-auth-frontend";

function MyComponent() {
  const auth = getAuth();
  const config = {
    googleAuthOptions: {
      scopes: ["https://www.googleapis.com/auth/userinfo.email"],
    },
  };
  const { user, loading, error, isSignedIn, signIn, signOut } = useAuth(
    auth,
    config,
  );
  // ... your logic
}
```

#### `useAuthContext()`

Hook to access auth from context. Must be used within `<AuthProvider>`.

**Returns:** Same as `useAuth()`

**Throws:** Error if used outside `AuthProvider`

```javascript
import { useAuthContext } from "@nearform/simple-firebase-auth-frontend";

function MyComponent() {
  const { user, isSignedIn, signIn, signOut } = useAuthContext();
  // ... your logic
}
```

### Components

#### `<AuthProvider>`

Context provider that wraps your app. Uses `useAuth()` internally.

**Props:**

- `auth` (required) - Firebase Auth instance from `getAuth()`
- `config` (optional) - Configuration object (see Configuration Options above)
- `children` (required) - React children

```javascript
import { getAuth } from "firebase/auth";
import { AuthProvider } from "@nearform/simple-firebase-auth-frontend";

function App() {
  const auth = getAuth();
  const config = {
    googleAuthOptions: {
      scopes: ["https://www.googleapis.com/auth/userinfo.email"],
    },
  };

  return (
    <AuthProvider auth={auth} config={config}>
      <YourComponents />
    </AuthProvider>
  );
}
```

### Utilities

#### `fetchWithAuth(user)`

Creates an authenticated fetch function that includes Firebase auth token.

**Parameters:**

- `user` - Firebase user object from `useAuth()` or `useAuthContext()`

**Returns:** Fetch function with automatic token injection

```javascript
import {
  useAuthContext,
  fetchWithAuth,
} from "@nearform/simple-firebase-auth-frontend";

function DataComponent() {
  const { user } = useAuthContext();

  const fetchData = async () => {
    const response = await fetchWithAuth(user)("/api/data");
    const data = await response.json();
    console.log(data);
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

**With POST:**

```javascript
const response = await fetchWithAuth(user)("/api/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "value" }),
});
```

## Complete Example

```javascript
import { createRoot } from "react-dom/client";
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  AuthProvider,
  useAuthContext,
  fetchWithAuth,
} from "@nearform/simple-firebase-auth-frontend";

// Initialize Firebase
const app = initializeApp({
  apiKey: "AIza...",
  authDomain: "myapp.firebaseapp.com",
  projectId: "myapp",
  storageBucket: "myapp.appspot.com",
  messagingSenderId: "123456",
  appId: "1:123456:web:abc123",
});

// Get Auth instance
const auth = getAuth(app);

// Connect to emulator if needed
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
}

// SignIn Button Component
function SignInButton() {
  const { user, loading, error, isSignedIn, signIn, signOut } =
    useAuthContext();

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div style={{ color: "red" }}>
        <p>Error: {error}</p>
        <button onClick={signIn}>Try Again</button>
      </div>
    );
  }

  return isSignedIn ? (
    <div>
      <p>Signed in as {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  ) : (
    <button onClick={signIn}>Sign In with Google</button>
  );
}

// Data Fetching Component
function DataDisplay() {
  const { user } = useAuthContext();
  const [data, setData] = React.useState(null);

  const loadData = async () => {
    try {
      const response = await fetchWithAuth(user)("/api/data");
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  return (
    <div>
      <button onClick={loadData}>Load Data</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

// Main App
function App() {
  const config = {
    googleAuthOptions: {
      scopes: ["https://www.googleapis.com/auth/userinfo.email"],
      customParameters: {
        hd: "nearform.com",
        prompt: "select_account",
      },
    },
  };

  return (
    <AuthProvider auth={auth} config={config}>
      <div>
        <h1>My App</h1>
        <SignInButton />
        <DataDisplay />
      </div>
    </AuthProvider>
  );
}

// Render
createRoot(document.getElementById("root")).render(<App />);
```

## Local Development with Firebase Emulator

1. Start Firebase emulators:

```bash
firebase emulators:start
```

2. Connect to the emulator in your code:

```javascript
import { getAuth, connectAuthEmulator } from "firebase/auth";

const auth = getAuth(app);

// Connect to emulator (typically only in development)
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
}
```

**Important:** Only call `connectAuthEmulator()` once, and only if the emulator is running. Make sure to call it before using the auth instance.

## Error Handling

The `useAuth` hook provides error states:

```javascript
const { error, signIn } = useAuthContext();

if (error) {
  console.log("Auth error:", error);
}
```

**Common error codes handled:**

- `auth/popup-closed-by-user` - User closed popup (not treated as error)
- `auth/account-exists-with-different-credential` - Account conflict
- Other errors return the error message

## TypeScript

This package is written in JavaScript with JSDoc comments for IDE support. TypeScript definitions may be added in a future release.

## License

MIT

## Contributing

Issues and PRs welcome at [https://github.com/nearform/simple-firebase-auth](https://github.com/nearform/simple-firebase-auth)
