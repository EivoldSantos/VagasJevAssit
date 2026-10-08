(function (global) {
  "use strict";

  const SUBMIT_HINTS = [
    "submit",
    "enviar",
    "send",
    "candidatura",
    "aplicar",
    "apply",
  ];

  function isSubmitControl(element) {
    if (!element || typeof element !== "object" || !element.tagName) return false;
    if (element.tagName === "BUTTON") {
      const type = (element.getAttribute("type") || "").toLowerCase();
      if (type === "submit") return true;
    }
    if (
      element.tagName === "INPUT" &&
      String(element.type || "").toLowerCase() === "submit"
    ) {
      return true;
    }
    const id = (element.id || "").toLowerCase();
    const name = (element.getAttribute("name") || "").toLowerCase();
    const text = (element.textContent || "").toLowerCase().trim();
    for (const hint of SUBMIT_HINTS) {
      if (id.includes(hint) || name.includes(hint) || text.includes(hint)) {
        if (element.tagName === "BUTTON" || element.tagName === "INPUT") {
          return true;
        }
      }
    }
    return false;
  }

  global.__FORM_AGENT_LIB__ = global.__FORM_AGENT_LIB__ || {};
  global.__FORM_AGENT_LIB__.submitGuard = { isSubmitControl };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { isSubmitControl };
  }
})(typeof globalThis !== "undefined" ? globalThis : global);
