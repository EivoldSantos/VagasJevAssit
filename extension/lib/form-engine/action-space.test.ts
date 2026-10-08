/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import {
  assertClickSafeTarget,
  compileFillOperation,
  isKnownFillOperation,
} from "./action-space";

describe("action-space", () => {
  it("compileFillOperation rejeita SUBMIT", () => {
    expect(() => compileFillOperation("SUBMIT")).toThrow(/SUBMIT/);
  });

  it("CLICK_SAFE permitido como operação", () => {
    expect(compileFillOperation("CLICK_SAFE")).toBe("CLICK_SAFE");
  });

  it("operação desconhecida rejeitada", () => {
    expect(() => compileFillOperation("TELEPORT")).toThrow(/Unknown/);
    expect(isKnownFillOperation("TELEPORT")).toBe(false);
  });

  it("CLICK_SAFE em controle submit-like rejeitado (R3)", () => {
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = "Enviar candidatura";
    expect(() => assertClickSafeTarget(btn)).toThrow(/submit-like/);
  });
});
