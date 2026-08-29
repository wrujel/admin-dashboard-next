import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { useMounted } from "@/app/lib/use-mounted";

function Probe() {
  return <span data-testid="probe">{String(useMounted())}</span>;
}

describe("useMounted", () => {
  it("is true once mounted in the browser", () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current).toBe(true);
  });

  it("is false during server rendering", () => {
    expect(renderToStaticMarkup(<Probe />)).toContain("false");
  });

  it("stays true across re-renders", () => {
    const { result, rerender } = renderHook(() => useMounted());
    rerender();
    rerender();
    expect(result.current).toBe(true);
  });

  it("does not tear down or resubscribe on unmount", () => {
    const { unmount } = renderHook(() => useMounted());
    expect(() => unmount()).not.toThrow();
  });

  it("is independent per consumer", () => {
    const a = renderHook(() => useMounted());
    const b = renderHook(() => useMounted());
    expect(a.result.current).toBe(true);
    expect(b.result.current).toBe(true);
  });
});
