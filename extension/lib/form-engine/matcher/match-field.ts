import type { FormField } from "@/lib/form-engine/types";
import { normalizeLabel } from "./normalize-label";
import { ALIAS_TO_PROFILE_PATH } from "./synonyms";

export type MatchStrategy = "label" | "name" | "id" | "placeholder" | "ariaLabel";

export type FieldMatch = {
  profilePath: string;
  strategy: MatchStrategy;
  confidence: number;
};

const EXACT_CONFIDENCE = 0.95;
const PARTIAL_CONFIDENCE = 0.82;

function lookupAlias(normalized: string): string | undefined {
  if (ALIAS_TO_PROFILE_PATH[normalized]) {
    return ALIAS_TO_PROFILE_PATH[normalized];
  }
  for (const [alias, path] of Object.entries(ALIAS_TO_PROFILE_PATH)) {
    if (normalized === alias) return path;
    if (normalized.includes(alias) || alias.includes(normalized)) {
      if (normalized.length >= 3 && alias.length >= 3) return path;
    }
  }
  return undefined;
}

function tryMatch(
  raw: string | undefined,
  strategy: MatchStrategy,
): FieldMatch | undefined {
  if (!raw?.trim()) return undefined;
  const normalized = normalizeLabel(raw);
  const exact = ALIAS_TO_PROFILE_PATH[normalized];
  if (exact) {
    return { profilePath: exact, strategy, confidence: EXACT_CONFIDENCE };
  }
  const partial = lookupAlias(normalized);
  if (partial) {
    return { profilePath: partial, strategy, confidence: PARTIAL_CONFIDENCE };
  }
  return undefined;
}

/** Rule-based matcher with strategy and confidence (D-10, D-11). */
export function matchField(field: FormField): FieldMatch | undefined {
  const attempts: Array<[string | undefined, MatchStrategy]> = [
    [field.label, "label"],
    [field.ariaLabel, "ariaLabel"],
    [field.placeholder, "placeholder"],
    [field.name, "name"],
    [field.id, "id"],
  ];
  let best: FieldMatch | undefined;
  for (const [raw, strategy] of attempts) {
    const m = tryMatch(raw, strategy);
    if (!m) continue;
    if (!best || m.confidence > best.confidence) best = m;
    if (m.confidence >= EXACT_CONFIDENCE) return m;
  }
  return best;
}

/** @deprecated use matchField */
export function matchFieldToProfilePath(field: FormField): string | null {
  return matchField(field)?.profilePath ?? null;
}

export type MatchedProfilePath = string | null;
