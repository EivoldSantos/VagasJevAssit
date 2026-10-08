import { describe, expect, it } from "vitest";
import { createEmptyProfile } from "./schema";
import { mergeProfiles } from "./merge-from-pdf";

describe("mergeProfiles fill-absent-only", () => {
  it("preserva email manual quando IA/PDF traz email diferente", () => {
    const base = createEmptyProfile();
    base.personalInfo.email = "manual@example.com";

    const incoming = createEmptyProfile();
    incoming.personalInfo.email = "pdf@example.com";

    const { merged, conflicts } = mergeProfiles(base, incoming, {
      mode: "fill-absent-only",
    });

    expect(merged.personalInfo.email).toBe("manual@example.com");
    expect(conflicts.some((c) => c.path === "personalInfo.email")).toBe(true);
  });

  it("preenche campo vazio com valor incoming", () => {
    const base = createEmptyProfile();
    const incoming = createEmptyProfile();
    incoming.personalInfo.fullName = "Maria PDF";

    const { merged } = mergeProfiles(base, incoming, {
      mode: "fill-absent-only",
    });
    expect(merged.personalInfo.fullName).toBe("Maria PDF");
  });
});
