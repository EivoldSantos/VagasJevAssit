/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { FillSessionObserver } from "./observer";
import { executeFillSession } from "./fill-session";
import type { FillAction, FormField } from "./types";

describe("FillSessionObserver", () => {
  it("marca fieldId stale quando elemento é removido", () => {
    const form = document.createElement("form");
    document.body.appendChild(form);
    const input = document.createElement("input");
    form.appendChild(input);

    const obs = new FillSessionObserver();
    obs.start(form, { debounceMs: 10 });
    obs.bindField("f1", input);

    form.removeChild(input);
    expect(obs.isFieldStale("f1")).toBe(true);
    obs.stop();
    form.remove();
  });

  it("debounce agrupa mutações rápidas em um flush", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);
    let flushes = 0;
    const obs = new FillSessionObserver();
    obs.start(form, {
      debounceMs: 40,
      onFlush: () => {
        flushes += 1;
      },
    });

    for (let i = 0; i < 8; i++) {
      form.appendChild(document.createElement("span"));
    }

    await new Promise((r) => setTimeout(r, 10));
    expect(flushes).toBe(0);

    await new Promise((r) => setTimeout(r, 50));
    expect(flushes).toBe(1);
    expect(obs.flushCount).toBe(1);

    obs.stop();
    form.remove();
  });
});

describe("executeFillSession observer integration", () => {
  const baseField = (partial: Partial<FormField>): FormField => ({
    fieldId: "f1",
    snapshotId: "snap-1",
    tagName: "input",
    inputType: "text",
    required: false,
    visible: true,
    disabled: false,
    supportedOperations: ["FILL_TEXT"],
    sensitive: false,
    domIndex: 0,
    ...partial,
  });

  it("disconnect antes do execute → STALE, não FILLED", () => {
    const form = document.createElement("form");
    form.id = "lab-application-form";
    document.body.appendChild(form);
    const input = document.createElement("input");
    input.name = "full_name";
    form.appendChild(input);

    const fields = [baseField({ fieldId: "f1", domIndex: 0 })];
    const actions: FillAction[] = [
      {
        actionId: "a1",
        fieldId: "f1",
        snapshotId: "snap-1",
        domIndex: 0,
        operation: "FILL_TEXT",
        value: "Ana",
        source: "deterministic",
        confidence: 1,
        requiresReview: false,
        expectedOutcome: "fill",
      },
    ];

    input.remove();
    const out = executeFillSession({
      snapshotId: "snap-1",
      actions,
      fields,
    });
    expect(out.results[0]?.status).toBe("STALE");
    expect(out.results[0]?.verified).toBe(false);

    form.remove();
  });

  it("filledFieldIds impede segundo FILL no mesmo fieldId na sessão", () => {
    const form = document.createElement("form");
    form.id = "lab-application-form";
    document.body.appendChild(form);
    const input = document.createElement("input");
    input.name = "full_name";
    form.appendChild(input);

    const fields = [baseField({ fieldId: "f1", domIndex: 0 })];
    const mkAction = (actionId: string): FillAction => ({
      actionId,
      fieldId: "f1",
      snapshotId: "snap-1",
      domIndex: 0,
      operation: "FILL_TEXT",
      value: "Ana",
      source: "deterministic",
      confidence: 1,
      requiresReview: false,
      expectedOutcome: "fill",
    });

    const out = executeFillSession({
      snapshotId: "snap-1",
      actions: [mkAction("a1"), mkAction("a2")],
      fields,
    });
    expect(out.results[0]?.status).toBe("FILLED");
    expect(out.results[1]?.status).toBe("SKIPPED");
    expect(out.results[1]?.reason).toMatch(/sessão/i);

    form.remove();
  });
});
