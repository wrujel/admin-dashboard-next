import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { memoryAdapter } from "better-auth/adapters/memory";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

import { authConfigured } from "./config";

const secret =
  process.env.BETTER_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "dev-insecure-secret-please-set-BETTER_AUTH_SECRET";

function database() {
  if (authConfigured && process.env.MONGO_URI) {
    const client = new MongoClient(process.env.MONGO_URI);
    return mongodbAdapter(client.db());
  }
  // Demo fallback — in-memory store, resets on restart.
  return memoryAdapter({});
}

export const auth = betterAuth({
  appName: "Nexus",
  secret,
  database: database(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // Throttles credential brute-force attempts.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
