import { test } from "node:test";
import assert from "node:assert/strict";
import "./resolve-label.js";

const { resolveLabel } = globalThis.__FORM_AGENT_LIB__;

test("resolveLabel usa aria-label", () => {
  const el = {
    id: "",
    labels: [],
    ownerDocument: { querySelector: () => null },
    getAttribute(name) {
      if (name === "aria-label") return "E-mail profissional";
      return null;
    },
  };
  assert.equal(resolveLabel(el), "E-mail profissional");
});

test("resolveLabel usa placeholder", () => {
  const el = {
    id: "",
    labels: [],
    ownerDocument: { querySelector: () => null },
    getAttribute(name) {
      if (name === "placeholder") return "Digite aqui";
      return null;
    },
  };
  assert.equal(resolveLabel(el), "Digite aqui");
});
