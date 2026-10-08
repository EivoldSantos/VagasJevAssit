(function (global) {
  "use strict";

  const FIXTURES = {
    full_name: "Alex Silva Fictício",
    email: "alex.ficticio@example.test",
    phone: "+55 11 90000-0000",
    bio: "Texto fictício para testes do laboratório.",
    country: "BR",
    work_mode: "remote",
    terms: { checked: true },
    controlled_note: "Valor React fictício",
    conditional_city: "Cidade Lab",
  };

  function normalizeLabel(label) {
    return (label || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function expectedForField(el, label) {
    const name = el.getAttribute("name") || "";
    const id = el.id || "";
    if (name && FIXTURES[name] !== undefined) return FIXTURES[name];
    if (id && FIXTURES[id] !== undefined) return FIXTURES[id];

    const l = normalizeLabel(label);
    if (l.includes("nome")) return FIXTURES.full_name;
    if (l.includes("e-mail") || l.includes("email")) return FIXTURES.email;
    if (l.includes("telefone")) return FIXTURES.phone;
    if (l.includes("sobre")) return FIXTURES.bio;
    if (l.includes("país") || l.includes("pais")) return FIXTURES.country;
    if (l.includes("cidade")) return FIXTURES.conditional_city;
    if (l.includes("react controlado") || l.includes("nota controlada"))
      return FIXTURES.controlled_note;
    if (name.startsWith("dynamic_")) return `Dinâmico ${name}`;

    return "Texto fictício";
  }

  global.__FORM_AGENT_LIB__ = global.__FORM_AGENT_LIB__ || {};
  global.__FORM_AGENT_LIB__.fictitious = { FIXTURES, expectedForField };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { FIXTURES, expectedForField };
  }
})(typeof globalThis !== "undefined" ? globalThis : global);
