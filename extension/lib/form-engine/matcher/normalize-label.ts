/** Lowercase, collapse whitespace, strip accents and punctuation for label matching. */
export function normalizeLabel(raw: string): string {
  const base = (raw || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return base;
}
