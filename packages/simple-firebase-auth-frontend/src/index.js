/**
 * Simple Firebase Authentication for React Frontend
 *
 * This package provides React hooks and components for Firebase authentication
 * with Google Sign-In. It's designed to be lightweight with zero runtime dependencies
 * and works great with ESM delivery via esm.sh.
 *
 * IMPORTANT: You must initialize Firebase yourself before using this package.
 *
 * @module @nearform/simple-firebase-auth-frontend
 */

export { initAuth } from "./config.js";
export { auth } from "./auth.js";
export { useAuth } from "./use-auth.js";
export { AuthProvider, useAuthContext } from "./auth-context.js";
export { fetchWithAuth } from "./fetch.js";
