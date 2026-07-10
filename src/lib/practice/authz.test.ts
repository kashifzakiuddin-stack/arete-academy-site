import { describe, expect, it } from "vitest";

import { canAccessChild } from "./authz";

const CHILD = { id: "child-1", parentId: "parent-a" };

describe("canAccessChild — the boundary a parent must never cross", () => {
  it("lets a parent access their own child", () => {
    expect(
      canAccessChild({ id: "parent-a", role: "parent" }, CHILD, new Set())
    ).toBe(true);
  });

  it("never lets a parent access another family's child", () => {
    expect(
      canAccessChild({ id: "parent-b", role: "parent" }, CHILD, new Set())
    ).toBe(false);
  });

  it("never grants a parent access via tutor assignments, even forged ones", () => {
    // If an assignments row somehow existed pointing a parent at another
    // family's child, the parent role must still be refused.
    expect(
      canAccessChild(
        { id: "parent-b", role: "parent" },
        CHILD,
        new Set(["child-1"])
      )
    ).toBe(false);
  });

  it("refuses a tutor with no assignment", () => {
    expect(
      canAccessChild({ id: "tutor-t", role: "tutor" }, CHILD, new Set())
    ).toBe(false);
  });

  it("admits a tutor assigned to this child only", () => {
    const assigned = new Set(["child-1"]);
    expect(
      canAccessChild({ id: "tutor-t", role: "tutor" }, CHILD, assigned)
    ).toBe(true);
    expect(
      canAccessChild(
        { id: "tutor-t", role: "tutor" },
        { id: "child-2", parentId: "parent-b" },
        assigned
      )
    ).toBe(false);
  });

  it("refuses unknown roles outright", () => {
    expect(
      canAccessChild(
        // @ts-expect-error — deliberately malformed role
        { id: "someone", role: "admin" },
        CHILD,
        new Set(["child-1"])
      )
    ).toBe(false);
  });
});
