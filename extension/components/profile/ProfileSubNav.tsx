export type ProfileTab = "personal" | "trajectory" | "preferences";

type Props = {
  active: ProfileTab;
  onSelect: (tab: ProfileTab) => void;
};

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "personal", label: "Dados pessoais" },
  { id: "trajectory", label: "Trajetória" },
  { id: "preferences", label: "Preferências" },
];

export default function ProfileSubNav({ active, onSelect }: Props) {
  return (
    <nav className="profile-subnav" aria-label="Seções do perfil">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={active === t.id ? "active" : ""}
          onClick={() => onSelect(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
