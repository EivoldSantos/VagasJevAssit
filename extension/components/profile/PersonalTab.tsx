import type { CandidateProfile } from "@/lib/profile/schema";
import { setFieldMetaManual } from "@/lib/profile/field-meta";
import ProvenanceChip from "./ProvenanceChip";

type Props = {
  profile: CandidateProfile;
  onChange: (profile: CandidateProfile) => void;
};

const FIELDS: { key: keyof CandidateProfile["personalInfo"]; label: string }[] =
  [
    { key: "fullName", label: "Nome completo" },
    { key: "email", label: "E-mail" },
    { key: "phone", label: "Telefone" },
    { key: "city", label: "Cidade" },
    { key: "state", label: "Estado" },
    { key: "country", label: "País" },
    { key: "address", label: "Endereço" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "github", label: "GitHub" },
    { key: "portfolio", label: "Portfólio" },
  ];

export default function PersonalTab({ profile, onChange }: Props) {
  const setPersonal = (key: keyof CandidateProfile["personalInfo"], value: string) => {
    const path = `personalInfo.${key}`;
    let next = {
      ...profile,
      personalInfo: { ...profile.personalInfo, [key]: value },
    };
    next = setFieldMetaManual(next, path);
    onChange(next);
  };

  return (
    <div className="profile-tab">
      {FIELDS.map(({ key, label }) => {
        const path = `personalInfo.${key}`;
        return (
          <div key={key} className="field-row">
            <label htmlFor={`pi-${key}`}>
              {label}{" "}
              <ProvenanceChip meta={profile.fieldMeta?.[path]} />
            </label>
            <input
              id={`pi-${key}`}
              type="text"
              value={profile.personalInfo[key] ?? ""}
              onChange={(e) => setPersonal(key, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}
