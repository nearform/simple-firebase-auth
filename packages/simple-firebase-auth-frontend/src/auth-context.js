import { createElement, createContext, useContext } from "react";
import { useAuth } from "./use-auth.js";

const AuthContext = createContext(null);

/**
 * React Context provider for authentication.
 * Wraps your app to provide auth state to all components.
 *
 * @param {Object} props
 * @param {import('firebase/auth').Auth} props.auth - Firebase Auth instance from getAuth()
 * @param {Object} props.config - Configuration object
 * @param {Object} [props.config.googleAuthOptions] - Optional Google Auth Provider customization
 * @param {string[]} [props.config.googleAuthOptions.scopes] - OAuth scopes to request
 * @param {Object} [props.config.googleAuthOptions.customParameters] - Custom parameters for Google Auth (hd, prompt, etc.)
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement}
 *
 * @example
 * import { getAuth } from 'firebase/auth';
 * import { AuthProvider } from '@nearform/simple-firebase-auth-frontend';
 *
 * function App() {
 *   const auth = getAuth();
 *   const config = {
 *     googleAuthOptions: {
 *       scopes: ["https://www.googleapis.com/auth/userinfo.email"],
 *       customParameters: { hd: "nearform.com" }
 *     }
 *   };
 *
 *   return (
 *     <AuthProvider auth={auth} config={config}>
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 */
export function AuthProvider({ auth, config = {}, children }) {
  const authState = useAuth(auth, config);

  return createElement(AuthContext.Provider, { value: authState }, children);
}

/**
 * Hook to access auth context.
 * Must be used within an AuthProvider.
 *
 * @returns {Object} Auth state and methods (same as useAuth hook)
 * @throws {Error} If used outside AuthProvider
 *
 * @example
 * import { useAuthContext } from '@nearform/simple-firebase-auth-frontend';
 *
 * function MyComponent() {
 *   const { user, isSignedIn, signIn, signOut } = useAuthContext();
 *
 *   return isSignedIn
 *     ? <button onClick={signOut}>Sign Out</button>
 *     : <button onClick={signIn}>Sign In</button>;
 * }
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
