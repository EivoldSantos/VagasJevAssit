import { useCallback, useEffect, useState } from "react";
import {
  createEmptyProfile,
  type CandidateProfile,
} from "@/lib/profile/schema";
import { normalizeProfile } from "@/lib/profile/normalize";
import { getProfile, PROFILE_ID } from "@/lib/storage/profile-db";
import type { MergeConflict } from "@/lib/profile/merge-from-pdf";
import { persistProfile, useDebouncedProfileSave } from "@/hooks/useDebouncedProfileSave";
import ProfileSubNav, { type ProfileTab } from "@/components/profile/ProfileSubNav";
import PersonalTab from "@/components/profile/PersonalTab";
import TrajectoryTab from "@/components/profile/TrajectoryTab";
import PreferencesTab from "@/components/profile/PreferencesTab";
import MergeConflictPanel from "@/components/profile/MergeConflictPanel";

type Props = {
  pendingMerge?: {
    profile: CandidateProfile;
    incoming: CandidateProfile;
    conflicts: MergeConflict[];
  } | null;
  onClearPendingMerge?: () => void;
};

export default function ProfileSection({
  pendingMerge = null,
  onClearPendingMerge,
}: Props) {
  const [profile, setProfile] = useState<CandidateProfile>(() =>
    createEmptyProfile(PROFILE_ID),
  );
  const [tab, setTab] = useState<ProfileTab>("personal");
  const [loading, setLoading] = useState(true);
  const [manualSaving, setManualSaving] = useState(false);

  const { status, error, saveNow, setError } = useDebouncedProfileSave(profile, {
    skipInitial: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await getProfile();
        if (!cancelled && stored) setProfile(stored);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Falha ao carregar perfil.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setError]);

  useEffect(() => {
    if (pendingMerge?.profile) {
      setProfile(pendingMerge.profile);
    }
  }, [pendingMerge]);

  const handleSaveNow = useCallback(async () => {
    setManualSaving(true);
    try {
      const saved = await saveNow();
      if (saved) setProfile(saved);
    } finally {
      setManualSaving(false);
    }
  }, [saveNow]);

  const applyMerge = useCallback(
    async (next: CandidateProfile) => {
      const normalized = normalizeProfile(next);
      const result = await persistProfile(normalized);
      if (result.ok) {
        setProfile(result.data);
        onClearPendingMerge?.();
      } else {
        setError(result.error);
      }
    },
    [onClearPendingMerge, setError],
  );

  if (loading) {
    return (
      <div>
        <h1>Perfil</h1>
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Perfil</h1>
      <p className="muted">Cadastro manual com autosave (~800 ms).</p>

      {pendingMerge && pendingMerge.conflicts.length > 0 && (
        <MergeConflictPanel
          current={profile}
          incoming={pendingMerge.incoming}
          conflicts={pendingMerge.conflicts}
          onApply={(p) => void applyMerge(p)}
          onDismiss={() => onClearPendingMerge?.()}
        />
      )}

      <ProfileSubNav active={tab} onSelect={setTab} />

      {tab === "personal" && (
        <PersonalTab profile={profile} onChange={setProfile} />
      )}
      {tab === "trajectory" && (
        <TrajectoryTab profile={profile} onChange={setProfile} />
      )}
      {tab === "preferences" && (
        <PreferencesTab profile={profile} onChange={setProfile} />
      )}

      <div className="actions">
        <button
          type="button"
          disabled={manualSaving}
          onClick={() => void handleSaveNow()}
        >
          {manualSaving ? "Salvando…" : "Salvar agora"}
        </button>
        {status === "saving" && (
          <span className="muted" role="status">
            Salvando…
          </span>
        )}
        {status === "saved" && (
          <span className="badge ok" role="status">
            Salvo
          </span>
        )}
      </div>

      {error && <div className="error-box">{error}</div>}
    </div>
  );
}
