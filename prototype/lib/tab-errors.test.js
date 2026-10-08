import { test } from "node:test";
import assert from "node:assert/strict";
import "./tab-errors.js";

const { classifyTabError, formatTabError } =
  globalThis.__FORM_AGENT_LIB__.tabErrors;

test("classifyTabError detecta chrome://", () => {
  assert.equal(
    classifyTabError({ url: "chrome://extensions" }, null),
    "CHROME_INTERNAL",
  );
});

test("classifyTabError detecta injeção negada", () => {
  assert.equal(
    classifyTabError({ url: "https://example.com" }, {
      message: "Cannot access contents of the page",
    }),
    "INJECTION_DENIED",
  );
});

test("formatTabError inclui código", () => {
  const text = formatTabError("CHROME_INTERNAL");
  assert.match(text, /CHROME_INTERNAL/);
});
