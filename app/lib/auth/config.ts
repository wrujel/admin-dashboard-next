/**
 * Lightweight auth-config flag — kept free of the heavy Better Auth instance so
 * static pages (e.g. /login) can read it without instantiating the server.
 *
 * Auth is "configured" only when both a database and a real secret are present.
 * Otherwise the app runs in demo mode (open) — see ./dal.
 */
export const authConfigured = Boolean(
  process.env.MONGO_URI &&
  (process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET),
);
