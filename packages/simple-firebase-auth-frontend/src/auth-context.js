import { createElement, createContext, useContext } from "react";
import { useAuth } from "./use-auth.js";

const AuthContext = createContext(null);

/**
 * React Context provider for authentication.
 * Wraps your app to provide auth state to all components.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement}
 *
 * @example
 * import { AuthProvider } from '@nearform/simple-firebase-auth-frontend';
 *
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 */
export function AuthProvider({ children }) {
  const auth = useAuth();

  return createElement(AuthContext.Provider, { value: auth }, children);
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
