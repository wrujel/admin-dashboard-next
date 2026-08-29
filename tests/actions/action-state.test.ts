import { describe, expect, it } from "vitest";

import {
  type ActionState,
  initialActionState,
} from "@/app/actions/action-state";

describe("initialActionState", () => {
  it("starts idle with no message", () => {
    expect(initialActionState).toEqual({ status: "idle" });
    expect(initialActionState.message).toBeUndefined();
  });

  it("is assignable to the ActionState contract", () => {
    const success: ActionState = { status: "success", message: "Saved." };
    const failure: ActionState = { status: "error", message: "Nope." };
    expect(success.status).toBe("success");
    expect(failure.status).toBe("error");
  });
});
