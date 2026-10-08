import { describe, expect, it } from "vitest";
import type { FormField } from "@/lib/form-engine/types";
import { matchField } from "./match-field";

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

describe("matchField", () => {
  it.each([
    ["E-mail", "personalInfo.email"],
    ["Email address", "personalInfo.email"],
    ["Correio eletrônico", "personalInfo.email"],
  ])("email sinônimo %s → %s", (label, path) => {
    const m = matchField(field({ fieldId: "1", label }));
    expect(m?.profilePath).toBe(path);
    expect(m!.confidence).toBeGreaterThan(0);
  });

  it.each([
    ["Nome completo", "personalInfo.fullName"],
    ["Full name", "personalInfo.fullName"],
  ])("nome %s → %s", (label, path) => {
    const m = matchField(field({ fieldId: "1", label }));
    expect(m?.profilePath).toBe(path);
  });

  it.each([
    ["Telefone", "personalInfo.phone"],
    ["Phone", "personalInfo.phone"],
    ["Celular", "personalInfo.phone"],
    ["  Celular  ", "personalInfo.phone"],
    ["WhatsApp", "personalInfo.phone"],
    ["Mobile phone", "personalInfo.phone"],
    ["Fone", "personalInfo.phone"],
    ["City", "personalInfo.city"],
    ["Cidade", "personalInfo.city"],
    ["Localidade", "personalInfo.city"],
    ["LinkedIn", "personalInfo.linkedin"],
    ["Linkedin URL", "personalInfo.linkedin"],
    ["Linked-In", "personalInfo.linkedin"],
    ["URL do perfil", "personalInfo.linkedin"],
  ])("%s → path correto", (label, path) => {
    expect(matchField(field({ fieldId: "1", label }))?.profilePath).toBe(path);
  });

  it("acentos em correio eletrônico normalizam", () => {
    expect(
      matchField(field({ fieldId: "1", label: "Correio eletrônico" }))
        ?.profilePath,
    ).toBe("personalInfo.email");
  });

  it("label xyz123 → undefined", () => {
    expect(matchField(field({ fieldId: "1", label: "xyz123" }))).toBeUndefined();
  });

  it("registra strategy label quando label casa", () => {
    const m = matchField(field({ fieldId: "1", label: "E-mail" }));
    expect(m?.strategy).toBe("label");
  });
});
