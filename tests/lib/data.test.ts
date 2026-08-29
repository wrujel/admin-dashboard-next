import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RevenueRange } from "@/app/lib/types";

/**
 * The data layer degrades from live MongoDB to deterministic mock data. Every
 * branch of that fallback is covered: no configured database, a query that
 * throws, a query that hangs past the timeout, and an empty result set.
 */

const { userQuery, productQuery, User, Product } = vi.hoisted(() => {
  const chain = () => {
    const q = {
      sort: vi.fn(() => q),
      lean: vi.fn(() => q),
      exec: vi.fn(),
    };
    return q;
  };
  const userQuery = chain();
  const productQuery = chain();
  return {
    userQuery,
    productQuery,
    User: {
      countDocuments: vi.fn(() => ({ exec: vi.fn() })),
      find: vi.fn(() => userQuery),
      findById: vi.fn(() => userQuery),
    },
    Product: {
      countDocuments: vi.fn(() => ({ exec: vi.fn() })),
      find: vi.fn(() => productQuery),
      findById: vi.fn(() => productQuery),
    },
  };
});

const { connectToDB } = vi.hoisted(() => ({ connectToDB: vi.fn() }));

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  // React's request-scoped cache needs a render context; identity keeps each
  // loader independently callable under test.
  cache: <T>(fn: T) => fn,
}));

vi.mock("@/app/lib/utils", () => ({ connectToDB }));
vi.mock("@/app/models/user", () => ({ User }));
vi.mock("@/app/models/product", () => ({ Product }));

async function loadData() {
  vi.resetModules();
  return import("@/app/lib/data");
}

/** Points countDocuments at a resolved value. */
const counts = (model: typeof User | typeof Product, value: unknown) => {
  model.countDocuments.mockReturnValue({
    exec: vi.fn().mockResolvedValue(value),
  });
};

const withDb = () => {
  process.env.MONGO_URI = "mongodb://localhost/nexus";
};

beforeEach(() => {
  // resetAllMocks, not clearAllMocks: clear only drops recorded calls, which
  // would let a mockRejectedValue set by one test leak into every later one.
  vi.resetAllMocks();
  delete process.env.MONGO_URI;

  counts(User, 5);
  counts(Product, 9);

  userQuery.sort.mockReturnValue(userQuery);
  userQuery.lean.mockReturnValue(userQuery);
  userQuery.exec.mockResolvedValue([]);
  productQuery.sort.mockReturnValue(productQuery);
  productQuery.lean.mockReturnValue(productQuery);
  productQuery.exec.mockResolvedValue([]);

  User.find.mockReturnValue(userQuery);
  User.findById.mockReturnValue(userQuery);
  Product.find.mockReturnValue(productQuery);
  Product.findById.mockReturnValue(productQuery);
});

afterEach(() => {
  delete process.env.MONGO_URI;
  vi.useRealTimers();
});

/* --------------------------------- overview -------------------------------- */

describe("getDashboardData — demo mode", () => {
  it("uses the documented placeholder counts and reports the demo source", async () => {
    const { getDashboardData } = await loadData();
    const data = await getDashboardData();

    expect(data.source).toBe("demo");
    expect(data.counts).toEqual({ users: 18420, products: 642 });
    expect(connectToDB).not.toHaveBeenCalled();
  });

  it("fills every dashboard panel", async () => {
    const { getDashboardData } = await loadData();
    const data = await getDashboardData();

    expect(data.revenue).toHaveLength(30);
    expect(data.kpis).toHaveLength(4);
    expect(data.transactions).toHaveLength(7);
    expect(data.topProducts).toHaveLength(6);
    expect(data.activity).toHaveLength(8);
    expect(data.categories.length).toBeGreaterThan(0);
    expect(data.traffic.length).toBeGreaterThan(0);
  });

  it("builds the KPIs from the placeholder counts", async () => {
    const { getDashboardData } = await loadData();
    const data = await getDashboardData();

    const users = data.kpis.find((k) => k.key === "users")!;
    expect(users.value).toBe(18420);
    expect(users.hint).toBe("642 products live");
  });
});

