/* global window:false */
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { getConfig } from "./config.js";

let _auth = null;
let _emulatorConnected = false;

/**
 * Gets the Firebase Auth instance.
 * Expects Firebase to be initialized via initializeApp() before calling this.
 * Automatically connects to emulator if configured and running on localhost.
 *
 * @returns {import('firebase/auth').Auth} Firebase Auth instance
 *
 * @example
 * import { auth } from '@nearform/simple-firebase-auth-frontend';
 * import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
 *
 * const provider = new GoogleAuthProvider();
 * await signInWithPopup(auth, provider);
 */
export const auth = (() => {
  if (!_auth) {
    _auth = getAuth();

    // Connect to emulator if configured and on localhost
    const config = getConfig();
    if (
      config.emulatorAuthUrl &&
      typeof window !== "undefined" &&
      window.location.hostname === "localhost" &&
      !_emulatorConnected
    ) {
      connectAuthEmulator(_auth, config.emulatorAuthUrl, {
        disableWarnings: true,
      });
      _emulatorConnected = true;
    }
  }

  return _auth;
})();
