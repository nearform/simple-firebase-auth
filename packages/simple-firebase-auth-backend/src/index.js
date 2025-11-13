/**
 * Simple Firebase Authentication for Cloud Functions Backend
 *
 * This package provides authentication utilities for Firebase Cloud Functions
 * using Fastify. It handles token verification and provides a simple way to
 * create authenticated and public routes.
 *
 * @module @nearform/simple-firebase-auth-backend
 */

export { adaptFastify } from "./fastify.js";
export { verifyAuthToken, getIdToken, isValidAuth } from "./auth.js";
