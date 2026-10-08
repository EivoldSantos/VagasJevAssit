import { describe, expect, it } from "vitest";
import type { FormField } from "@/lib/form-engine/types";
import type { CandidateProfile } from "@/lib/profile/schema";
import { planFillActions, profileMissingFillMinimum } from "./planner";

function field(partial: Partial<FormField> & { fieldId: string }): FormField {
  return {
    snapshotId: "snap-1",
    tagName: "input",
    inputType: "text",
    required: false,
    visible: true,
    disabled: false,
    supportedOperations: ["FILL_TEXT", "SKIP", "REQUEST_USER_INPUT"],
    sensitive: false,
    domIndex: 0,
    ...partial,
  };
}

const baseProfile: CandidateProfile = {
  personalInfo: {
    fullName: "Ana Silva",
    email: "ana@example.com",
  },
  experiences: [],
  education: [],
  updatedAt: new Date().toISOString(),
};

describe("profileMissingFillMinimum", () => {
  it("bloqueia perfil ausente", () => {
    expect(profileMissingFillMinimum(null)).toBe(true);
  });

  it("bloqueia sem email e nome", () => {
    expect(
      profileMissingFillMinimum({
        ...baseProfile,
        personalInfo: {},
      }),
    ).toBe(true);
  });
});

describe("planFillActions", () => {
  it("SKIP quando currentValue não vazio (D-07)", () => {
    const actions = planFillActions(
      "snap-1",
      [
        field({
          fieldId: "f1",
          label: "E-mail",
          domIndex: 0,
          currentValue: "existente@x.com",
        }),
      ],
      baseProfile,
    );
    expect(actions[0].operation).toBe("SKIP");
  });

  it("FILL_TEXT para email conhecido vazio", () => {
    const actions = planFillActions(
      "snap-1",
      [
        field({
          fieldId: "f1",
          label: "E-mail",
          domIndex: 0,
          currentValue: "",
        }),
      ],
      baseProfile,
    );
    expect(actions[0].operation).toBe("FILL_TEXT");
    expect(actions[0].value).toBe("ana@example.com");
    expect(actions[0].source).toBe("deterministic");
  });

  it("SKIP sem value para label desconhecida (D-10)", () => {
    const actions = planFillActions(
      "snap-1",
      [
        field({
          fieldId: "f1",
          label: "xyz123",
          domIndex: 0,
          currentValue: "",
        }),
      ],
      baseProfile,
    );
    expect(actions[0].operation).toBe("SKIP");
    expect(actions[0].value).toBeUndefined();
  });

  it("REQUEST_USER_INPUT para textarea cover letter sem valor no perfil", () => {
    const actions = planFillActions(
      "snap-1",
      [
        field({
          fieldId: "cl",
          label: "Carta de apresentação",
          tagName: "textarea",
          inputType: "textarea",
          domIndex: 0,
          currentValue: "",
        }),
      ],
      baseProfile,
    );
    expect(actions[0].operation).toBe("REQUEST_USER_INPUT");
    expect(actions[0].value).toBeUndefined();
  });

  it("FILL_TEXT telefone quando perfil tem phone", () => {
    const actions = planFillActions(
      "snap-1",
      [
        field({
          fieldId: "ph",
          label: "Celular",
          domIndex: 0,
          currentValue: "",
        }),
      ],
      {
        ...baseProfile,
        personalInfo: {
          ...baseProfile.personalInfo,
          phone: "+55 11 99999-0000",
        },
      },
    );
    expect(actions[0].operation).toBe("FILL_TEXT");
    expect(actions[0].value).toBe("+55 11 99999-0000");
  });
});
