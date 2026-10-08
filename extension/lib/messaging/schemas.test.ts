import { describe, expect, it } from "vitest";
import {
  AnalyzeFormMessageSchema,
  AutofillFormMessageSchema,
  AutofillResponseSchema,
  FillCompleteMessageSchema,
  SidePanelMessageSchema,
} from "./schemas";

describe("SidePanelMessageSchema", () => {
  it("aceita ANALYZE_FORM", () => {
    const r = SidePanelMessageSchema.safeParse({ type: "ANALYZE_FORM" });
    expect(r.success).toBe(true);
  });

  it("aceita AUTOFILL_FORM", () => {
    const r = SidePanelMessageSchema.safeParse({ type: "AUTOFILL_FORM" });
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

describe("AutofillFormMessageSchema", () => {
  it("rejeita payload AUTOFILL inválido", () => {
    expect(
      AutofillFormMessageSchema.safeParse({ type: "AUTOFILL_FORM", tabId: -1 })
        .success,
    ).toBe(false);
    expect(
      AutofillFormMessageSchema.safeParse({ type: "AUTOFILL" }).success,
    ).toBe(false);
  });

  it("aceita tabId opcional", () => {
    expect(
      AutofillFormMessageSchema.safeParse({
        type: "AUTOFILL_FORM",
        tabId: 42,
      }).success,
    ).toBe(true);
  });
});

describe("AutofillResponseSchema", () => {
  it("roundtrip AUTOFILL ok payload", () => {
    const r = AutofillResponseSchema.safeParse({
      ok: true,
      snapshotId: "s1",
      results: [],
      executionState: "READY",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita ok:true sem snapshotId", () => {
    expect(
      AutofillResponseSchema.safeParse({
        ok: true,
        results: [],
        executionState: "READY",
      }).success,
    ).toBe(false);
  });
});

describe("FillCompleteMessageSchema", () => {
  it("aceita FILL_COMPLETE com results", () => {
    const r = FillCompleteMessageSchema.safeParse({
      type: "FILL_COMPLETE",
      data: {
        snapshotId: "snap-1",
        results: [
          {
            actionId: "a1",
            fieldId: "f1",
            status: "FILLED",
            verified: true,
            executedAt: new Date().toISOString(),
          },
        ],
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejeita results malformados", () => {
    const r = FillCompleteMessageSchema.safeParse({
      type: "FILL_COMPLETE",
      data: { snapshotId: "x", results: [{ status: "HACK" }] },
    });
    expect(r.success).toBe(false);
  });
});
