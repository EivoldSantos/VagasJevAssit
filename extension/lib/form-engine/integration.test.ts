/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import type { FormField } from "@/lib/form-engine/types";
import { planFillActions } from "@/lib/form-engine/planner";
import type { CandidateProfile } from "@/lib/profile/schema";
import { classifyControl } from "@/lib/form-engine/classifier";
import { compileFillOperation } from "@/lib/form-engine/action-space";
import { executeAction } from "@/lib/form-engine/executor/index";
import { AutofillResponseSchema } from "@/lib/messaging/schemas";

function labField(
  partial: Partial<FormField> & { fieldId: string; domIndex: number },
): FormField {
  return {
    snapshotId: "lab-snap",
    tagName: "input",
    inputType: "text",
    required: false,
    visible: true,
    disabled: false,
    supportedOperations: ["FILL_TEXT", "SKIP", "REQUEST_USER_INPUT"],
    sensitive: false,
    currentValue: "",
    ...partial,
  };
}

const fillReadyProfile: CandidateProfile = {
  personalInfo: {
    fullName: "João Teste",
    email: "joao@example.com",
    phone: "+55 21 98888-7777",
    city: "Rio de Janeiro",
    linkedin: "https://linkedin.com/in/joao",
  },
  experiences: [],
  education: [],
  updatedAt: new Date().toISOString(),
};

/** Fixtures estilo matriz do lab (Phase 4). */
function labSnapshotFields(): FormField[] {
  const passwordClass = classifyControl({
    tagName: "input",
    inputType: "password",
    visible: true,
    disabled: false,
  });
  return [
    labField({ fieldId: "name", label: "Nome completo", domIndex: 0 }),
    labField({ fieldId: "email", label: "E-mail", domIndex: 1 }),
    labField({ fieldId: "phone", label: "Celular", domIndex: 2 }),
    labField({ fieldId: "city", label: "Cidade", domIndex: 3 }),
    labField({
      fieldId: "linkedin",
      label: "LinkedIn URL",
      domIndex: 4,
    }),
    labField({
      fieldId: "unknown",
      label: "Campo proprietário xyz",
      domIndex: 5,
    }),
    {
      ...labField({
        fieldId: "pwd",
        label: "Senha",
        domIndex: 6,
        inputType: "password",
      }),
      sensitive: passwordClass.sensitive,
      supportedOperations: passwordClass.supportedOperations,
    },
    labField({
      fieldId: "prefilled",
      label: "E-mail secundário",
      domIndex: 7,
      currentValue: "manual@user.com",
    }),
    {
      ...labField({
        fieldId: "cover",
        label: "Cover letter",
        domIndex: 8,
        tagName: "textarea",
        inputType: "textarea",
      }),
      supportedOperations: ["FILL_TEXT", "SKIP", "REQUEST_USER_INPUT"],
    },
  ];
}

describe("form-engine integration (planner + guards)", () => {
  it("plano lab-like: sem SUBMIT, sensível sem FILL_TEXT com valor", () => {
    const fields = labSnapshotFields();
    const actions = planFillActions("lab-snap", fields, fillReadyProfile);

    for (const action of actions) {
      expect(() => compileFillOperation(action.operation)).not.toThrow();
      expect(action.operation).not.toBe("SUBMIT" as never);
    }

    const byField = new Map(actions.map((a) => [a.fieldId, a]));
    expect(byField.get("pwd")?.operation).toBe("SKIP");
    expect(byField.get("pwd")?.value).toBeUndefined();

    expect(byField.get("email")?.operation).toBe("FILL_TEXT");
    expect(byField.get("prefilled")?.operation).toBe("SKIP");
  });

  it("labels desconhecidas: SKIP ou REQUEST_USER_INPUT sem value inventado", () => {
    const fields = labSnapshotFields();
    const actions = planFillActions("lab-snap", fields, fillReadyProfile);
    const unknownish = actions.filter((a) =>
      ["unknown", "cover"].includes(a.fieldId),
    );
    expect(unknownish.length).toBeGreaterThan(0);
    for (const action of unknownish) {
      expect(["SKIP", "REQUEST_USER_INPUT"]).toContain(action.operation);
      expect(action.value).toBeUndefined();
    }
  });

  it("planner não dispara fetch (sem IA)", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("fetch should not run"),
    );
    planFillActions("snap", labSnapshotFields(), fillReadyProfile);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("executor stub: SKIP sensível não altera DOM", () => {
    const input = document.createElement("input");
    input.type = "password";
    const result = executeAction(
      {
        actionId: "a1",
        fieldId: "pwd",
        snapshotId: "s1",
        domIndex: 6,
        operation: "FILL_TEXT",
        value: "hack",
        source: "deterministic",
        confidence: 1,
        requiresReview: false,
        expectedOutcome: "test",
      },
      {
        resolveElement: () => input,
        getField: () =>
          labSnapshotFields().find((f) => f.fieldId === "pwd") ?? null,
      },
    );
    expect(result.status).toBe("SKIPPED");
    expect(input.value).toBe("");
  });
});

describe("AutofillResponseSchema roundtrip", () => {
  it("aceita resposta ok com results", () => {
    const payload = {
      ok: true as const,
      snapshotId: "snap-abc",
      results: [
        {
          actionId: "act-1",
          fieldId: "email",
          status: "FILLED" as const,
          verified: true,
          executedAt: new Date().toISOString(),
        },
      ],
      tabUrl: "http://127.0.0.1:5173/",
      executionState: "READY" as const,
    };
    const parsed = AutofillResponseSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it("aceita falha PROFILE_INCOMPLETE", () => {
    const parsed = AutofillResponseSchema.safeParse({
      ok: false,
      error:
        "Perfil incompleto: cadastre pelo menos nome completo ou e-mail em Perfil antes de autopreencher.",
      code: "PROFILE_INCOMPLETE",
      executionState: "FAILED",
    });
    expect(parsed.success).toBe(true);
  });
});
