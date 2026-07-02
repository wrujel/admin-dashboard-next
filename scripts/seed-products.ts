/**
 * Seed random products into MongoDB — batched, resilient, unique.
 *
 *   npm run seed:products                 # insert 1000 (batches of 100)
 *   npm run seed:products -- 250          # insert 250
 *   npm run seed:products -- --reset 1000 # wipe collection first, then 1000
 *   npm run seed:products -- --dry-run    # preview + uniqueness check, no writes
 *
 * Reads MONGO_URI from .env (loaded via `node --env-file`).
 */
import mongoose from "mongoose";

import { Product } from "../app/models/product";
import {
  CATEGORIES,
  PRODUCT_COLORS,
  PRODUCT_NAMES,
  PRODUCT_SIZES,
} from "../app/lib/fixtures";

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const round = (n: number) => Math.round(n * 100) / 100;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  color: string;
  size: string;
  category: string;
  img: string;
}

/**
 * Build `count` products with guaranteed-unique names: a per-run token plus a
 * monotonically increasing index makes every name unique within the run, and
 * we also skip anything already present in the DB.
 */
function buildProducts(
  count: number,
  existing: Set<string>,
  runToken: string,
): SeedProduct[] {
  const products: SeedProduct[] = [];
  const seen = new Set<string>();
  let i = 0;

  while (products.length < count) {
    i++;
    const base = pick(PRODUCT_NAMES);
    const name = `${base} ${runToken}-${String(i).padStart(4, "0")}`;
    if (seen.has(name) || existing.has(name)) continue; // verified unique
    seen.add(name);

    const category = pick(CATEGORIES);
    products.push({
      name,
      description: `${base} — premium ${category.toLowerCase()} built for everyday performance.`,
      price: round(9 + Math.random() * 1890),
      stock: Math.floor(Math.random() * 500),
      color: pick(PRODUCT_COLORS),
      size: pick(PRODUCT_SIZES),
      category,
      img: "",
    });
  }
  return products;
}

async function connectWithRetry(uri: string) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
      return;
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      console.warn(`… DB connect failed, retry ${attempt}/${MAX_RETRIES}`);
      await sleep(1000 * attempt);
    }
  }
}

/** Insert one batch with retry; tolerates partial (duplicate) failures. */
async function insertBatch(
  batch: SeedProduct[],
  label: string,
): Promise<number> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await Product.insertMany(batch, { ordered: false });
      return res.length;
    } catch (err) {
      const e = err as {
        code?: number;
        message?: string;
        writeErrors?: unknown[];
        insertedDocs?: unknown[];
        result?: { insertedCount?: number };
      };
      // ordered:false → some docs may have inserted despite errors (e.g. dupes).
      if (Array.isArray(e.writeErrors) || e.code === 11000) {
        const ok = e.result?.insertedCount ?? e.insertedDocs?.length ?? 0;
        console.warn(
          `⚠ ${label}: ${e.writeErrors?.length ?? 1} rejected, ${ok} inserted (skipping)`,
        );
        return ok;
      }
      if (attempt === MAX_RETRIES) {
        console.warn(
          `⚠ ${label}: failed after ${MAX_RETRIES} attempts — ${e.message}`,
        );
        return 0;
      }
      console.warn(
        `… ${label}: retry ${attempt}/${MAX_RETRIES} (${e.message})`,
      );
      await sleep(750 * attempt);
    }
  }
  return 0;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const reset = args.includes("--reset");
  const count = Number(args.find((a) => /^\d+$/.test(a))) || 1000;
  const runToken = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  if (dryRun) {
    const products = buildProducts(count, new Set(), runToken);
    const unique = new Set(products.map((p) => p.name)).size;
    console.log(
      `[dry-run] ${products.length} products · ${unique} unique names · ${Math.ceil(count / BATCH_SIZE)} batches of ${BATCH_SIZE}`,
    );
    console.table(
      products.slice(0, 5).map((p) => ({
        name: p.name,
        category: p.category,
        price: p.price,
      })),
    );
    return;
  }

  if (!process.env.MONGO_URI) {
    console.error(
      "MONGO_URI is not set. Add it to .env or run with --dry-run.",
    );
    process.exitCode = 1;
    return;
  }

  console.log("Connecting to MongoDB…");
  await connectWithRetry(process.env.MONGO_URI);

  if (reset) {
    const { deletedCount } = await Product.deleteMany({});
    console.log(`Removed ${deletedCount} existing product(s).`);
  }

  // Verified unique: don't collide with names already in the collection.
  const existingDocs = await Product.find({}, { name: 1, _id: 0 }).lean();
  const existing = new Set(
    existingDocs.map((d) => (d as { name: string }).name),
  );
  const products = buildProducts(count, existing, runToken);

  const totalBatches = Math.ceil(products.length / BATCH_SIZE);
  console.log(
    `Inserting ${products.length} products in ${totalBatches} batches of ${BATCH_SIZE} (run ${runToken})…`,
  );

  let inserted = 0;
  for (let b = 0; b < totalBatches; b++) {
    const batch = products.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    const n = await insertBatch(batch, `Batch ${b + 1}/${totalBatches}`);
    inserted += n;
    console.log(
      `  ✓ Batch ${b + 1}/${totalBatches}: +${n} (total ${inserted}/${count})`,
    );
  }

  // Verify what actually landed this run and that names are unique.
  const landed = await Product.countDocuments({ name: { $regex: runToken } });
  const distinct = (
    await Product.distinct("name", { name: { $regex: runToken } })
  ).length;
  const total = await Product.countDocuments({});
  console.log(
    `\n✓ Done. Inserted ${inserted}; verified ${landed} in DB, ${distinct} distinct (unique: ${landed === distinct}). Collection now holds ${total} products.`,
  );

  await mongoose.connection.close();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exitCode = 1;
});
