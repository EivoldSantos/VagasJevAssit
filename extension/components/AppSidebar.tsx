import type { PanelSection } from "@/lib/storage/config";

const ITEMS: { id: PanelSection; label: string }[] = [
  { id: "profile", label: "Perfil" },
  { id: "resume", label: "Currículo" },
  { id: "application", label: "Candidatura" },
  { id: "ai", label: "Config. IA" },
];

type Props = {
  active: PanelSection;
  onSelect: (s: PanelSection) => void;
};

export default function AppSidebar({ active, onSelect }: Props) {
  return (
    <nav className="sidebar" aria-label="Seções">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={active === item.id ? "active" : ""}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
