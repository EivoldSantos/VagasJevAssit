const LAST_SECTION_KEY = "lastPanelSection";
const EXECUTION_STATE_KEY = "executionState";

export type PanelSection =
  | "profile"
  | "resume"
  | "application"
  | "ai";

export async function getLastPanelSection(): Promise<PanelSection> {
  const { [LAST_SECTION_KEY]: v } = await chrome.storage.local.get(
    LAST_SECTION_KEY,
  );
  if (
    v === "profile" ||
    v === "resume" ||
    v === "application" ||
    v === "ai"
  ) {
    return v;
  }
  return "application";
}

export async function setLastPanelSection(
  section: PanelSection,
): Promise<void> {
  await chrome.storage.local.set({ [LAST_SECTION_KEY]: section });
}

export async function getExecutionState(): Promise<string> {
  const { [EXECUTION_STATE_KEY]: v } = await chrome.storage.local.get(
    EXECUTION_STATE_KEY,
  );
  if (
    v === "IDLE" ||
    v === "ANALYZING" ||
    v === "READY" ||
    v === "FAILED"
  ) {
    return v;
  }
  return "IDLE";
}

export async function setExecutionState(state: string): Promise<void> {
  await chrome.storage.local.set({ [EXECUTION_STATE_KEY]: state });
}
