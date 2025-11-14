import { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

/**
 * React hook for Firebase authentication with Google Sign-In.
 * Manages auth state, sign in/out, and error handling.
 *
 * @param {import('firebase/auth').Auth} auth - Firebase Auth instance from getAuth()
 * @param {Object} config - Configuration object
 * @param {Object} [config.googleAuthOptions] - Optional Google Auth Provider customization
 * @param {string[]} [config.googleAuthOptions.scopes] - OAuth scopes to request
 * @param {Object} [config.googleAuthOptions.customParameters] - Custom parameters for Google Auth (hd, prompt, etc.)
 * @returns {Object} Auth state and methods
 * @returns {Object|null} returns.user - Current Firebase user or null
 * @returns {boolean} returns.loading - Whether auth state is loading
 * @returns {string|null} returns.error - Error message if auth operation failed
 * @returns {boolean} returns.isSignedIn - Whether user is signed in
 * @returns {Function} returns.signIn - Function to sign in with Google popup
 * @returns {Function} returns.signOut - Function to sign out
 *
 * @example
 * import { getAuth } from 'firebase/auth';
 * import { useAuth } from '@nearform/simple-firebase-auth-frontend';
 *
 * function MyComponent() {
 *   const auth = getAuth();
 *   const config = {
 *     googleAuthOptions: {
 *       scopes: ["https://www.googleapis.com/auth/userinfo.email"],
 *       customParameters: { hd: "nearform.com" }
 *     }
 *   };
 *   const { user, loading, error, isSignedIn, signIn, signOut } = useAuth(auth, config);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return isSignedIn
 *     ? <button onClick={signOut}>Sign Out ({user.email})</button>
 *     : <button onClick={signIn}>Sign In with Google</button>;
 * }
 */
export function useAuth(auth, config = {}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [auth]);

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const googleAuthOptions = config.googleAuthOptions || {
        scopes: ["https://www.googleapis.com/auth/userinfo.email"],
        customParameters: {},
      };

      const provider = new GoogleAuthProvider();

      // Add configured scopes
      googleAuthOptions.scopes.forEach((scope) => {
        provider.addScope(scope);
      });

      // Set custom parameters
      const customParams = {
        display: "popup",
        ...googleAuthOptions.customParameters,
      };

      provider.setCustomParameters(customParams);

      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        // User manually closed the popup - not an error, just reset loading
        setError(null);
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        setError(
          "You have already signed up with a different auth provider for that email.",
        );
      } else {
        setError(error.message || "Sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
    } catch (error) {
      setError(error.message || "Sign out failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isSignedIn: !!user,
    signIn,
    signOut: signOutUser,
  };
}
