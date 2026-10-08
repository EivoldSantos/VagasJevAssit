import { describe, expect, it } from "vitest";
import { classifyControl } from "./classifier";

describe("classifyControl", () => {
  it("input type password → sensitive, sem FILL_TEXT", () => {
    const c = classifyControl({
      tagName: "input",
      inputType: "password",
      visible: true,
      disabled: false,
    });
    expect(c.sensitive).toBe(true);
    expect(c.supportedOperations).not.toContain("FILL_TEXT");
    expect(c.supportedOperations).toContain("SKIP");
  });

  it("autocomplete one-time-code → sensitive", () => {
    const c = classifyControl({
      tagName: "input",
      inputType: "text",
      autocomplete: "one-time-code",
      visible: true,
    });
    expect(c.sensitive).toBe(true);
  });

  it("text visível → FILL_TEXT permitido", () => {
    const c = classifyControl({
      tagName: "input",
      inputType: "text",
      visible: true,
      disabled: false,
    });
    expect(c.sensitive).toBe(false);
    expect(c.supportedOperations).toContain("FILL_TEXT");
  });
});