describe("getDashboardData — live", () => {
  beforeEach(withDb);

  it("uses the live counts and reports the live source", async () => {
    counts(User, 42);
    counts(Product, 7);

    const { getDashboardData } = await loadData();
    const data = await getDashboardData();

    expect(data.source).toBe("live");
    expect(data.counts).toEqual({ users: 42, products: 7 });
    expect(connectToDB).toHaveBeenCalled();
  });

  it("counts zero users as live rather than falling back", async () => {
    counts(User, 0);
    counts(Product, 0);

    const { getDashboardData } = await loadData();
    const data = await getDashboardData();

    expect(data.source).toBe("live");
    expect(data.counts).toEqual({ users: 0, products: 0 });
  });

  it("falls back to demo numbers when the query throws", async () => {
    User.countDocuments.mockReturnValue({
      exec: vi.fn().mockRejectedValue(new Error("connection reset")),
    });
    Product.countDocuments.mockReturnValue({
      exec: vi.fn().mockRejectedValue(new Error("connection reset")),
    });

    const { getDashboardData } = await loadData();
    const data = await getDashboardData();

    expect(data.source).toBe("demo");
    expect(data.counts).toEqual({ users: 18420, products: 642 });
  });

  it("falls back to demo numbers when the connection itself fails", async () => {
    connectToDB.mockRejectedValue(new Error("Error connecting to database"));

    const { getDashboardData } = await loadData();
    const data = await getDashboardData();

    expect(data.source).toBe("demo");
  });

  it("gives up on a hanging query rather than blocking the render", async () => {
    vi.useFakeTimers();
    User.countDocuments.mockReturnValue({
      exec: vi.fn(() => new Promise(() => {})),
    });
    Product.countDocuments.mockReturnValue({
      exec: vi.fn(() => new Promise(() => {})),
    });

    const { getDashboardData } = await loadData();
    const pending = getDashboardData();
    // The user and product counts are awaited in sequence, so the second
    // guard timer only starts once the first has fired.
    await vi.advanceTimersByTimeAsync(3000);
    await vi.advanceTimersByTimeAsync(3000);
    const data = await pending;

    expect(data.source).toBe("demo");
    expect(data.counts).toEqual({ users: 18420, products: 642 });
  });
});

/* ---------------------------------- revenue -------------------------------- */

