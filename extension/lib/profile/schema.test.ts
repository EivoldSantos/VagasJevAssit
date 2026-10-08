import { describe, expect, it } from "vitest";
import { CandidateProfileSchema, createEmptyProfile } from "./schema";

describe("CandidateProfileSchema", () => {
  it("rejeita experiência com fim antes do início (YYYY-MM)", () => {
    const base = createEmptyProfile();
    const draft = {
      ...base,
      experiences: [
        {
          company: "Acme",
          startDate: "2022-06",
          endDate: "2020-01",
        },
      ],
    };
    const result = CandidateProfileSchema.safeParse(draft);
    expect(result.success).toBe(false);
  });

  it("aceita experiência current sem endDate", () => {
    const base = createEmptyProfile();
    const draft = {
      ...base,
      experiences: [
        {
          company: "Acme",
          startDate: "2020-01",
          current: true,
        },
      ],
    };
    const result = CandidateProfileSchema.safeParse(draft);
    expect(result.success).toBe(true);
  });
});
