import { afterEach, describe, expect, it, vi } from "vitest";

import {
  cn,
  formatCompact,
  formatCurrency,
  formatDate,
  formatPercent,
  timeAgo,
} from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("resolves conflicting tailwind utilities, last one winning", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("accepts arrays and conditional objects", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
  });

  it("returns an empty string with no input", () => {
    expect(cn()).toBe("");
  });
});

describe("formatCompact", () => {
  it("shortens large numbers", () => {
    expect(formatCompact(12400)).toBe("12.4K");
    expect(formatCompact(3_100_000)).toBe("3.1M");
  });

  it("leaves small numbers intact", () => {
    expect(formatCompact(0)).toBe("0");
    expect(formatCompact(42)).toBe("42");
  });

  it("handles negatives", () => {
    expect(formatCompact(-1500)).toBe("-1.5K");
  });

  it("honours caller overrides", () => {
    expect(formatCompact(12456, { maximumFractionDigits: 2 })).toBe("12.46K");
    expect(formatCompact(1500, { notation: "standard" })).toBe("1,500");
  });
});

describe("formatCurrency", () => {
  it("formats as whole USD by default", () => {
    expect(formatCurrency(1234)).toBe("$1,234");
    expect(formatCurrency(0)).toBe("$0");
  });

  it("rounds away fractional cents by default", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("formats negatives", () => {
    expect(formatCurrency(-99)).toBe("-$99");
  });

  it("honours caller overrides", () => {
    expect(
      formatCurrency(1234.5, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ).toBe("$1,234.50");
  });
});

describe("formatPercent", () => {
  it("renders a signed percentage", () => {
    expect(formatPercent(0.125)).toBe("+12.5%");
    expect(formatPercent(-0.08)).toBe("-8%");
  });

  it("shows zero without a sign", () => {
    expect(formatPercent(0)).toBe("0%");
  });

  it("honours caller overrides", () => {
    expect(formatPercent(0.1234, { maximumFractionDigits: 0 })).toBe("+12%");
    expect(formatPercent(0.5, { signDisplay: "never" })).toBe("50%");
  });
});

describe("timeAgo", () => {
  const NOW = new Date("2026-06-24T12:00:00.000Z");

  const ago = (ms: number) => new Date(NOW.getTime() - ms);
  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  afterEach(() => {
    vi.useRealTimers();
  });

  const freeze = () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  };

  it("reports seconds under a minute", () => {
    freeze();
    expect(timeAgo(ago(3 * SECOND))).toBe("3s");
    expect(timeAgo(ago(59 * SECOND))).toBe("59s");
  });

  it("clamps anything newer than a second (and future dates) to 1s", () => {
    freeze();
    expect(timeAgo(NOW)).toBe("1s");
    expect(timeAgo(new Date(NOW.getTime() + 10 * MINUTE))).toBe("1s");
  });

  it("reports minutes under an hour", () => {
    freeze();
    expect(timeAgo(ago(MINUTE))).toBe("1m");
    expect(timeAgo(ago(59 * MINUTE))).toBe("59m");
  });

  it("reports hours under a day", () => {
    freeze();
    expect(timeAgo(ago(HOUR))).toBe("1h");
    expect(timeAgo(ago(23 * HOUR))).toBe("23h");
  });

  it("reports days under a week", () => {
    freeze();
    expect(timeAgo(ago(DAY))).toBe("1d");
    expect(timeAgo(ago(6 * DAY))).toBe("6d");
  });

  it("reports weeks up to four", () => {
    freeze();
    expect(timeAgo(ago(7 * DAY))).toBe("1w");
    expect(timeAgo(ago(34 * DAY))).toBe("4w");
  });

  it("reports months once past four weeks", () => {
    freeze();
    expect(timeAgo(ago(35 * DAY))).toBe("1mo");
    expect(timeAgo(ago(300 * DAY))).toBe("10mo");
  });

  it("reports years past twelve months", () => {
    freeze();
    expect(timeAgo(ago(365 * DAY))).toBe("1y");
    expect(timeAgo(ago(800 * DAY))).toBe("2y");
  });

  it("accepts an ISO string as well as a Date", () => {
    freeze();
    expect(timeAgo(ago(5 * MINUTE).toISOString())).toBe("5m");
  });
});

describe("formatDate", () => {
  it("formats a Date as a short absolute date", () => {
    expect(formatDate(new Date(2026, 5, 24))).toBe("Jun 24, 2026");
  });

  it("accepts an ISO string", () => {
    expect(formatDate("2026-01-02T10:00:00.000Z")).toMatch(
      /^Jan [12], 2026$/,
    );
  });
});