describe("getRevenueData", () => {
  const RANGES: RevenueRange[] = ["7d", "30d", "q", "s", "y"];

  it.each(RANGES)("echoes the requested range %s", async (range) => {
    const { getRevenueData } = await loadData();
    const data = await getRevenueData(range);
    expect(data.range).toBe(range);
    expect(data.series.length).toBeGreaterThan(0);
  });

  it("returns the four revenue KPIs in order", async () => {
    const { getRevenueData } = await loadData();
    const data = await getRevenueData("30d");
    expect(data.kpis.map((k) => k.key)).toEqual([
      "revenue",
      "profit",
      "aov",
      "orders",
    ]);
  });

  it("totals revenue, profit and orders across the series", async () => {
    const { getRevenueData } = await loadData();
    const data = await getRevenueData("30d");

    const sum = (k: "revenue" | "profit" | "orders") =>
      data.series.reduce((a, p) => a + p[k], 0);

    expect(data.kpis[0].value).toBe(sum("revenue"));
    expect(data.kpis[1].value).toBe(sum("profit"));
    expect(data.kpis[3].value).toBe(sum("orders"));
    expect(data.kpis[2].value).toBeCloseTo(sum("revenue") / sum("orders"), 6);
  });

  it("reports the gross margin as a hint", async () => {
    const { getRevenueData } = await loadData();
    const data = await getRevenueData("30d");
    expect(data.kpis[1].hint).toMatch(/^\d+% margin$/);
  });

  it("caps every KPI sparkline at 14 points", async () => {
    const { getRevenueData } = await loadData();
    const data = await getRevenueData("30d");
    for (const kpi of data.kpis) expect(kpi.spark).toHaveLength(14);
  });

  it.each(RANGES)(
    "normalises each breakdown for %s to the period total",
    async (range) => {
      const { getRevenueData } = await loadData();
      const data = await getRevenueData(range);
      const total = data.series.reduce((a, p) => a + p.revenue, 0);

      for (const breakdown of [data.channels, data.categories, data.regions]) {
        const sum = breakdown.reduce((a, d) => a + d.value, 0);
        // Each slice is rounded independently, so allow one unit of drift
        // per slice.
        expect(Math.abs(sum - total)).toBeLessThanOrEqual(breakdown.length);
      }
    },
  );

  it("keeps the breakdown labels and colours", async () => {
    const { getRevenueData } = await loadData();
    const data = await getRevenueData("30d");
    for (const row of [...data.channels, ...data.categories, ...data.regions]) {
      expect(row.name).toBeTruthy();
      expect(row.color).toMatch(/^var\(--color-/);
    }
  });
});

describe("getRevenueData — degenerate series", () => {
  /**
   * The generators never emit a zero day, but the KPI maths still guards
   * every division. A stubbed all-zero period exercises those guards.
   */
  const zeroSeries = Array.from({ length: 4 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
    label: `Jan ${i + 1}`,
    revenue: 0,
    profit: 0,
    orders: 0,
    visitors: 0,
  }));

  afterEach(() => {
    vi.doUnmock("@/app/lib/mock");
  });

  async function loadWithZeroes() {
    vi.doMock("@/app/lib/mock", async (importOriginal) => ({
      ...(await importOriginal<typeof import("@/app/lib/mock")>()),
      revenueRangeSeries: () => zeroSeries,
      revenueByChannel: () => [
        { name: "Online store", value: 0, color: "var(--color-chart-1)" },
      ],
      revenueByCategory: () => [
        { name: "Phones", value: 0, color: "var(--color-chart-1)" },
      ],
      revenueByRegion: () => [
        { name: "Europe", value: 0, color: "var(--color-chart-1)" },
      ],
    }));
    vi.resetModules();
    return import("@/app/lib/data");
  }

  it("reports zero rather than NaN for every derived KPI", async () => {
    const { getRevenueData } = await loadWithZeroes();
    const data = await getRevenueData("30d");

    for (const kpi of data.kpis) {
      expect(kpi.value).toBe(0);
      expect(kpi.delta).toBe(0);
      expect(Number.isNaN(kpi.value)).toBe(false);
    }
  });

  it("reports a zero margin instead of dividing by zero revenue", async () => {
    const { getRevenueData } = await loadWithZeroes();
    const data = await getRevenueData("30d");
    expect(data.kpis[1].hint).toBe("0% margin");
  });

  it("zeroes the average-order-value sparkline for days with no orders", async () => {
    const { getRevenueData } = await loadWithZeroes();
    const data = await getRevenueData("30d");
    expect(data.kpis[2].spark).toEqual([0, 0, 0, 0]);
  });

  it("normalises an all-zero breakdown to zero without dividing by zero", async () => {
    const { getRevenueData } = await loadWithZeroes();
    const data = await getRevenueData("30d");

    for (const breakdown of [data.channels, data.categories, data.regions]) {
      expect(breakdown).toHaveLength(1);
      expect(breakdown[0].value).toBe(0);
      expect(Number.isNaN(breakdown[0].value)).toBe(false);
    }
  });
});

/* ----------------------------------- users --------------------------------- */

