import { describe, expect, it } from "vitest";
import {
  AnalyzeFormMessageSchema,
  SidePanelMessageSchema,
} from "./schemas";

describe("SidePanelMessageSchema", () => {
  it("aceita ANALYZE_FORM", () => {
    const r = SidePanelMessageSchema.safeParse({ type: "ANALYZE_FORM" });
    expect(r.success).toBe(true);
  });

  it("rejeita tipo desconhecido", () => {
    const r = SidePanelMessageSchema.safeParse({ type: "HACK" });
    expect(r.success).toBe(false);
  });
});

describe("AnalyzeFormMessageSchema", () => {
  it("exige type literal", () => {
    expect(AnalyzeFormMessageSchema.safeParse({}).success).toBe(false);
  });
});
