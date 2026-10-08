import type { CandidateProfile, DataProvenance } from "./schema";

export function getFieldMeta(
  profile: CandidateProfile,
  path: string,
): DataProvenance | undefined {
  return profile.fieldMeta?.[path];
}

export function setFieldMetaManual(
  profile: CandidateProfile,
  path: string,
): CandidateProfile {
  const fieldMeta = { ...(profile.fieldMeta ?? {}) };
  fieldMeta[path] = {
    source: "manual",
    verified: true,
    confidence: 1,
    lastConfirmedAt: new Date().toISOString(),
  };
  return { ...profile, fieldMeta };
}

export function setFieldMetaInferred(
  profile: CandidateProfile,
  path: string,
): CandidateProfile {
  const fieldMeta = { ...(profile.fieldMeta ?? {}) };
  fieldMeta[path] = {
    source: "inferred",
    verified: false,
    confidence: 0.5,
  };
  return { ...profile, fieldMeta };
}

export function confirmFieldMeta(
  profile: CandidateProfile,
  path: string,
): CandidateProfile {
  const existing = profile.fieldMeta?.[path];
  if (!existing) return profile;
  const fieldMeta = { ...(profile.fieldMeta ?? {}) };
  fieldMeta[path] = {
    ...existing,
    verified: true,
    lastConfirmedAt: new Date().toISOString(),
  };
  return { ...profile, fieldMeta };
}
