import {
  SidePanelMessageSchema,
  ExtractCompleteMessageSchema,
} from "@/lib/messaging/schemas";
import { handleExtractComplete } from "@/lib/messaging/handle-analyze";
import { setExecutionState } from "@/lib/storage/config";

export default defineBackground(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const complete = ExtractCompleteMessageSchema.safeParse(message);
    if (complete.success) {
      handleExtractComplete(sender, complete.data.data).then(sendResponse);
      return true;
    }

    const parsed = SidePanelMessageSchema.safeParse(message);
    if (parsed.success && parsed.data.type === "ANALYZE_FORM") {
      sendResponse({
        ok: false,
        error:
          "Use o botão Analisar no painel (extração local). Se persistir, recarregue a extensão.",
        executionState: "FAILED",
      });
      return false;
    }

    if (message?.type === "EXECUTION_STATE_SYNC") {
      setExecutionState(message.state).then(() =>
        sendResponse({ ok: true }),
      );
      return true;
    }

    return false;
  });
});