describe("getUsersData", () => {
  it("returns mock users when no database is configured", async () => {
    const { getUsersData } = await loadData();
    const users = await getUsersData();

    expect(users).toHaveLength(32);
    expect(User.find).not.toHaveBeenCalled();
  });

  describe("live", () => {
    beforeEach(withDb);

    it("maps live documents onto the row shape", async () => {
      userQuery.exec.mockResolvedValue([
        {
          _id: { toString: () => "507f1f77bcf86cd799439011" },
          username: "ada",
          email: "ada@example.com",
          isAdmin: true,
          isActive: true,
          img: "https://cdn/ada.png",
          createdAt: new Date("2026-01-02T03:04:05.000Z"),
        },
      ]);

      const { getUsersData } = await loadData();
      const [user] = await getUsersData();

      expect(user).toEqual({
        id: "507f1f77bcf86cd799439011",
        name: "ada",
        email: "ada@example.com",
        role: "admin",
        status: "active",
        spend: 0,
        orders: 0,
        createdAt: "2026-01-02T03:04:05.000Z",
        img: "https://cdn/ada.png",
      });
      expect(userQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it("falls back for every missing or empty field", async () => {
      userQuery.exec.mockResolvedValue([{ _id: "u1", img: "" }]);

      const { getUsersData } = await loadData();
      const [user] = await getUsersData();

      expect(user.name).toBe("Unknown");
      expect(user.email).toBe("");
      expect(user.role).toBe("viewer");
      expect(user.status).toBe("active");
      expect(user.img).toBeUndefined();
      expect(new Date(user.createdAt).toString()).not.toBe("Invalid Date");
    });

    it("maps a non-admin to viewer and an inactive user to suspended", async () => {
      userQuery.exec.mockResolvedValue([
        { _id: "u1", isAdmin: false, isActive: false },
      ]);

      const { getUsersData } = await loadData();
      const [user] = await getUsersData();

      expect(user.role).toBe("viewer");
      expect(user.status).toBe("suspended");
    });

    it("treats a missing isActive as active", async () => {
      userQuery.exec.mockResolvedValue([{ _id: "u1" }]);
      const { getUsersData } = await loadData();
      expect((await getUsersData())[0].status).toBe("active");
    });

    it("falls back to mock rows when the collection is empty", async () => {
      userQuery.exec.mockResolvedValue([]);
      const { getUsersData } = await loadData();
      expect(await getUsersData()).toHaveLength(32);
    });

    it("falls back to mock rows when the query throws", async () => {
      userQuery.exec.mockRejectedValue(new Error("connection reset"));
      const { getUsersData } = await loadData();
      expect(await getUsersData()).toHaveLength(32);
    });
  });
});

describe("getUserById", () => {
  it("looks the id up in the mock rows when no database is configured", async () => {
    const { getUserById, getUsersData } = await loadData();
    const [first] = await getUsersData();

    await expect(getUserById(first.id)).resolves.toMatchObject({
      id: first.id,
    });
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("returns null for an unknown id", async () => {
    const { getUserById } = await loadData();
    await expect(getUserById("nope")).resolves.toBeNull();
  });

  describe("live", () => {
    beforeEach(withDb);

    it("returns the mapped live document", async () => {
      userQuery.exec.mockResolvedValue({
        _id: "u1",
        username: "ada",
        email: "ada@example.com",
        isAdmin: true,
      });

      const { getUserById } = await loadData();
      await expect(getUserById("u1")).resolves.toMatchObject({
        id: "u1",
        name: "ada",
        role: "admin",
      });
      expect(User.findById).toHaveBeenCalledWith("u1");
    });

    it("falls back to the row list when the document is missing", async () => {
      userQuery.exec.mockResolvedValue(null);

      const { getUserById } = await loadData();
      await expect(getUserById("missing")).resolves.toBeNull();
    });

    it("falls back to the row list when the lookup throws", async () => {
      userQuery.exec.mockRejectedValue(new Error("bad ObjectId"));

      const { getUserById } = await loadData();
      await expect(getUserById("???")).resolves.toBeNull();
    });
  });
});

/* --------------------------------- products -------------------------------- */

describe("getProductsData", () => {
  it("returns mock products when no database is configured", async () => {
    const { getProductsData } = await loadData();
    const products = await getProductsData();

    expect(products).toHaveLength(28);
    expect(Product.find).not.toHaveBeenCalled();
  });

  describe("live", () => {
    beforeEach(withDb);

    it("maps live documents onto the row shape", async () => {
      productQuery.exec.mockResolvedValue([
        {
          _id: "p1",
          name: "Aurora Phone X",
          price: 999,
          stock: 12,
          category: "Phones",
          img: "https://cdn/phone.png",
          createdAt: new Date("2026-01-02T03:04:05.000Z"),
        },
      ]);

      const { getProductsData } = await loadData();
      const [product] = await getProductsData();

      expect(product).toEqual({
        id: "p1",
        name: "Aurora Phone X",
        category: "Phones",
        price: 999,
        stock: 12,
        status: "active",
        createdAt: "2026-01-02T03:04:05.000Z",
        img: "https://cdn/phone.png",
      });
      expect(productQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it("falls back for every missing or empty field", async () => {
      productQuery.exec.mockResolvedValue([
        { _id: "p1", category: "", img: "" },
      ]);

      const { getProductsData } = await loadData();
      const [product] = await getProductsData();

      expect(product.name).toBe("Untitled");
      expect(product.category).toBe("General");
      expect(product.price).toBe(0);
      expect(product.stock).toBe(0);
      expect(product.status).toBe("out_of_stock");
      expect(product.img).toBeUndefined();
    });

    it("marks a zero-stock product out of stock", async () => {
      productQuery.exec.mockResolvedValue([
        { _id: "p1", name: "Sold out", stock: 0 },
      ]);
      const { getProductsData } = await loadData();
      expect((await getProductsData())[0].status).toBe("out_of_stock");
    });

    it("falls back to mock rows when the collection is empty", async () => {
      productQuery.exec.mockResolvedValue([]);
      const { getProductsData } = await loadData();
      expect(await getProductsData()).toHaveLength(28);
    });

    it("falls back to mock rows when the query throws", async () => {
      productQuery.exec.mockRejectedValue(new Error("connection reset"));
      const { getProductsData } = await loadData();
      expect(await getProductsData()).toHaveLength(28);
    });
  });
});

describe("getProductById", () => {
  it("looks the id up in the mock rows when no database is configured", async () => {
    const { getProductById, getProductsData } = await loadData();
    const [first] = await getProductsData();

    await expect(getProductById(first.id)).resolves.toMatchObject({
      id: first.id,
    });
    expect(Product.findById).not.toHaveBeenCalled();
  });

  it("returns null for an unknown id", async () => {
    const { getProductById } = await loadData();
    await expect(getProductById("nope")).resolves.toBeNull();
  });

  describe("live", () => {
    beforeEach(withDb);

    it("returns the mapped live document", async () => {
      productQuery.exec.mockResolvedValue({
        _id: "p1",
        name: "Aurora Phone X",
        price: 999,
        stock: 3,
      });

      const { getProductById } = await loadData();
      await expect(getProductById("p1")).resolves.toMatchObject({
        id: "p1",
        name: "Aurora Phone X",
        status: "active",
      });
      expect(Product.findById).toHaveBeenCalledWith("p1");
    });

    it("falls back to the row list when the document is missing", async () => {
      productQuery.exec.mockResolvedValue(null);
      const { getProductById } = await loadData();
      await expect(getProductById("missing")).resolves.toBeNull();
    });

    it("falls back to the row list when the lookup throws", async () => {
      productQuery.exec.mockRejectedValue(new Error("bad ObjectId"));
      const { getProductById } = await loadData();
      await expect(getProductById("???")).resolves.toBeNull();
    });
  });
});

/* --------------------------------- activity -------------------------------- */

describe("getActivityFeed", () => {
  it("returns 24 events by default", async () => {
    const { getActivityFeed } = await loadData();
    await expect(getActivityFeed()).resolves.toHaveLength(24);
  });

  it("honours an explicit limit", async () => {
    const { getActivityFeed } = await loadData();
    await expect(getActivityFeed(5)).resolves.toHaveLength(5);
  });

  it("is deterministic", async () => {
    const { getActivityFeed } = await loadData();
    expect(await getActivityFeed(10)).toEqual(await getActivityFeed(10));
  });
});
