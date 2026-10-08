import { assertClickSafeTarget } from "@/lib/form-engine/action-space";
import type { FillAction, FillResult, FormField } from "@/lib/form-engine/types";
import {
  buildFillResult,
  finalizeTextFillResult,
} from "@/lib/form-engine/validator";
import { fillTextInput } from "./fill-text";
import {
  fillCheckbox,
  fillRadioGroup,
  fillSelect,
  verifyChoice,
} from "./fill-choice";

export type ExecuteContext = {
  resolveElement: (domIndex: number) => HTMLElement | null;
  getField?: (fieldId: string) => FormField | undefined;
  root?: ParentNode;
};

function elementUsable(el: HTMLElement | null): el is HTMLElement {
  if (!el?.isConnected) return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    if (el.disabled) return false;
  }
  return true;
}

function skippedSensitive(
  action: FillAction,
  field: FormField | undefined,
): FillResult | null {
  if (!field?.sensitive) return null;
  return buildFillResult({
    actionId: action.actionId,
    fieldId: action.fieldId,
    status: "SKIPPED",
    verified: true,
    reason: "Campo sensível — executor não preenche",
  });
}

export function executeAction(
  action: FillAction,
  ctx: ExecuteContext,
): FillResult {
  if (action.operation === "SKIP" || action.operation === "REQUEST_USER_INPUT") {
    return buildFillResult({
      actionId: action.actionId,
      fieldId: action.fieldId,
      status: "SKIPPED",
      verified: true,
      reason: action.expectedOutcome,
    });
  }

  const field = ctx.getField?.(action.fieldId);
  const sensitiveSkip = skippedSensitive(action, field);
  if (sensitiveSkip) return sensitiveSkip;

  const el = ctx.resolveElement(action.domIndex);
  if (!elementUsable(el)) {
    return buildFillResult({
      actionId: action.actionId,
      fieldId: action.fieldId,
      status: "STALE",
      verified: false,
      reason: "Elemento ausente, oculto ou desabilitado",
    });
  }

  if (field?.sensitive) {
    return buildFillResult({
      actionId: action.actionId,
      fieldId: action.fieldId,
      status: "SKIPPED",
      verified: true,
      reason: "Campo sensível",
    });
  }

  const root = ctx.root ?? document.body;

  try {
    switch (action.operation) {
      case "FILL_TEXT": {
        if (
          !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) ||
          !action.value
        ) {
          return buildFillResult({
            actionId: action.actionId,
            fieldId: action.fieldId,
            status: "UNSUPPORTED",
            verified: false,
            reason: "FILL_TEXT requer input ou textarea",
          });
        }
        const previousValue = el.value;
        fillTextInput(el, action.value);
        return finalizeTextFillResult(
          action.actionId,
          action.fieldId,
          el,
          action.value,
          previousValue,
        );
      }
      case "SELECT_OPTION": {
        if (!(el instanceof HTMLSelectElement) || !action.value) {
          if (el instanceof HTMLInputElement && el.type === "radio" && el.name) {
            fillRadioGroup(el.name, action.value ?? "", root);
            const verified = el.checked && el.value === action.value;
            return buildFillResult({
              actionId: action.actionId,
              fieldId: action.fieldId,
              status: verified ? "FILLED" : "FAILED",
              verified,
              observedValue: el.value,
            });
          }
          return buildFillResult({
            actionId: action.actionId,
            fieldId: action.fieldId,
            status: "UNSUPPORTED",
            verified: false,
          });
        }
        fillSelect(el, action.value);
        const verified = verifyChoice(el, {
          kind: "select",
          value: action.value,
        });
        return buildFillResult({
          actionId: action.actionId,
          fieldId: action.fieldId,
          status: verified ? "FILLED" : "FAILED",
          verified,
          observedValue: el.value,
        });
      }
      case "CHECK":
      case "UNCHECK": {
        if (!(el instanceof HTMLInputElement) || el.type !== "checkbox") {
          return buildFillResult({
            actionId: action.actionId,
            fieldId: action.fieldId,
            status: "UNSUPPORTED",
            verified: false,
          });
        }
        const want = action.operation === "CHECK";
        fillCheckbox(el, want);
        const verified = verifyChoice(el, { kind: "checkbox", checked: want });
        return buildFillResult({
          actionId: action.actionId,
          fieldId: action.fieldId,
          status: verified ? "FILLED" : "FAILED",
          verified,
        });
      }
      case "CLICK_SAFE": {
        assertClickSafeTarget(el);
        el.click();
        return buildFillResult({
          actionId: action.actionId,
          fieldId: action.fieldId,
          status: "FILLED",
          verified: true,
        });
      }
      default:
        return buildFillResult({
          actionId: action.actionId,
          fieldId: action.fieldId,
          status: "UNSUPPORTED",
          verified: false,
          reason: `Operação ${action.operation} não implementada`,
        });
    }
  } catch (err) {
    return buildFillResult({
      actionId: action.actionId,
      fieldId: action.fieldId,
      status: "FAILED",
      verified: false,
      reason: err instanceof Error ? err.message : String(err),
    });
  }
}
