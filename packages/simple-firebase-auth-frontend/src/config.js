/**
 * Package configuration store.
 * Does NOT handle Firebase initialization - user must call initializeApp() separately.
 */

let config = {
  googleAuthDomain: null,
  emulatorAuthUrl: null,
  googleAuthOptions: {
    scopes: ["https://www.googleapis.com/auth/userinfo.email"],
    customParameters: {},
  },
};

/**
 * Initialize the auth package configuration.
 * Call this after initializing Firebase with initializeApp().
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.googleAuthDomain] - Optional email domain restriction (e.g., "nearform.com")
 * @param {string} [options.emulatorAuthUrl] - Optional emulator URL for local dev (e.g., "http://127.0.0.1:9099")
 * @param {Object} [options.googleAuthOptions] - Optional Google Auth Provider customization
 * @param {string[]} [options.googleAuthOptions.scopes] - OAuth scopes to request
 * @param {Object} [options.googleAuthOptions.customParameters] - Custom parameters for Google Auth (hd, prompt, etc.)
 *
 * @example
 * import { initializeApp } from 'firebase/app';
 * import { initAuth } from '@nearform/simple-firebase-auth-frontend';
 *
 * // Step 1: Initialize Firebase (YOUR responsibility)
 * initializeApp({ ... });
 *
 * // Step 2: Configure auth package (optional)
 * initAuth({
 *   googleAuthDomain: "nearform.com",
 *   emulatorAuthUrl: "http://127.0.0.1:9099",
 *   googleAuthOptions: {
 *     scopes: ["https://www.googleapis.com/auth/userinfo.email"],
 *     customParameters: {
 *       hd: "nearform.com",
 *       prompt: "select_account"
 *     }
 *   }
 * });
 */
export const initAuth = (options = {}) => {
  config = {
    googleAuthDomain: options.googleAuthDomain || null,
    emulatorAuthUrl: options.emulatorAuthUrl || null,
    googleAuthOptions: {
      scopes: options.googleAuthOptions?.scopes || [
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      customParameters: options.googleAuthOptions?.customParameters || {},
    },
  };
};

/**
 * Get the current package configuration.
 *
 * @returns {Object} The current config
 */
export const getConfig = () => config;
