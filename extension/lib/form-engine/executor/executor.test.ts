/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import type { FillAction, FormField } from "@/lib/form-engine/types";
import { executeAction } from "./index";
import * as fillText from "./fill-text";

function action(partial: Partial<FillAction> & Pick<FillAction, "operation">): FillAction {
  return {
    actionId: "a1",
    fieldId: "f1",
    snapshotId: "s1",
    domIndex: 0,
    source: "deterministic",
    confidence: 1,
    requiresReview: false,
    expectedOutcome: "test",
    ...partial,
  };
}

describe("executeAction", () => {
  it("ignora action em field sensitive", () => {
    const field: FormField = {
      fieldId: "f1",
      snapshotId: "s1",
      tagName: "input",
      inputType: "password",
      required: false,
      visible: true,
      disabled: false,
      supportedOperations: ["SKIP"],
      sensitive: true,
      domIndex: 0,
    };
    const input = document.createElement("input");
    input.type = "password";
    const result = executeAction(
      action({ operation: "FILL_TEXT", value: "secret" }),
      {
        resolveElement: () => input,
        getField: () => field,
      },
    );
    expect(result.status).toBe("SKIPPED");
    expect(input.value).toBe("");
  });

  it("verifyTextValue false → FAILED verified false", () => {
    vi.spyOn(fillText, "verifyTextValue").mockReturnValue(false);
    const input = document.createElement("input");
    input.value = "old";
    document.body.appendChild(input);
    const result = executeAction(
      action({ operation: "FILL_TEXT", value: "new" }),
      { resolveElement: () => input },
    );
    expect(result.status).toBe("FAILED");
    expect(result.verified).toBe(false);
    input.remove();
    vi.restoreAllMocks();
  });

  it("CHECK em checkbox", () => {
    const input = document.createElement("input");
    input.type = "checkbox";
    document.body.appendChild(input);
    const result = executeAction(action({ operation: "CHECK" }), {
      resolveElement: () => input,
    });
    expect(result.status).toBe("FILLED");
    expect(input.checked).toBe(true);
    input.remove();
  });

  it("SELECT_OPTION em select", () => {
    const select = document.createElement("select");
    const o1 = document.createElement("option");
    o1.value = "br";
    const o2 = document.createElement("option");
    o2.value = "us";
    select.append(o1, o2);
    document.body.appendChild(select);
    const result = executeAction(
      action({ operation: "SELECT_OPTION", value: "br" }),
      { resolveElement: () => select },
    );
    expect(result.status).toBe("FILLED");
    expect(select.value).toBe("br");
    select.remove();
  });
});
