import type { CandidateProfile } from "@/lib/profile/schema";
import { toFillReadyProfile } from "@/lib/profile/fill-ready";
import type { FillAction, FormField } from "@/lib/form-engine/types";
import { matchField } from "@/lib/form-engine/matcher/match-field";
import { normalizeLabel } from "@/lib/form-engine/matcher/normalize-label";

const COVER_LETTER_LABELS = [
  "cover letter",
  "carta de apresentacao",
  "carta apresentacao",
  "mensagem de candidatura",
  "motivation letter",
  "carta de motivacao",
];

function fieldLabelBlob(field: FormField): string {
  return [field.label, field.ariaLabel, field.placeholder, field.name]
    .filter(Boolean)
    .join(" ");
}

function isCoverLetterField(field: FormField): boolean {
  const normalized = normalizeLabel(fieldLabelBlob(field));
  if (!normalized) return false;
  return COVER_LETTER_LABELS.some(
    (phrase) =>
      normalized === phrase ||
      normalized.includes(phrase) ||
      phrase.includes(normalized),
  );
}

const CONFIDENCE_REVIEW_THRESHOLD = 0.85;

const PROFILE_PATH_GETTERS: Record<
  string,
  (p: CandidateProfile) => string | undefined
> = {
  "personalInfo.email": (p) => p.personalInfo?.email?.trim() || undefined,
  "personalInfo.fullName": (p) => p.personalInfo?.fullName?.trim() || undefined,
  "personalInfo.phone": (p) => p.personalInfo?.phone?.trim() || undefined,
  "personalInfo.city": (p) => p.personalInfo?.city?.trim() || undefined,
  "personalInfo.linkedin": (p) =>
    p.personalInfo?.linkedin?.trim() || undefined,
};

export function getValueByPath(
  profile: CandidateProfile,
  path: string,
): string | undefined {
  const getter = PROFILE_PATH_GETTERS[path];
  return getter ? getter(profile) : undefined;
}

function shouldSkipExisting(field: FormField): boolean {
  const cur = (field.currentValue ?? "").trim();
  return cur.length > 0;
}

function isLongTextarea(field: FormField): boolean {
  return field.tagName === "textarea" || field.inputType === "textarea";
}

export function planFillActions(
  snapshotId: string,
  fields: FormField[],
  profile: CandidateProfile,
): FillAction[] {
  const fillReady = toFillReadyProfile(profile);
  const actions: FillAction[] = [];

  for (const field of fields) {
    const actionId = crypto.randomUUID();

    if (field.sensitive) {
      actions.push({
        actionId,
        fieldId: field.fieldId,
        snapshotId,
        domIndex: field.domIndex,
        operation: "SKIP",
        source: "deterministic",
        confidence: 1,
        requiresReview: false,
        expectedOutcome: "Campo sensível — não preencher",
      });
      continue;
    }

    if (field.disabled || !field.visible) {
      actions.push({
        actionId,
        fieldId: field.fieldId,
        snapshotId,
        domIndex: field.domIndex,
        operation: "SKIP",
        source: "deterministic",
        confidence: 1,
        requiresReview: false,
        expectedOutcome: field.disabled
          ? "Campo desabilitado"
          : "Campo não visível",
      });
      continue;
    }

    if (shouldSkipExisting(field)) {
      actions.push({
        actionId,
        fieldId: field.fieldId,
        snapshotId,
        domIndex: field.domIndex,
        operation: "SKIP",
        source: "deterministic",
        confidence: 1,
        requiresReview: false,
        expectedOutcome: "Valor existente preservado (D-07)",
      });
      continue;
    }

    const match = matchField(field);
    if (!match) {
      const wantsUserInput =
        field.supportedOperations.includes("REQUEST_USER_INPUT") &&
        (isLongTextarea(field) || isCoverLetterField(field));
      if (wantsUserInput) {
        actions.push({
          actionId,
          fieldId: field.fieldId,
          snapshotId,
          domIndex: field.domIndex,
          operation: "REQUEST_USER_INPUT",
          source: "deterministic",
          confidence: 0,
          requiresReview: true,
          expectedOutcome: isCoverLetterField(field)
            ? "Carta de apresentação — preencha manualmente (D-10)"
            : "Texto longo — entrada do usuário",
        });
      } else {
        actions.push({
          actionId,
          fieldId: field.fieldId,
          snapshotId,
          domIndex: field.domIndex,
          operation: "SKIP",
          source: "deterministic",
          confidence: 1,
          requiresReview: false,
          expectedOutcome: "Campo desconhecido — sem valor inventado",
        });
      }
      continue;
    }

    const value = getValueByPath(fillReady, match.profilePath);
    if (!value) {
      actions.push({
        actionId,
        fieldId: field.fieldId,
        snapshotId,
        domIndex: field.domIndex,
        operation: "SKIP",
        source: "deterministic",
        confidence: match.confidence,
        requiresReview: false,
        expectedOutcome: "Perfil sem valor para este campo",
      });
      continue;
    }

    if (!field.supportedOperations.includes("FILL_TEXT")) {
      actions.push({
        actionId,
        fieldId: field.fieldId,
        snapshotId,
        domIndex: field.domIndex,
        operation: "SKIP",
        source: "deterministic",
        confidence: match.confidence,
        requiresReview: false,
        expectedOutcome: "Operação FILL_TEXT não suportada neste controle",
      });
      continue;
    }

    const requiresReview = match.confidence < CONFIDENCE_REVIEW_THRESHOLD;

    actions.push({
      actionId,
      fieldId: field.fieldId,
      snapshotId,
      domIndex: field.domIndex,
      operation: "FILL_TEXT",
      value,
      source: "deterministic",
      confidence: match.confidence,
      requiresReview,
      expectedOutcome: `Preencher com ${match.profilePath} (${match.strategy})`,
    });
  }

  return actions;
}

export function profileMissingFillMinimum(
  profile: CandidateProfile | null,
): boolean {
  if (!profile) return true;
  const ready = toFillReadyProfile(profile);
  const email = ready.personalInfo?.email?.trim();
  const name = ready.personalInfo?.fullName?.trim();
  return !email && !name;
}
