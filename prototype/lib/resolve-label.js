(function (global) {
  "use strict";

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

  global.__FORM_AGENT_LIB__ = global.__FORM_AGENT_LIB__ || {};
  global.__FORM_AGENT_LIB__.resolveLabel = resolveLabel;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { resolveLabel };
  }
})(typeof globalThis !== "undefined" ? globalThis : global);
