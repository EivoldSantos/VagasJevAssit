import { FieldsExtractedPayloadSchema } from "@/lib/messaging/schemas";
import type { FieldsExtractedPayload } from "@/lib/messaging/schemas";

type ExtractMessageResponse =
  | { ok: true; data: FieldsExtractedPayload }
  | { ok: false; error: string };

/**
 * Extrai campos na aba — chamado no clique do Side Panel (gesto do usuário).
 * Lab: content script via sendMessage. Demais URLs: executeScript.
 */
export async function extractFieldsOnTab(
  tabId: number,
): Promise<FieldsExtractedPayload> {
  try {
    const msg = (await chrome.tabs.sendMessage(tabId, {
      type: "RUN_EXTRACT",
    })) as ExtractMessageResponse | undefined;

    if (msg?.ok && msg.data) {
      const parsed = FieldsExtractedPayloadSchema.safeParse(msg.data);
      if (parsed.success) return parsed.data;
    }
  } catch {
    /* sem CS na aba — fallback inject */
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["extract-runner.js"],
  });

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () =>
      (
        window as unknown as {
          __vjaExtract?: () => FieldsExtractedPayload;
        }
      ).__vjaExtract?.(),
  });

  const parsed = FieldsExtractedPayloadSchema.safeParse(result);
  if (!parsed.success) {
    throw new Error("Resposta inválida do content script.");
  }
  return parsed.data;
}
