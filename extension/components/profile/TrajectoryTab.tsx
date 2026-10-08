import type { CandidateProfile } from "@/lib/profile/schema";
import { confirmFieldMeta, setFieldMetaManual } from "@/lib/profile/field-meta";
import ProvenanceChip from "./ProvenanceChip";
import RepeatableList from "./RepeatableList";

type Props = {
  profile: CandidateProfile;
  onChange: (profile: CandidateProfile) => void;
};

export default function TrajectoryTab({ profile, onChange }: Props) {
  const setRoot = (field: "desiredRole" | "professionalSummary", value: string) => {
    let next = { ...profile, [field]: value };
    next = setFieldMetaManual(next, field);
    onChange(next);
  };

  return (
    <div className="profile-tab">
      <div className="field-row">
        <label htmlFor="desiredRole">
          Cargo pretendido{" "}
          <ProvenanceChip meta={profile.fieldMeta?.desiredRole} />
        </label>
        <input
          id="desiredRole"
          value={profile.desiredRole ?? ""}
          onChange={(e) => setRoot("desiredRole", e.target.value)}
        />
      </div>

      <div className="field-row">
        <label htmlFor="professionalSummary">
          Resumo profissional{" "}
          <ProvenanceChip meta={profile.fieldMeta?.professionalSummary} />
        </label>
        <textarea
          id="professionalSummary"
          rows={4}
          value={profile.professionalSummary ?? ""}
          onChange={(e) => setRoot("professionalSummary", e.target.value)}
        />
      </div>

      <RepeatableList
        title="Experiências"
        emptyLabel="Nenhuma experiência cadastrada."
        items={profile.experiences}
        onAdd={() =>
          onChange({
            ...profile,
            experiences: [...profile.experiences, {}],
          })
        }
        onRemove={(index) =>
          onChange({
            ...profile,
            experiences: profile.experiences.filter((_, i) => i !== index),
          })
        }
        renderItem={(_, index) => (
          <ExperienceFields
            profile={profile}
            index={index}
            onChange={onChange}
          />
        )}
      />

      <RepeatableList
        title="Formação"
        emptyLabel="Nenhuma formação cadastrada."
        items={profile.education}
        onAdd={() =>
          onChange({ ...profile, education: [...profile.education, {}] })
        }
        onRemove={(index) =>
          onChange({
            ...profile,
            education: profile.education.filter((_, i) => i !== index),
          })
        }
        renderItem={(_, index) => (
          <EducationFields profile={profile} index={index} onChange={onChange} />
        )}
      />

      <RepeatableList
        title="Competências"
        emptyLabel="Nenhuma competência."
        items={profile.skills}
        onAdd={() =>
          onChange({
            ...profile,
            skills: [...profile.skills, { name: "", kind: "technical" }],
          })
        }
        onRemove={(index) =>
          onChange({
            ...profile,
            skills: profile.skills.filter((_, i) => i !== index),
          })
        }
        renderItem={(_, index) => (
          <SkillFields profile={profile} index={index} onChange={onChange} />
        )}
      />
    </div>
  );
}

function ExperienceFields({
  profile,
  index,
  onChange,
}: {
  profile: CandidateProfile;
  index: number;
  onChange: (p: CandidateProfile) => void;
}) {
  const exp = profile.experiences[index] ?? {};
  const basePath = `experiences.${index}`;

  const setExp = (key: string, value: string | boolean) => {
    const experiences = [...profile.experiences];
    experiences[index] = { ...experiences[index], [key]: value };
    let next = { ...profile, experiences };
    next = setFieldMetaManual(next, `${basePath}.${key}`);
    onChange(next);
  };

  const meta = profile.fieldMeta?.[`${basePath}.company`];

  return (
    <div>
      <ProvenanceChip meta={meta} />
      {meta?.source === "inferred" && (
        <label className="confirm-row">
          <input
            type="checkbox"
            checked={!!meta.verified}
            onChange={() =>
              onChange(confirmFieldMeta(profile, `${basePath}.company`))
            }
          />
          Confirmado
        </label>
      )}
      <input
        placeholder="Empresa"
        value={exp.company ?? ""}
        onChange={(e) => setExp("company", e.target.value)}
      />
      <input
        placeholder="Cargo"
        value={exp.title ?? ""}
        onChange={(e) => setExp("title", e.target.value)}
      />
      <input
        placeholder="Início (YYYY-MM)"
        value={exp.startDate ?? ""}
        onChange={(e) => setExp("startDate", e.target.value)}
      />
      <input
        placeholder="Fim (YYYY-MM)"
        value={exp.endDate ?? ""}
        disabled={exp.current}
        onChange={(e) => setExp("endDate", e.target.value)}
      />
      <label className="confirm-row">
        <input
          type="checkbox"
          checked={exp.current ?? false}
          onChange={(e) => setExp("current", e.target.checked)}
        />
        Trabalho atual
      </label>
      <textarea
        placeholder="Responsabilidades"
        rows={2}
        value={exp.responsibilities ?? ""}
        onChange={(e) => setExp("responsibilities", e.target.value)}
      />
    </div>
  );
}

function EducationFields({
  profile,
  index,
  onChange,
}: {
  profile: CandidateProfile;
  index: number;
  onChange: (p: CandidateProfile) => void;
}) {
  const ed = profile.education[index] ?? {};
  const setEd = (key: string, value: string) => {
    const education = [...profile.education];
    education[index] = { ...education[index], [key]: value };
    onChange(setFieldMetaManual({ ...profile, education }, `education.${index}.${key}`));
  };
  return (
    <div>
      <input
        placeholder="Instituição"
        value={ed.institution ?? ""}
        onChange={(e) => setEd("institution", e.target.value)}
      />
      <input
        placeholder="Curso / grau"
        value={ed.degree ?? ""}
        onChange={(e) => setEd("degree", e.target.value)}
      />
    </div>
  );
}

function SkillFields({
  profile,
  index,
  onChange,
}: {
  profile: CandidateProfile;
  index: number;
  onChange: (p: CandidateProfile) => void;
}) {
  const sk = profile.skills[index];
  return (
    <div>
      <input
        placeholder="Nome"
        value={sk?.name ?? ""}
        onChange={(e) => {
          const skills = [...profile.skills];
          skills[index] = { ...skills[index], name: e.target.value };
          onChange(setFieldMetaManual({ ...profile, skills }, `skills.${index}.name`));
        }}
      />
      <select
        value={sk?.kind ?? "technical"}
        onChange={(e) => {
          const skills = [...profile.skills];
          skills[index] = {
            ...skills[index],
            kind: e.target.value as "technical" | "behavioral",
          };
          onChange({ ...profile, skills });
        }}
      >
        <option value="technical">Técnica</option>
        <option value="behavioral">Comportamental</option>
      </select>
    </div>
  );
}
