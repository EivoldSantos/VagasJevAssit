import { describe, expect, it } from "vitest";
import { classifyTabError, formatTabError } from "./tab-errors";

describe("classifyTabError", () => {
  it("detecta chrome://", () => {
    expect(
      classifyTabError({ url: "chrome://extensions" } as chrome.tabs.Tab, null),
    ).toBe("CHROME_INTERNAL");
  });

  it("detecta injeção negada", () => {
    expect(
      classifyTabError(
        { url: "https://example.com" } as chrome.tabs.Tab,
        new Error("Cannot access contents of the page"),
      ),
    ).toBe("INJECTION_DENIED");
  });
});

describe("formatTabError", () => {
  it("inclui código", () => {
    expect(formatTabError("CHROME_INTERNAL")).toMatch(/CHROME_INTERNAL/);
  });
});

describe("shouldBlockBeforeInject", () => {
  it("não bloqueia quando url ausente mas tab.id existe", async () => {
    const { shouldBlockBeforeInject } = await import("./tab-errors");
    expect(
      shouldBlockBeforeInject({ id: 1 } as chrome.tabs.Tab),
    ).toBeNull();
  });
});
