import {
  CandidateProfileSchema,
  createEmptyProfile,
  type CandidateProfile,
  type DataProvenance,
} from "./schema";
import { isByokConfigured } from "./is-byok-configured";
import { PROFILE_ID } from "@/lib/storage/profile-db";

type ParserFn = (text: string) => Promise<unknown>;

let parserOverride: ParserFn | null = null;

/** Vitest-only hook */
export function __setResumeParserForTests(fn: ParserFn | null): void {
  parserOverride = fn;
}

function markInferred(profile: CandidateProfile): CandidateProfile {
  const fieldMeta: Record<string, DataProvenance> = {
    ...(profile.fieldMeta ?? {}),
  };
  if (profile.personalInfo.fullName) {
    fieldMeta["personalInfo.fullName"] = {
      source: "inferred",
      verified: false,
      confidence: 0.5,
    };
  }
  for (let i = 0; i < profile.experiences.length; i++) {
    fieldMeta[`experiences.${i}.company`] = {
      source: "inferred",
      verified: false,
      confidence: 0.5,
    };
  }
  return { ...profile, fieldMeta };
}

export async function structureResumeText(
  extractedText: string,
): Promise<CandidateProfile> {
  const canParse = parserOverride !== null || (await isByokConfigured());
  if (!canParse) {
    throw new Error("BYOK não configurado — use revisão manual no Perfil.");
  }

  const raw = parserOverride
    ? await parserOverride(extractedText)
    : await callProviderStub(extractedText);

  const base = createEmptyProfile(PROFILE_ID);
  const merged = {
    ...base,
    ...(typeof raw === "object" && raw !== null ? raw : {}),
    id: PROFILE_ID,
    updatedAt: new Date().toISOString(),
  };

  const parsed = CandidateProfileSchema.safeParse(markInferred(merged as CandidateProfile));
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

async function callProviderStub(_text: string): Promise<unknown> {
  throw new Error(
    "Integração LLM completa na Phase 5 — configure BYOK ou use revisão manual.",
  );
}
