import { test } from "node:test";
import assert from "node:assert/strict";
import "./submit-guard.js";

const { isSubmitControl } = globalThis.__FORM_AGENT_LIB__.submitGuard;

test("isSubmitControl detecta button submit", () => {
  const btn = {
    tagName: "BUTTON",
    getAttribute(type) {
      return type === "type" ? "submit" : null;
    },
    id: "submit_application",
    textContent: "Enviar candidatura",
  };
  assert.equal(isSubmitControl(btn), true);
});

test("isSubmitControl ignora input text", () => {
  const input = {
    tagName: "INPUT",
    type: "text",
    id: "email",
    getAttribute() {
      return null;
    },
    textContent: "",
  };
  assert.equal(isSubmitControl(input), false);
});
