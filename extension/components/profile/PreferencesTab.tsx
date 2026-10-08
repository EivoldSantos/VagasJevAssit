import type { CandidateProfile } from "@/lib/profile/schema";
import { setFieldMetaManual } from "@/lib/profile/field-meta";
import RepeatableList from "./RepeatableList";

type Props = {
  profile: CandidateProfile;
  onChange: (profile: CandidateProfile) => void;
};

export default function PreferencesTab({ profile, onChange }: Props) {
  const prefs = profile.preferences;

  const setPref = (
    key: keyof CandidateProfile["preferences"],
    value: string,
  ) => {
    onChange({
      ...profile,
      preferences: { ...prefs, [key]: value },
    });
  };

  return (
    <div className="profile-tab">
      <div className="field-row">
        <label htmlFor="workMode">Modalidade</label>
        <select
          id="workMode"
          value={prefs.workMode ?? ""}
          onChange={(e) =>
            onChange({
              ...profile,
              preferences: {
                ...prefs,
                workMode: e.target.value
                  ? (e.target.value as "remote" | "hybrid" | "onsite")
                  : undefined,
              },
            })
          }
        >
          <option value="">—</option>
          <option value="remote">Remoto</option>
          <option value="hybrid">Híbrido</option>
          <option value="onsite">Presencial</option>
        </select>
      </div>
      <div className="field-row">
        <label htmlFor="desiredLocation">Localidade desejada</label>
        <input
          id="desiredLocation"
          value={prefs.desiredLocation ?? ""}
          onChange={(e) => setPref("desiredLocation", e.target.value)}
        />
      </div>
      <div className="field-row">
        <label htmlFor="availability">Disponibilidade</label>
        <input
          id="availability"
          value={prefs.availability ?? ""}
          onChange={(e) => setPref("availability", e.target.value)}
        />
      </div>
      <div className="field-row">
        <label htmlFor="salaryExpectation">Pretensão salarial</label>
        <input
          id="salaryExpectation"
          value={prefs.salaryExpectation ?? ""}
          onChange={(e) => setPref("salaryExpectation", e.target.value)}
        />
      </div>
      <div className="field-row">
        <label htmlFor="contractType">Tipo de contratação</label>
        <input
          id="contractType"
          value={prefs.contractType ?? ""}
          onChange={(e) => setPref("contractType", e.target.value)}
        />
      </div>

      <RepeatableList
        title="Respostas salvas"
        emptyLabel="Nenhuma resposta aprovada ainda."
        items={profile.savedAnswers}
        onAdd={() =>
          onChange({
            ...profile,
            savedAnswers: [
              ...profile.savedAnswers,
              { question: "", answer: "", approved: false },
            ],
          })
        }
        onRemove={(index) =>
          onChange({
            ...profile,
            savedAnswers: profile.savedAnswers.filter((_, i) => i !== index),
          })
        }
        renderItem={(_, index) => {
          const sa = profile.savedAnswers[index];
          return (
            <div>
              <input
                placeholder="Pergunta frequente"
                value={sa?.question ?? ""}
                onChange={(e) => {
                  const savedAnswers = [...profile.savedAnswers];
                  savedAnswers[index] = {
                    ...savedAnswers[index],
                    question: e.target.value,
                  };
                  onChange(
                    setFieldMetaManual(
                      { ...profile, savedAnswers },
                      `savedAnswers.${index}.question`,
                    ),
                  );
                }}
              />
              <textarea
                placeholder="Resposta aprovada"
                rows={2}
                value={sa?.answer ?? ""}
                onChange={(e) => {
                  const savedAnswers = [...profile.savedAnswers];
                  savedAnswers[index] = {
                    ...savedAnswers[index],
                    answer: e.target.value,
                  };
                  onChange({ ...profile, savedAnswers });
                }}
              />
              <label className="confirm-row">
                <input
                  type="checkbox"
                  checked={sa?.approved ?? false}
                  onChange={(e) => {
                    const savedAnswers = [...profile.savedAnswers];
                    savedAnswers[index] = {
                      ...savedAnswers[index],
                      approved: e.target.checked,
                    };
                    onChange({ ...profile, savedAnswers });
                  }}
                />
                Aprovada para uso futuro
              </label>
            </div>
          );
        }}
      />
    </div>
  );
}
