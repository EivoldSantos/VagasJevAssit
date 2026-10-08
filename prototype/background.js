/** @file Service worker — injeção sob demanda (Phase 1). */

importScripts("lib/tab-errors.js");

const ALLOWED_COMMANDS = new Set(["LIST", "FILL"]);

function classifyTabError(tab, err) {
  return (
    globalThis.__FORM_AGENT_LIB__?.tabErrors?.classifyTabError(tab, err) ??
    "UNKNOWN"
  );
}

function formatTabError(code) {
  return (
    globalThis.__FORM_AGENT_LIB__?.tabErrors?.formatTabError(code) ??
    `Erro de aba (${code}) — ver docs/restricted-pages.md`
  );
}

const INJECT_FILES = [
  "lib/fill-text.js",
  "lib/fill-choice.js",
  "lib/fictitious-data.js",
  "lib/submit-guard.js",
  "scripts/form-agent.js",
];

async function injectAgent(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: INJECT_FILES,
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "RUN_FORM_AGENT") {
    return false;
  }

  const command = message.command ?? message.mode ?? "LIST";
  if (!ALLOWED_COMMANDS.has(command)) {
    sendResponse({ ok: false, error: "Comando não permitido." });
    return false;
  }

  (async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        sendResponse({ ok: false, error: "Nenhuma aba ativa." });
        return;
      }

      const preCode = classifyTabError(tab, null);
      if (preCode !== "UNKNOWN" && preCode !== "INJECTION_DENIED") {
        sendResponse({ ok: false, error: formatTabError(preCode), code: preCode });
        return;
      }

      if (!tab.url) {
        sendResponse({
          ok: false,
          error: formatTabError("RESTRICTED_NO_URL"),
          code: "RESTRICTED_NO_URL",
        });
        return;
      }

      const tabId = tab.id;

      await injectAgent(tabId);

      const [{ result: agentResult }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: (cmd) => window.__FORM_AGENT__.run(cmd),
        args: [command],
      });

      if (command === "LIST") {
        try {
          await chrome.storage.local.set({
            lastListResult: agentResult,
            lastListAt: Date.now(),
          });
        } catch {
          /* storage opcional */
        }
      }

      sendResponse({ ok: true, data: agentResult });
    } catch (err) {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const code = classifyTabError(tab, err);
      sendResponse({
        ok: false,
        error: formatTabError(code),
        code,
      });
    }
  })();

  return true;
});
