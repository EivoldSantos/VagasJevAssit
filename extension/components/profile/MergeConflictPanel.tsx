import { useState } from "react";
import type { CandidateProfile } from "@/lib/profile/schema";
import type { MergeConflict } from "@/lib/profile/merge-from-pdf";
import {
  applyMergeChoices,
  type ConflictChoice,
} from "@/lib/profile/apply-merge-choices";

type Props = {
  current: CandidateProfile;
  incoming: CandidateProfile;
  conflicts: MergeConflict[];
  onApply: (profile: CandidateProfile) => void;
  onDismiss: () => void;
};

export default function MergeConflictPanel({
  current,
  incoming,
  conflicts,
  onApply,
  onDismiss,
}: Props) {
  const [choices, setChoices] = useState<Record<string, ConflictChoice>>(() => {
    const init: Record<string, ConflictChoice> = {};
    for (const c of conflicts) init[c.path] = "manual";
    return init;
  });

  if (conflicts.length === 0) return null;

  return (
    <div className="merge-panel" role="dialog" aria-labelledby="merge-title">
      <h2 id="merge-title">Conflitos com o currículo</h2>
      <p className="muted">
        Escolha o que manter. O padrão preserva o que você já tinha (manual).
      </p>
      <ul className="merge-list">
        {conflicts.map((c) => (
          <li key={c.path}>
            <strong>{c.path}</strong>
            <div className="muted">
              Manual: {c.manualValue} · PDF/IA: {c.incomingValue}
            </div>
            <label>
              <input
                type="radio"
                name={c.path}
                checked={choices[c.path] === "manual"}
                onChange={() =>
                  setChoices((ch) => ({ ...ch, [c.path]: "manual" }))
                }
              />
              Manter manual
            </label>
            <label>
              <input
                type="radio"
                name={c.path}
                checked={choices[c.path] === "incoming"}
                onChange={() =>
                  setChoices((ch) => ({ ...ch, [c.path]: "incoming" }))
                }
              />
              Usar do PDF/IA
            </label>
          </li>
        ))}
      </ul>
      <div className="actions">
        <button
          type="button"
          className="primary"
          onClick={() =>
            onApply(applyMergeChoices(current, incoming, conflicts, choices))
          }
        >
          Aplicar escolhas
        </button>
        <button type="button" onClick={onDismiss}>
          Depois
        </button>
      </div>
    </div>
  );
}
