import { planFillActions, profileMissingFillMinimum } from "@/lib/form-engine/planner";
import { fillOnTab } from "@/lib/inject/fill-on-tab";
import { extractFieldsOnTab } from "@/lib/inject/extract-on-tab";
import type { FillResult } from "@/lib/form-engine/types";
import { getProfile } from "@/lib/storage/profile-db";
import {
  classifyTabError,
  formatTabError,
  getTabUrl,
  resolveActiveTab,
  shouldBlockBeforeInject,
} from "@/lib/messaging/handle-analyze";
import { setExecutionState } from "@/lib/storage/config";

export type AutofillSuccess = {
  ok: true;
  snapshotId: string;
  results: FillResult[];
  tabUrl: string;
  executionState: "READY";
};

export type AutofillFailure = {
  ok: false;
  error: string;
  code?: string;
  executionState: "FAILED";
};

export type AutofillResponse = AutofillSuccess | AutofillFailure;

async function broadcastExecutionState(
  state: "FILLING" | "READY" | "FAILED",
): Promise<void> {
  try {
    await chrome.runtime.sendMessage({
      type: "EXECUTION_STATE",
      state,
    });
  } catch {
    /* nenhum listener */
  }
}

async function broadcastFillComplete(payload: {
  snapshotId: string;
  results: FillResult[];
}): Promise<void> {
  try {
    await chrome.runtime.sendMessage({
      type: "FILL_COMPLETE",
      data: payload,
    });
  } catch {
    /* painel fechado */
  }
}

export async function handleAutofillForm(
  sender: chrome.runtime.MessageSender,
): Promise<AutofillResponse> {
  if (sender.id !== chrome.runtime.id) {
    return {
      ok: false,
      error: "Origem não reconhecida.",
      executionState: "FAILED",
    };
  }

  const tab = await resolveActiveTab();
  if (!tab?.id) {
    await setExecutionState("FAILED");
    await broadcastExecutionState("FAILED");
    return {
      ok: false,
      error: "Nenhuma aba ativa — clique na aba do formulário e tente de novo.",
      executionState: "FAILED",
    };
  }

  const blockCode = shouldBlockBeforeInject(tab);
  if (blockCode) {
    await setExecutionState("FAILED");
    await broadcastExecutionState("FAILED");
    return {
      ok: false,
      error: formatTabError(blockCode),
      code: blockCode,
      executionState: "FAILED",
    };
  }

  const profile = await getProfile();
  if (profileMissingFillMinimum(profile)) {
    await setExecutionState("FAILED");
    await broadcastExecutionState("FAILED");
    return {
      ok: false,
      error:
        "Perfil incompleto: cadastre pelo menos nome completo ou e-mail em Perfil antes de autopreencher.",
      code: "PROFILE_INCOMPLETE",
      executionState: "FAILED",
    };
  }

  try {
    await setExecutionState("FILLING");
    await broadcastExecutionState("FILLING");

    const snapshot = await extractFieldsOnTab(tab.id);
    const actions = planFillActions(
      snapshot.snapshotId,
      snapshot.fields,
      profile!,
    );

    const fillOut = await fillOnTab(
      tab.id,
      snapshot.snapshotId,
      actions,
      snapshot.fields,
    );

    await setExecutionState("READY");
    await broadcastExecutionState("READY");
    await broadcastFillComplete({
      snapshotId: fillOut.snapshotId,
      results: fillOut.results,
    });

    return {
      ok: true,
      snapshotId: fillOut.snapshotId,
      results: fillOut.results,
      tabUrl: getTabUrl(tab),
      executionState: "READY",
    };
  } catch (e) {
    const code = classifyTabError(tab, e);
    await setExecutionState("FAILED");
    await broadcastExecutionState("FAILED");
    return {
      ok: false,
      error: formatTabError(code),
      code,
      executionState: "FAILED",
    };
  }
}
