/**
 * Classificação de erros de aba — SW, popup e testes Node.
 */
(function (global) {
  "use strict";

  function classifyTabError(tab, err) {
    if (!tab?.url) return "RESTRICTED_NO_URL";
    if (/^chrome:\/\//.test(tab.url)) return "CHROME_INTERNAL";
    if (/^chrome-extension:\/\//.test(tab.url)) return "EXTENSION_PAGE";
    if (/^edge:\/\//.test(tab.url)) return "CHROME_INTERNAL";
    if (/Cannot access contents/i.test(String(err?.message || err))) {
      return "INJECTION_DENIED";
    }
    return "UNKNOWN";
  }

  const MESSAGES = {
    RESTRICTED_NO_URL: {
      message: "Esta aba ainda não tem URL — abra o laboratório e tente de novo.",
      hint: "Ver docs/restricted-pages.md",
    },
    CHROME_INTERNAL: {
      message: "Páginas internas do Chrome (chrome://) não permitem injeção.",
      hint: "Abra http://127.0.0.1:5173 e use Listar campos de novo.",
    },
    EXTENSION_PAGE: {
      message: "Não é possível analisar páginas da própria extensão.",
      hint: "Ver docs/restricted-pages.md",
    },
    INJECTION_DENIED: {
      message: "O Chrome negou acesso ao conteúdo desta página.",
      hint: "Ver docs/restricted-pages.md",
    },
    UNKNOWN: {
      message: "Não foi possível executar o agente nesta aba.",
      hint: "Recarregue a página do lab e tente novamente.",
    },
  };

  function formatTabError(code) {
    const entry = MESSAGES[code] || MESSAGES.UNKNOWN;
    return `${entry.message} (${code}) — ${entry.hint}`;
  }

  global.__FORM_AGENT_LIB__ = global.__FORM_AGENT_LIB__ || {};
  global.__FORM_AGENT_LIB__.tabErrors = {
    classifyTabError,
    formatTabError,
    MESSAGES,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { classifyTabError, formatTabError, MESSAGES };
  }
})(typeof globalThis !== "undefined" ? globalThis : global);
