import type { FillOperation, FormField } from "@/lib/form-engine/types";

export type ClassifierInput = {
  tagName: string;
  inputType?: string;
  name?: string;
  id?: string;
  autocomplete?: string;
  disabled?: boolean;
  visible?: boolean;
};

export type ClassifiedField = {
  sensitive: boolean;
  supportedOperations: FillOperation[];
};

function isTokenHint(input: ClassifierInput): boolean {
  const ac = (input.autocomplete || "").toLowerCase();
  if (ac === "one-time-code") return true;
  const blob = `${input.name || ""} ${input.id || ""}`.toLowerCase();
  return /\b(token|otp|2fa|verification.?code)\b/.test(blob);
}

export function classifyControl(input: ClassifierInput): ClassifiedField {
  const inputType = (input.inputType || "text").toLowerCase();
  const sensitive =
    inputType === "password" || (inputType !== "hidden" && isTokenHint(input));

  if (sensitive) {
    return {
      sensitive: true,
      supportedOperations: ["SKIP", "REQUEST_USER_INPUT"],
    };
  }

  if (!input.visible || input.disabled) {
    return {
      sensitive: false,
      supportedOperations: ["SKIP", "REQUEST_USER_INPUT"],
    };
  }

  if (
    inputType === "checkbox" ||
    inputType === "radio" ||
    inputType === "select"
  ) {
    const ops: FillOperation[] = ["SKIP", "REQUEST_USER_INPUT"];
    if (inputType === "checkbox") ops.unshift("CHECK", "UNCHECK");
    if (inputType === "radio" || inputType === "select") {
      ops.unshift("SELECT_OPTION");
    }
    return { sensitive: false, supportedOperations: ops };
  }

  return {
    sensitive: false,
    supportedOperations: ["FILL_TEXT", "SKIP", "REQUEST_USER_INPUT"],
  };
}

/** Apply classifier flags onto an extracted FormField. */
export function applyClassifierToField(field: FormField): FormField {
  const classified = classifyControl({
    tagName: field.tagName,
    inputType: field.inputType,
    name: field.name,
    id: field.id,
    disabled: field.disabled,
    visible: field.visible,
  });
  return {
    ...field,
    sensitive: classified.sensitive || field.sensitive,
    supportedOperations: classified.supportedOperations,
  };
}
