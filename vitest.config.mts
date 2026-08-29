import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const stub = (name: string) =>
  fileURLToPath(new URL(`./tests/stubs/${name}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolves the "@/*" path alias straight from tsconfig.json.
    tsconfigPaths: true,
    alias: {
      // `server-only` throws by design when bundled for the client. Vitest has
      // no server/client split, so it is stubbed out to let the server-only
      // data-access layer be imported directly by unit tests.
      "server-only": stub("server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    unstubEnvs: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      // Coverage is scoped to the application's logic layer: data access,
      // server actions, services, models, domain utilities and route
      // protection. Presentational components under app/ui are exercised by
      // render tests but not held to the coverage threshold.
      include: [
        "lib/**/*.ts",
        "app/lib/**/*.ts",
        "app/actions/**/*.ts",
        "app/services/**/*.ts",
        "app/models/**/*.ts",
        "app/ui/shell/nav.ts",
        "proxy.js",
      ],
      exclude: [
        // Type-only module: erased at compile time, nothing to execute.
        "app/lib/types.ts",
      ],
      // The suite is expected to keep the scope above fully covered.
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
