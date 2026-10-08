(function (global) {
  "use strict";

  function fillSelect(select, value) {
    select.value = value;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function fillRadioGroup(name, value, root) {
    const inputs = root.querySelectorAll(
      `input[type="radio"][name="${CSS.escape(name)}"]`,
    );
    for (const input of inputs) {
      if (!(input instanceof HTMLInputElement)) continue;
      if (input.value === value) {
        input.click();
        return;
      }
    }
  }

  function fillCheckbox(input, checked) {
    if (input.checked !== checked) {
      input.click();
    }
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function verifyChoice(el, expected) {
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox" || el.type === "radio") {
        return el.checked === expected.checked;
      }
    }
    if (el instanceof HTMLSelectElement) {
      return el.value === expected.value;
    }
    return false;
  }

  const api = { fillSelect, fillRadioGroup, fillCheckbox, verifyChoice };

  global.__FORM_AGENT_LIB__ = global.__FORM_AGENT_LIB__ || {};
  Object.assign(global.__FORM_AGENT_LIB__, api);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : global);
