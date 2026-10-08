import type { CandidateProfile } from "./schema";

function trimOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

function cleanPersonalInfo(
  info: CandidateProfile["personalInfo"] | undefined,
): CandidateProfile["personalInfo"] | undefined {
  if (!info) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(info)) {
    const t = trimOptionalString(v);
    if (t !== undefined) out[k] = t;
  }
  return Object.keys(out).length > 0 ? (out as CandidateProfile["personalInfo"]) : undefined;
}

/** Trim strings; drop empty strings and empty optional objects (D-04). */
export function normalizeProfile(draft: CandidateProfile): CandidateProfile {
  const personalInfo = cleanPersonalInfo(draft.personalInfo) ?? {};
  const out: CandidateProfile = {
    id: draft.id,
    personalInfo,
    experiences: draft.experiences ?? [],
    education: draft.education ?? [],
    skills: draft.skills ?? [],
    languages: draft.languages ?? [],
    certifications: draft.certifications ?? [],
    preferences: draft.preferences ?? {},
    savedAnswers: draft.savedAnswers ?? [],
    sourceDocuments: draft.sourceDocuments ?? [],
    updatedAt: draft.updatedAt,
  };

  const desiredRole = trimOptionalString(draft.desiredRole);
  if (desiredRole) out.desiredRole = desiredRole;

  const professionalSummary = trimOptionalString(draft.professionalSummary);
  if (professionalSummary) out.professionalSummary = professionalSummary;

  if (draft.fieldMeta && Object.keys(draft.fieldMeta).length > 0) {
    out.fieldMeta = draft.fieldMeta;
  }

  return out;
}
