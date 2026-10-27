import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isOffice, requireRole, isStaff } from "../src/lib/access.ts";

describe("access rules", () => {
  it("office is manager or deputy", () => {
    assert.equal(isOffice("manager"), true);
    assert.equal(isOffice("deputy"), true);
    assert.equal(isOffice("teacher"), false);
    assert.equal(isOffice("student"), false);
  });

  it("requireRole allows only listed roles", () => {
    assert.equal(requireRole("teacher", ["teacher", "manager"]), true);
    assert.equal(requireRole("student", ["teacher", "manager"]), false);
    assert.equal(requireRole(null, ["manager"]), false);
  });

  it("staff includes teacher", () => {
    assert.equal(isStaff("teacher"), true);
    assert.equal(isStaff("student"), false);
  });
});
