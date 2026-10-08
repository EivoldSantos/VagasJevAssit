import { z } from "zod";

/** Fill operations allowed in Phase 4 tracer — no SUBMIT. */
export const FillOperationSchema = z.enum([
  "FILL_TEXT",
  "SELECT_OPTION",
  "CHECK",
  "UNCHECK",
  "CLICK_SAFE",
  "SKIP",
  "REQUEST_USER_INPUT",
]);

export type FillOperation = z.infer<typeof FillOperationSchema>;

export const FormFieldSchema = z.object({
  fieldId: z.string(),
  snapshotId: z.string(),
  frameId: z.string().optional(),
  documentId: z.string().optional(),
  tagName: z.string(),
  inputType: z.string().optional(),
  label: z.string().optional(),
  name: z.string().optional(),
  id: z.string().optional(),
  placeholder: z.string().optional(),
  ariaLabel: z.string().optional(),
  context: z.string().optional(),
  currentValue: z.string().optional(),
  required: z.boolean(),
  visible: z.boolean(),
  disabled: z.boolean(),
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .optional(),
  supportedOperations: z.array(FillOperationSchema),
  sensitive: z.boolean(),
  /** DOM order index within snapshot — resolves elements on fill. */
  domIndex: z.number(),
});

export type FormField = z.infer<typeof FormFieldSchema>;

export const FillActionSchema = z.object({
  actionId: z.string(),
  fieldId: z.string(),
  snapshotId: z.string(),
  domIndex: z.number(),
  operation: FillOperationSchema,
  value: z.string().optional(),
  source: z.enum(["deterministic", "ai", "user"]),
  confidence: z.number(),
  requiresReview: z.boolean(),
  expectedOutcome: z.string(),
});

export type FillAction = z.infer<typeof FillActionSchema>;

export const FillResultStatusSchema = z.enum([
  "FILLED",
  "SKIPPED",
  "NEEDS_REVIEW",
  "STALE",
  "UNSUPPORTED",
  "FAILED",
]);

export type FillResultStatus = z.infer<typeof FillResultStatusSchema>;

export const FillResultSchema = z.object({
  actionId: z.string(),
  fieldId: z.string(),
  status: FillResultStatusSchema,
  verified: z.boolean(),
  reason: z.string().optional(),
  previousValue: z.string().optional(),
  observedValue: z.string().optional(),
  executedAt: z.string(),
});

export type FillResult = z.infer<typeof FillResultSchema>;

export type FieldsSnapshot = {
  snapshotId: string;
  count: number;
  fields: FormField[];
};
