import {
  classifyTabError,
  formatTabError,
  getTabUrl,
  shouldBlockBeforeInject,
} from "@/lib/tab-errors";
import { extractFieldsOnTab } from "@/lib/inject/extract-on-tab";
import type { BackgroundResponse } from "@/lib/messaging/schemas";
import { setExecutionState } from "@/lib/storage/config";

export async function persistExtractResult(
  data: import("@/lib/messaging/schemas").FieldsExtractedPayload,
  tabUrl: string,
): Promise<BackgroundResponse> {
  await chrome.storage.local.set({
    lastExtractResult: data,
    lastExtractAt: Date.now(),
  });
  await setExecutionState("READY");
  return {
    ok: true,
    data,
    tabUrl,
    executionState: "READY",
  };
}

export async function reportAnalyzeFailure(
  error: string,
  code?: string,
): Promise<BackgroundResponse> {
  await setExecutionState("FAILED");
  return {
    ok: false,
    error,
    code,
    executionState: "FAILED",
  };
}

/** Side panel chama após extrair (gesto no painel) — só persiste estado. */
export async function handleExtractComplete(
  sender: chrome.runtime.MessageSender,
  payload: unknown,
): Promise<BackgroundResponse> {
  if (sender.id !== chrome.runtime.id) {
    return reportAnalyzeFailure("Origem não reconhecida.");
  }
  const { FieldsExtractedPayloadSchema } = await import(
    "@/lib/messaging/schemas"
  );
  const parsed = FieldsExtractedPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return reportAnalyzeFailure("Payload inválido.");
  }
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return persistExtractResult(parsed.data, getTabUrl(tab));
}

export async function resolveActiveTab() {
  let [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (!tab?.id) {
    [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
  }
  return tab;
}

export { extractFieldsOnTab, classifyTabError, formatTabError, shouldBlockBeforeInject, getTabUrl };
