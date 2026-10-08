/** chrome.storage.local keys for product UI/FSM — never store full CandidateProfile here (D-13). */
export const LAST_SECTION_KEY = "lastPanelSection";
export const EXECUTION_STATE_KEY = "executionState";
export const LAST_EXTRACT_RESULT_KEY = "lastExtractResult";
export const LAST_EXTRACT_AT_KEY = "lastExtractAt";

/** BYOK placeholders (Phase 5) */
export const BYOK_PROVIDER_KEY = "byokProvider";
export const BYOK_API_KEY_KEY = "byokApiKey";

export const PRODUCT_STORAGE_KEYS = [
  LAST_SECTION_KEY,
  EXECUTION_STATE_KEY,
  LAST_EXTRACT_RESULT_KEY,
  LAST_EXTRACT_AT_KEY,
  BYOK_PROVIDER_KEY,
  BYOK_API_KEY_KEY,
] as const;
