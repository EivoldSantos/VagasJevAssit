import { test } from "node:test";
import assert from "node:assert/strict";
import "./fill-text.js";

const { setNativeValue, fillTextInput } = globalThis.__FORM_AGENT_LIB__;

test("setNativeValue atualiza value lido", () => {
  const proto = {};
  let stored = "";
  Object.defineProperty(proto, "value", {
    get() {
      return stored;
    },
    set(v) {
      stored = v;
    },
    configurable: true,
  });
  const el = Object.create(proto);
  el.dispatchEvent = () => {};

  setNativeValue(el, "hello");
  assert.equal(el.value, "hello");

  fillTextInput(el, "world");
  assert.equal(el.value, "world");
});
