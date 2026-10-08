import { extractFieldsFromDocument } from "@/lib/dom/extract-fields";

export default defineContentScript({
  matches: [
    "http://127.0.0.1:5173/*",
    "http://localhost:5173/*",
  ],
  runAt: "document_idle",
  main() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type !== "RUN_EXTRACT") {
        return false;
      }
      try {
        sendResponse({ ok: true, data: extractFieldsFromDocument() });
      } catch (err) {
        sendResponse({
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
      return true;
    });
  },
});
