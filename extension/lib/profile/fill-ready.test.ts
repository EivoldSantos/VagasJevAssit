import { describe, expect, it } from "vitest";
import { createEmptyProfile } from "./schema";
import { toFillReadyProfile } from "./fill-ready";

describe("toFillReadyProfile", () => {
  it("exclui campo inferido não confirmado", () => {
    const p = createEmptyProfile();
    p.personalInfo.email = "ia@example.com";
    p.fieldMeta = {
      "personalInfo.email": {
        source: "inferred",
        verified: false,
        confidence: 0.5,
      },
    };
    const ready = toFillReadyProfile(p);
    expect(ready.personalInfo.email).toBeUndefined();
  });

  it("mantém campo manual confirmado", () => {
    const p = createEmptyProfile();
    p.personalInfo.fullName = "Ana";
    p.fieldMeta = {
      "personalInfo.fullName": {
        source: "manual",
        verified: true,
        confidence: 1,
      },
    };
    const ready = toFillReadyProfile(p);
    expect(ready.personalInfo.fullName).toBe("Ana");
  });
});
