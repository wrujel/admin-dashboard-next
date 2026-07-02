/**
 * Small deterministic PRNG (mulberry32). Used wherever demo data must be
 * stable across renders — the mock generators and the simulator's seeding
 * step, which runs during SSR and again at hydration with identical output.
 */
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
