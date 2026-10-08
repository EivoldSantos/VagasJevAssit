import type { CandidateProfile } from "./schema";

export type MergeConflict = {
  path: string;
  manualValue: string;
  incomingValue: string;
};

export type MergeResult = {
  merged: CandidateProfile;
  conflicts: MergeConflict[];
};

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/** Fill only absent/empty scalar fields on personalInfo and root strings (D-07). */
export function mergeProfiles(
  base: CandidateProfile,
  incoming: CandidateProfile,
  options: { mode: "fill-absent-only" },
): MergeResult {
  if (options.mode !== "fill-absent-only") {
    throw new Error("Unsupported merge mode");
  }

  const conflicts: MergeConflict[] = [];
  const merged: CandidateProfile = structuredClone(base);

  const mergeScalar = (
    path: string,
    current: string | undefined,
    next: string | undefined,
    apply: (v: string) => void,
  ) => {
    if (isEmpty(next)) return;
    if (isEmpty(current)) {
      apply(next!.trim());
      return;
    }
    if (current!.trim() !== next!.trim()) {
      conflicts.push({
        path,
        manualValue: current!.trim(),
        incomingValue: next!.trim(),
      });
    }
  };

  mergeScalar(
    "personalInfo.fullName",
    base.personalInfo.fullName,
    incoming.personalInfo.fullName,
    (v) => {
      merged.personalInfo = { ...merged.personalInfo, fullName: v };
    },
  );
  mergeScalar(
    "personalInfo.email",
    base.personalInfo.email,
    incoming.personalInfo.email,
    (v) => {
      merged.personalInfo = { ...merged.personalInfo, email: v };
    },
  );
  mergeScalar(
    "desiredRole",
    base.desiredRole,
    incoming.desiredRole,
    (v) => {
      merged.desiredRole = v;
    },
  );
  mergeScalar(
    "professionalSummary",
    base.professionalSummary,
    incoming.professionalSummary,
    (v) => {
      merged.professionalSummary = v;
    },
  );

  if (base.experiences.length === 0 && incoming.experiences.length > 0) {
    merged.experiences = incoming.experiences;
  } else if (
    base.experiences.length > 0 &&
    incoming.experiences.length > 0
  ) {
    conflicts.push({
      path: "experiences",
      manualValue: `${base.experiences.length} item(ns) manual`,
      incomingValue: `${incoming.experiences.length} item(ns) do PDF/IA`,
    });
  }

  merged.updatedAt = new Date().toISOString();
  return { merged, conflicts };
}
