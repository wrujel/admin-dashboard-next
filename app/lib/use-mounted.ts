"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * SSR-safe "is mounted" flag without setState-in-effect.
 * Returns false on the server / first render, true after hydration.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
