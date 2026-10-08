import type { CandidateProfile } from "./schema";
import type { MergeConflict } from "./merge-from-pdf";

export type ConflictChoice = "manual" | "incoming";

/** Apply per-field merge decisions (D-07). */
export function applyMergeChoices(
  current: CandidateProfile,
  incoming: CandidateProfile,
  conflicts: MergeConflict[],
  choices: Record<string, ConflictChoice>,
): CandidateProfile {
  const out = structuredClone(current);

  for (const c of conflicts) {
    const choice = choices[c.path] ?? "manual";
    if (choice === "manual") continue;

    if (c.path === "personalInfo.fullName") {
      out.personalInfo = {
        ...out.personalInfo,
        fullName: incoming.personalInfo.fullName,
      };
    } else if (c.path === "personalInfo.email") {
      out.personalInfo = {
        ...out.personalInfo,
        email: incoming.personalInfo.email,
      };
    } else if (c.path === "desiredRole") {
      out.desiredRole = incoming.desiredRole;
    } else if (c.path === "professionalSummary") {
      out.professionalSummary = incoming.professionalSummary;
    } else if (c.path === "experiences") {
      out.experiences = incoming.experiences;
    }
  }

  out.updatedAt = new Date().toISOString();
  return out;
}
