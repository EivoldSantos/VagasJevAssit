import type { FillOperation } from "@/lib/form-engine/types";
import { FillOperationSchema } from "@/lib/form-engine/types";

export const SUBMIT_HINTS = [
  "submit",
  "enviar",
  "send",
  "candidatura",
  "aplicar",
  "apply",
] as const;

const KNOWN_OPERATIONS = new Set<string>(
  FillOperationSchema._def.values as string[],
);

export function assertNeverSubmit(op: string): void {
  if (op === "SUBMIT" || op.toUpperCase() === "SUBMIT") {
    throw new Error("SUBMIT is not allowed in the action space (D-18)");
  }
}

export function compileFillOperation(raw: string): FillOperation {
  assertNeverSubmit(raw);
  const parsed = FillOperationSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Unknown fill operation: ${raw}`);
  }
  return parsed.data;
}

export function isKnownFillOperation(op: string): boolean {
  try {
    assertNeverSubmit(op);
  } catch {
    return false;
  }
  return KNOWN_OPERATIONS.has(op);
}

export function isSubmitLikeControl(el: HTMLElement): boolean {
  if (el.tagName === "BUTTON") {
    const type = (el.getAttribute("type") || "").toLowerCase();
    if (type === "submit") return true;
  }
  if (el instanceof HTMLInputElement && el.type === "submit") return true;
  const id = (el.id || "").toLowerCase();
  const name = (el.getAttribute("name") || "").toLowerCase();
  const text = (el.textContent || "").toLowerCase().trim();
  for (const hint of SUBMIT_HINTS) {
    if (id.includes(hint) || name.includes(hint) || text.includes(hint)) {
      if (el.tagName === "BUTTON" || el.tagName === "INPUT") return true;
    }
  }
  return false;
}

/** CLICK_SAFE only on non-submit controls; submit-like → reject. */
export function assertClickSafeTarget(el: HTMLElement): void {
  if (isSubmitLikeControl(el)) {
    throw new Error("CLICK_SAFE blocked on submit-like control (R3)");
  }
}
