import admin from "firebase-admin";

/**
 * Extracts and verifies the ID token from the Authorization header.
 *
 * @param {Object} request - The Fastify request object
 * @returns {Promise<admin.auth.DecodedIdToken>} The decoded ID token
 * @throws {Error} If no authorization header is provided or token is invalid
 */
export const getIdToken = async (request) => {
  if (
    !request.headers.authorization ||
    !request.headers.authorization.startsWith("Bearer ")
  ) {
    throw new Error("No authorization header provided");
  }

  const idToken = request.headers.authorization.split("Bearer ")[1];
  return admin.auth().verifyIdToken(idToken);
};

/**
 * Validates that the decoded token meets authentication requirements.
 *
 * @param {admin.auth.DecodedIdToken} decodedToken - The decoded ID token
 * @param {string} [googleAuthDomain] - Optional email domain to restrict (e.g., "nearform.com")
 * @throws {Error} If token is invalid or email domain doesn't match
 */
export const isValidAuth = (decodedToken, googleAuthDomain) => {
  if (!decodedToken) {
    throw new Error("No idToken provided");
  }

  if (
    googleAuthDomain &&
    !decodedToken.email?.toLowerCase().endsWith(`@${googleAuthDomain}`)
  ) {
    throw new Error(
      `Invalid email domain. Expected @${googleAuthDomain}, got ${decodedToken.email}`,
    );
  }
};

/**
 * Verifies the authorization token from the request and validates it.
 * This is the main auth verification function to use in your routes.
 *
 * @param {Object} request - The Fastify request object
 * @param {string} [googleAuthDomain] - Optional email domain to restrict (e.g., "nearform.com")
 * @returns {Promise<admin.auth.DecodedIdToken>} The decoded ID token
 * @throws {Error} If authorization fails
 *
 * @example
 * // Use in a Fastify route
 * fastify.get('/protected', async (request, reply) => {
 *   try {
 *     const decodedToken = await verifyAuthToken(request, "nearform.com");
 *     return { email: decodedToken.email };
 *   } catch (error) {
 *     reply.code(401).send({ error: error.message });
 *   }
 * });
 */
export const verifyAuthToken = async (request, googleAuthDomain) => {
  const decodedToken = await getIdToken(request);
  isValidAuth(decodedToken, googleAuthDomain);
  return decodedToken;
};
