import { extractFieldsFromDocument } from "@/lib/dom/extract-fields";
import type { FieldsSnapshot } from "@/lib/form-engine/types";

export function extractFormSnapshot(): FieldsSnapshot {
  return extractFieldsFromDocument();
}
