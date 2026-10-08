import type { FillResult, FillResultStatus } from "@/lib/form-engine/types";
import { verifyTextValue } from "@/lib/form-engine/executor/fill-text";

export function textFillVerified(
  el: HTMLInputElement | HTMLTextAreaElement,
  expected: string,
): boolean {
  return verifyTextValue(el, expected);
}

export function buildFillResult(params: {
  actionId: string;
  fieldId: string;
  status: FillResultStatus;
  verified: boolean;
  reason?: string;
  previousValue?: string;
  observedValue?: string;
}): FillResult {
  return {
    ...params,
    executedAt: new Date().toISOString(),
  };
}

/** FILLED only when verified string equality; otherwise FAILED. */
export function finalizeTextFillResult(
  actionId: string,
  fieldId: string,
  el: HTMLInputElement | HTMLTextAreaElement,
  expected: string,
  previousValue: string,
): FillResult {
  const verified = textFillVerified(el, expected);
  return buildFillResult({
    actionId,
    fieldId,
    status: verified ? "FILLED" : "FAILED",
    verified,
    previousValue,
    observedValue: el.value,
    reason: verified ? undefined : "Valor no DOM difere do esperado",
  });
}
