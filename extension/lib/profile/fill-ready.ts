import type { CandidateProfile } from "./schema";

function metaBlocks(path: string, profile: CandidateProfile): boolean {
  const meta = profile.fieldMeta?.[path];
  return meta?.source === "inferred" && meta.verified === false;
}

/** Profile subset safe for Phase 4 deterministic fill (D-10). */
export function toFillReadyProfile(profile: CandidateProfile): CandidateProfile {
  const out: CandidateProfile = structuredClone(profile);

  if (metaBlocks("personalInfo.fullName", profile)) {
    delete out.personalInfo.fullName;
  }
  if (metaBlocks("personalInfo.email", profile)) {
    delete out.personalInfo.email;
  }
  if (metaBlocks("desiredRole", profile)) {
    delete out.desiredRole;
  }

  out.experiences = profile.experiences.filter((_, i) => {
    return !metaBlocks(`experiences.${i}.company`, profile);
  });

  return out;
}
