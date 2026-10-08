import type { DataProvenance } from "@/lib/profile/schema";

type Props = {
  meta?: DataProvenance;
};

export default function ProvenanceChip({ meta }: Props) {
  if (!meta) return null;
  const label =
    meta.source === "manual"
      ? "Manual"
      : meta.source === "resume"
        ? "PDF"
        : "IA";
  const cls =
    meta.source === "manual"
      ? "badge ok"
      : meta.source === "resume"
        ? "badge warn"
        : "badge err";
  return (
    <span className={cls} title={meta.verified ? "Confirmado" : "Não confirmado"}>
      {label}
      {!meta.verified && meta.source !== "manual" ? " · revisar" : ""}
    </span>
  );
}
