/**
 * Form agent — IIFE exposta em window.__FORM_AGENT__
 */
(function () {
  "use strict";

  const lib = globalThis.__FORM_AGENT_LIB__ || {};
  const { isSubmitControl } = lib.submitGuard || { isSubmitControl: () => false };
  const { expectedForField } = lib.fictitious || {
    expectedForField: () => "Texto fictício",
  };

  function isVisible(el) {
    if (!(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (el.offsetParent === null && style.position !== "fixed") return false;
    return true;
  }

  function resolveLabel(el) {
    if (el.labels?.length) return el.labels[0].innerText.trim();
    const id = el.id;
    if (id) {
      const lbl = el.ownerDocument.querySelector(
        `label[for="${CSS.escape(id)}"]`,
      );
      if (lbl) return lbl.innerText.trim();
    }
    return (
      el.getAttribute("aria-label") ||
      el.getAttribute("placeholder") ||
      el.getAttribute("name") ||
      el.id ||
      ""
    );
  }

  function controlType(el) {
    if (el instanceof HTMLSelectElement) return "select";
    if (el instanceof HTMLTextAreaElement) return "textarea";
    if (el instanceof HTMLInputElement) {
      const t = (el.type || "text").toLowerCase();
      if (t === "checkbox") return "checkbox";
      if (t === "radio") return "radio";
      return t;
    }
    return "unknown";
  }

  function collectFieldElements(root) {
    const nodes = root.querySelectorAll("input, textarea, select, button");
    const out = [];
    nodes.forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      if (isSubmitControl(el)) return;
      if (el.tagName === "BUTTON") return;
      if (el instanceof HTMLInputElement && el.type === "hidden") return;
      out.push(el);
    });
    return out;
  }

  function readCurrentValue(el, type) {
    if (el instanceof HTMLInputElement) {
      if (type === "checkbox" || type === "radio") {
        return el.checked ? "checked" : "";
      }
      return el.value;
    }
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      return el.value;
    }
    return "";
  }

  function listFields() {
    const root = document.querySelector("#lab-application-form") ?? document;
    const elements = collectFieldElements(root);
    const fields = elements.map((el, index) => {
      const type = controlType(el);
      return {
        index,
        label: resolveLabel(el),
        tagName: el.tagName.toLowerCase(),
        inputType: type,
        name: el.getAttribute("name") || "",
        id: el.id || "",
        currentValue: readCurrentValue(el, type),
        visible: isVisible(el),
      };
    });
    return { mode: "LIST", count: fields.length, fields };
  }

  function verifyField(el, expected, type) {
    if (type === "checkbox") {
      const want =
        typeof expected === "object" && expected !== null
          ? expected.checked
          : Boolean(expected);
      return el instanceof HTMLInputElement && el.checked === want;
    }
    if (type === "radio") {
      return (
        el instanceof HTMLInputElement &&
        el.checked &&
        el.value === String(expected)
      );
    }
    if (type === "select") {
      return el instanceof HTMLSelectElement && el.value === String(expected);
    }
    return String(el.value) === String(expected);
  }

  function fillFields() {
    const root = document.querySelector("#lab-application-form") ?? document;
    const elements = collectFieldElements(root).filter(isVisible);
    const results = [];
    const filledRadioGroups = new Set();

    for (const el of elements) {
      const label = resolveLabel(el);
      const type = controlType(el);
      if (type === "radio") {
        const g = el.getAttribute("name") || el.id;
        if (filledRadioGroups.has(g)) continue;
        filledRadioGroups.add(g);
      }
      const expected = expectedForField(el, label);
      let skipped = false;

      try {
        if (type === "checkbox") {
          const checked =
            typeof expected === "object" && expected !== null
              ? expected.checked
              : Boolean(expected);
          lib.fillCheckbox?.(el, checked);
        } else if (type === "radio") {
          const name = el.getAttribute("name");
          if (name) lib.fillRadioGroup?.(name, String(expected), root);
        } else if (type === "select") {
          lib.fillSelect?.(el, String(expected));
        } else if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement
        ) {
          lib.fillTextInput?.(el, String(expected));
        } else {
          skipped = true;
        }
      } catch {
        skipped = true;
      }

      const verified = skipped ? false : verifyField(el, expected, type);
      results.push({
        label,
        tagName: el.tagName.toLowerCase(),
        inputType: type,
        name: el.getAttribute("name") || "",
        id: el.id || "",
        expected,
        currentValue: readCurrentValue(el, type),
        verified,
      });
    }

    return { mode: "FILL", count: results.length, fields: results };
  }

  function run(command) {
    if (command === "LIST") return listFields();
    if (command === "FILL") return fillFields();
    throw new Error(`Modo não implementado: ${command}`);
  }

  window.__FORM_AGENT__ = { run };
})();
