import { extractFieldsFromDocument } from "@/lib/dom/extract-fields";
import { executeFillSession } from "@/lib/form-engine/fill-session";
import { FillSessionInputSchema } from "@/lib/inject/fill-on-tab";

export default defineContentScript({
  matches: [
    "http://127.0.0.1:5173/*",
    "http://localhost:5173/*",
  ],
  runAt: "document_idle",
  main() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === "RUN_EXTRACT") {
        try {
          sendResponse({ ok: true, data: extractFieldsFromDocument() });
        } catch (err) {
          sendResponse({
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
        return true;
      }

      if (message?.type === "RUN_FILL") {
        const parsed = FillSessionInputSchema.safeParse(message.data);
        if (!parsed.success) {
          sendResponse({
            ok: false,
            error: "Payload de autopreenchimento inválido.",
          });
          return true;
        }
        try {
          const out = executeFillSession(parsed.data);
          sendResponse({ ok: true, data: out });
        } catch (err) {
          sendResponse({
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
        return true;
      }

      return false;
    });
  },
});
