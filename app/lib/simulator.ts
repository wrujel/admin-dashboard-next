import type { ActivityItem, TransactionRow } from "./types";
import {
  ACTIVITY_TEMPLATES,
  FIRST_NAMES,
  LAST_NAMES,
  PAYMENT_METHODS,
  TX_STATUS_POOL,
} from "./fixtures";

/**
 * Client-side random generators for the live simulator. These run only after
 * mount (inside the interval), so Math.random / crypto.randomUUID are safe and
 * won't cause hydration mismatches.
 */

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}`;
}

function person() {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  return {
    name: `${first} ${last}`,
    email: `${first}.${last}`.toLowerCase() + "@example.com",
  };
}

export function nextTransaction(): TransactionRow {
  const { name, email } = person();
  return {
    id: uid("tx"),
    name,
    email,
    amount: Math.round((40 + Math.random() * 2460) * 100) / 100,
    status: pick(TX_STATUS_POOL),
    method: pick(PAYMENT_METHODS),
    date: new Date().toISOString(),
  };
}

export function nextActivity(): ActivityItem {
  const tpl = pick(ACTIVITY_TEMPLATES);
  const { name } = person();
  return {
    id: uid("act"),
    type: tpl.type,
    actor: name,
    action: tpl.action,
    target: tpl.target(Math.random),
    date: new Date().toISOString(),
  };
}
