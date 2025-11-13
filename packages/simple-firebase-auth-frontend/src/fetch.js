/* globals fetch:false */

/**
 * Creates an authenticated fetch function that includes Firebase auth token.
 * Wraps the native fetch API and automatically adds Authorization header.
 *
 * @param {Object|null} user - Firebase user object from useAuth or useAuthContext
 * @returns {Function} Fetch function with auth token injection
 *
 * @example
 * import { useAuthContext, fetchWithAuth } from '@nearform/simple-firebase-auth-frontend';
 *
 * function MyComponent() {
 *   const { user } = useAuthContext();
 *
 *   const handleFetch = async () => {
 *     const response = await fetchWithAuth(user)('/api/data');
 *     const data = await response.json();
 *     console.log(data);
 *   };
 *
 *   return <button onClick={handleFetch}>Fetch Data</button>;
 * }
 *
 * @example
 * // With POST request
 * const response = await fetchWithAuth(user)('/api/data', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({ key: 'value' })
 * });
 */
export const fetchWithAuth = (user) => {
  return async (url, options = {}) => {
    if (!user) {
      // No user, make unauthenticated request
      return fetch(url, options);
    }

    // Get fresh ID token
    const idToken = await user.getIdToken();
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${idToken}`,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };
};
