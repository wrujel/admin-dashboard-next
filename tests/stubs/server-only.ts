/**
 * Test stub for the `server-only` package.
 *
 * The real module throws when it is pulled into a client bundle. Under Vitest
 * there is no server/client split, so it is aliased to this no-op (see
 * `vitest.config.ts`) — that lets the server-only data layer be imported and
 * unit-tested directly.
 */
export {};
