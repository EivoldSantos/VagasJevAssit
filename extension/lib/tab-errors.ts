export type TabErrorCode =
  | "RESTRICTED_NO_URL"
  | "CHROME_INTERNAL"
  | "EXTENSION_PAGE"
  | "INJECTION_DENIED"
  | "UNKNOWN";

export function getTabUrl(tab: chrome.tabs.Tab | undefined): string {
  return (tab?.url || tab?.pendingUrl || "").trim();
}

export function classifyTabError(
  tab: chrome.tabs.Tab | undefined,
  err: unknown,
): TabErrorCode {
  const url = getTabUrl(tab);
  if (!url) {
    if (!tab?.id) return "RESTRICTED_NO_URL";
    const msg = err instanceof Error ? err.message : String(err ?? "");
    if (/Cannot access contents/i.test(msg)) return "INJECTION_DENIED";
    return "UNKNOWN";
  }
  if (/^chrome:\/\//.test(url) || /^edge:\/\//.test(url)) {
    return "CHROME_INTERNAL";
  }
  if (/^chrome-extension:\/\//.test(url)) return "EXTENSION_PAGE";
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/Cannot access contents/i.test(msg)) return "INJECTION_DENIED";
  return "UNKNOWN";
}

const MESSAGES: Record<
  TabErrorCode,
  { message: string; hint: string }
> = {
  RESTRICTED_NO_URL: {
    message: "Esta aba ainda não tem URL — recarregue a página.",
    hint: "Abra http://127.0.0.1:5173",
  },
  CHROME_INTERNAL: {
    message: "Páginas internas do Chrome não permitem análise.",
    hint: "Use a aba do laboratório local.",
  },
  EXTENSION_PAGE: {
    message: "Não é possível analisar páginas da extensão.",
    hint: "Abra o formulário de teste no lab.",
  },
  INJECTION_DENIED: {
    message: "O Chrome negou acesso ao conteúdo desta página.",
    hint: "Recarregue a aba e tente de novo.",
  },
  UNKNOWN: {
    message: "Não foi possível analisar esta aba.",
    hint: "Tente outra aba ou recarregue.",
  },
};

export function formatTabError(code: TabErrorCode): string {
  const e = MESSAGES[code] ?? MESSAGES.UNKNOWN;
  return `${e.message} (${code}) — ${e.hint}`;
}

/** Bloqueia antes de injetar — só quando a URL prova restrição. */
export function shouldBlockBeforeInject(
  tab: chrome.tabs.Tab | undefined,
): TabErrorCode | null {
  const url = getTabUrl(tab);
  if (!url) return null;
  const code = classifyTabError(tab, null);
  if (code === "CHROME_INTERNAL" || code === "EXTENSION_PAGE") return code;
  return null;
}
