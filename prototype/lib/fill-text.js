/**
 * Preenchimento texto — page world (injetado) + testável em Node.
 */
(function (global) {
  "use strict";

  function setNativeValue(element, value) {
    const { set: valueSetter } =
      Object.getOwnPropertyDescriptor(element, "value") || {};
    const prototype = Object.getPrototypeOf(element);
    const { set: prototypeValueSetter } =
      Object.getOwnPropertyDescriptor(prototype, "value") || {};
    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      throw new Error("No value setter");
    }
  }

  function fillTextInput(input, value) {
    setNativeValue(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function verifyTextValue(el, expectedValue) {
    return String(el.value) === String(expectedValue);
  }

  const api = { setNativeValue, fillTextInput, verifyTextValue };

  global.__FORM_AGENT_LIB__ = global.__FORM_AGENT_LIB__ || {};
  Object.assign(global.__FORM_AGENT_LIB__, api);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : global);
