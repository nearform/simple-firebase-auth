import Fastify from "fastify";
import FastifyAuth from "@fastify/auth";
import { onRequest } from "firebase-functions/v2/https";

import { verifyAuthToken } from "./auth.js";

/**
 * Creates a Fastify instance configured for Firebase Cloud Functions.
 *
 * @param {string} functionsRewritePrefix - URL prefix to strip for routing (default: "/api")
 * @returns {Promise<import('fastify').FastifyInstance>}
 */
const createFastify = async (functionsRewritePrefix = "/api") => {
  const fastify = Fastify({
    logger: true,
    rewriteUrl: ({ url }) => {
      if (url.startsWith(functionsRewritePrefix)) {
        return url.replace(functionsRewritePrefix, "");
      }
      return url;
    },
  });

  // Register auth plugin
  fastify.register(FastifyAuth);
  await fastify.after();

  // Adapt the Cloud Functions JSON payload
  // See: https://fastify.dev/docs/latest/Guides/Serverless/#add-custom-contenttypeparser-to-fastify-instance-and-define-endpoints
  fastify.addContentTypeParser("application/json", {}, (req, payload, done) => {
    req.rawBody = payload.rawBody;
    done(null, payload.body);
  });

  return fastify;
};

/**
 * Adapts a Fastify app to work with Firebase Cloud Functions.
 * Uses a singleton pattern to reuse the Fastify instance across invocations.
 *
 * IMPORTANT: You must call `admin.initializeApp()` before using this function.
 *
 * @param {Object} options - Configuration options
 * @param {Function} [options.addNoAuthRoutes] - Async function to register public routes
 * @param {Function} [options.addAuthRoutes] - Async function to register protected routes
 * @param {string} [options.googleAuthDomain] - Optional email domain to restrict (e.g., "nearform.com")
 * @param {string} [options.functionsRewritePrefix="/api"] - URL prefix for Cloud Functions rewriting
 * @returns {import('firebase-functions/v2/https').HttpsFunction}
 *
 * @example
 * // In your Cloud Functions index.js
 * import admin from 'firebase-admin';
 * import { setGlobalOptions } from 'firebase-functions';
 * import { adaptFastify } from '@nearform/simple-firebase-auth-backend';
 *
 * // Initialize Firebase Admin (YOUR responsibility)
 * admin.initializeApp();
 * setGlobalOptions({ maxInstances: 5 });
 *
 * // Configure your API
 * export const api = adaptFastify({
 *   googleAuthDomain: "nearform.com",
 *   functionsRewritePrefix: "/api",
 *
 *   // Public routes (no auth)
 *   addNoAuthRoutes: async (fastify) => {
 *     fastify.get('/', async () => ({ message: 'API works' }));
 *   },
 *
 *   // Protected routes (auth required)
 *   addAuthRoutes: async (fastify) => {
 *     fastify.get('/user', async (request) => {
 *       return { email: request.decodedToken.email };
 *     });
 *   }
 * });
 */
export const adaptFastify = ({
  addNoAuthRoutes = () => Promise.resolve(),
  addAuthRoutes = () => Promise.resolve(),
  googleAuthDomain,
  functionsRewritePrefix = "/api",
}) => {
  let _fastify = null;

  return onRequest(async (request, reply) => {
    if (!_fastify) {
      _fastify = await createFastify(functionsRewritePrefix);

      // Register public routes (no auth)
      _fastify.register(addNoAuthRoutes);

      // Register protected routes (with auth)
      _fastify.register(async (instance) => {
        // Auth preHandler for all routes in this scope
        instance.addHook("preHandler", async (request) => {
          const decodedToken = await verifyAuthToken(request, googleAuthDomain);
          // Attach decoded token to request for use in route handlers
          request.decodedToken = decodedToken;
        });

        await addAuthRoutes(instance);
      });

      await _fastify.ready();
    }

    _fastify.server.emit("request", request, reply);
  });
};
