import {
  FillActionSchema,
  FillResultSchema,
  FormFieldSchema,
  type FillAction,
  type FillResult,
  type FormField,
} from "@/lib/form-engine/types";
import { z } from "zod";

const FillSessionOutputSchema = z.object({
  snapshotId: z.string(),
  results: z.array(FillResultSchema),
});

export const FillSessionInputSchema = z.object({
  snapshotId: z.string(),
  actions: z.array(FillActionSchema),
  fields: z.array(FormFieldSchema).optional(),
});

type FillMessageResponse =
  | { ok: true; data: { snapshotId: string; results: FillResult[] } }
  | { ok: false; error: string };

/**
 * Executa plano de fill na aba — espelha extract-on-tab (D-15 guards no caller).
 */
export async function fillOnTab(
  tabId: number,
  snapshotId: string,
  actions: FillAction[],
  fields?: FormField[],
): Promise<{ snapshotId: string; results: FillResult[] }> {
  const input = FillSessionInputSchema.parse({ snapshotId, actions, fields });

  try {
    const msg = (await chrome.tabs.sendMessage(tabId, {
      type: "RUN_FILL",
      data: input,
    })) as FillMessageResponse | undefined;

    if (msg?.ok && msg.data) {
      const parsed = FillSessionOutputSchema.safeParse(msg.data);
      if (parsed.success) return parsed.data;
    }
  } catch {
    /* sem CS na aba — fallback inject */
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["fill-runner.js"],
  });

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (payload: {
      snapshotId: string;
      actions: FillAction[];
      fields?: FormField[];
    }) =>
      (
        window as unknown as {
          __vjaFill?: (input: {
            snapshotId: string;
            actions: FillAction[];
            fields?: FormField[];
          }) => { snapshotId: string; results: FillResult[] };
        }
      ).__vjaFill?.(payload),
    args: [input],
  });

  const parsed = FillSessionOutputSchema.safeParse(result);
  if (!parsed.success) {
    throw new Error("Resposta inválida do fill runner.");
  }
  return parsed.data;
}
