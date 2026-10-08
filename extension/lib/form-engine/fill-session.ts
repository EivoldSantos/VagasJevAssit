import { collectFieldElements } from "@/lib/dom/extract-fields";
import { extractFormSnapshot } from "@/lib/form-engine/extractor";
import { executeAction } from "@/lib/form-engine/executor/index";
import { FillSessionObserver } from "@/lib/form-engine/observer";
import type { FillAction, FillResult, FormField } from "@/lib/form-engine/types";
import { buildFillResult } from "@/lib/form-engine/validator";
import {
  installSubmitGuard,
  removeSubmitGuard,
} from "@/lib/form-engine/submit-guard";

export type FillSessionInput = {
  snapshotId: string;
  actions: FillAction[];
  /** Optional field map from planning snapshot. */
  fields?: FormField[];
};

export type FillSessionOutput = {
  snapshotId: string;
  results: FillResult[];
};

function resolveElementByDomIndex(domIndex: number): HTMLElement | null {
  const root =
    document.querySelector("#lab-application-form") ?? document.body;
  const elements = collectFieldElements(root);
  const el = elements[domIndex];
  if (!el?.isConnected) return null;
  return el;
}

function bindObserverFields(
  observer: FillSessionObserver,
  fields: FormField[],
  resolveElement: (domIndex: number) => HTMLElement | null,
): void {
  for (const field of fields) {
    const el = resolveElement(field.domIndex);
    if (el) observer.bindField(field.fieldId, el);
  }
}

function isFillOperation(action: FillAction): boolean {
  return (
    action.operation !== "SKIP" &&
    action.operation !== "REQUEST_USER_INPUT"
  );
}

export function executeFillSession(input: FillSessionInput): FillSessionOutput {
  installSubmitGuard();
  const sessionObserver = new FillSessionObserver();
  try {
    const fresh = extractFormSnapshot();
    const fieldById = new Map(
      (input.fields ?? []).map((f) => [f.fieldId, f] as const),
    );
    const root =
      document.querySelector("#lab-application-form") ?? document.body;

    sessionObserver.start(root);
    bindObserverFields(
      sessionObserver,
      input.fields ?? [],
      resolveElementByDomIndex,
    );

    const results: FillResult[] = [];
    for (const action of input.actions) {
      const field = fieldById.get(action.fieldId);
      if (
        field &&
        field.snapshotId !== input.snapshotId &&
        field.snapshotId !== fresh.snapshotId
      ) {
        results.push(
          buildFillResult({
            actionId: action.actionId,
            fieldId: action.fieldId,
            status: "STALE",
            verified: false,
            reason: "Snapshot desatualizado — reanalise o formulário",
          }),
        );
        continue;
      }

      if (
        isFillOperation(action) &&
        sessionObserver.wasFilledInSession(action.fieldId)
      ) {
        results.push(
          buildFillResult({
            actionId: action.actionId,
            fieldId: action.fieldId,
            status: "SKIPPED",
            verified: true,
            reason: "Campo já preenchido nesta sessão",
          }),
        );
        continue;
      }

      if (sessionObserver.isFieldStale(action.fieldId)) {
        results.push(
          buildFillResult({
            actionId: action.actionId,
            fieldId: action.fieldId,
            status: "STALE",
            verified: false,
            reason: "Referência de campo inválida ou nó desconectado",
          }),
        );
        continue;
      }

      const result = executeAction(action, {
        resolveElement: resolveElementByDomIndex,
        getField: (id) => fieldById.get(id),
        root,
      });

      if (result.status === "FILLED" && isFillOperation(action)) {
        sessionObserver.markFilled(action.fieldId);
      }

      results.push(result);
    }

    return {
      snapshotId: fresh.snapshotId,
      results,
    };
  } finally {
    sessionObserver.stop();
    removeSubmitGuard();
    (
      window as unknown as { __LAB_SUBMIT_FIRED__?: boolean }
    ).__LAB_SUBMIT_FIRED__ = false;
  }
}
