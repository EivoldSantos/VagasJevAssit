import { useCallback, useEffect, useRef, useState } from "react";
import { CandidateProfileSchema, type CandidateProfile } from "@/lib/profile/schema";
import { normalizeProfile } from "@/lib/profile/normalize";
import { saveProfile } from "@/lib/storage/profile-db";

export type ProfileSaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 800;

export async function persistProfile(
  draft: CandidateProfile,
): Promise<{ ok: true; data: CandidateProfile } | { ok: false; error: string }> {
  const normalized = normalizeProfile({
    ...draft,
    updatedAt: new Date().toISOString(),
  });
  const parsed = CandidateProfileSchema.safeParse(normalized);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("; "),
    };
  }
  await saveProfile(parsed.data);
  return { ok: true, data: parsed.data };
}

export function useDebouncedProfileSave(
  profile: CandidateProfile,
  opts?: { skipInitial?: boolean },
) {
  const [status, setStatus] = useState<ProfileSaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const skipNextRef = useRef(opts?.skipInitial ?? true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(async (draft: CandidateProfile) => {
    setStatus("saving");
    setError(null);
    const result = await persistProfile(draft);
    if (!result.ok) {
      setError(result.error);
      setStatus("error");
      return null;
    }
    setStatus("saved");
    return result.data;
  }, []);

  const saveNow = useCallback(async () => {
    const saved = await persist(profile);
    return saved;
  }, [persist, profile]);

  useEffect(() => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void persist(profile);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [profile, persist]);

  return { status, error, saveNow, setError, setStatus };
}
