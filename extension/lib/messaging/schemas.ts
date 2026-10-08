import { z } from "zod";
import {
  FillActionSchema,
  FillResultSchema,
  FormFieldSchema,
} from "@/lib/form-engine/types";

export const ExecutionStateSchema = z.enum([
  "IDLE",
  "ANALYZING",
  "FILLING",
  "READY",
  "FAILED",
]);

export type ExecutionState = z.infer<typeof ExecutionStateSchema>;

export { FormFieldSchema, FillActionSchema, FillResultSchema };
export type { FormField, FillAction, FillResult } from "@/lib/form-engine/types";

export const FieldsExtractedPayloadSchema = z.object({
  snapshotId: z.string(),
  count: z.number(),
  fields: z.array(FormFieldSchema),
});

export type FieldsExtractedPayload = z.infer<
  typeof FieldsExtractedPayloadSchema
>;

export const AnalyzeFormMessageSchema = z.object({
  type: z.literal("ANALYZE_FORM"),
});

export const AutofillFormMessageSchema = z.object({
  type: z.literal("AUTOFILL_FORM"),
  tabId: z.number().int().positive().optional(),
});

export const AutofillErrorPayloadSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  executionState: ExecutionStateSchema,
});

export type AutofillErrorPayload = z.infer<typeof AutofillErrorPayloadSchema>;

export const ExtractCompleteMessageSchema = z.object({
  type: z.literal("EXTRACT_COMPLETE"),
  data: FieldsExtractedPayloadSchema,
});

export const FillCompleteMessageSchema = z.object({
  type: z.literal("FILL_COMPLETE"),
  data: z.object({
    snapshotId: z.string(),
    results: z.array(FillResultSchema),
  }),
});

export const SidePanelMessageSchema = z.discriminatedUnion("type", [
  AnalyzeFormMessageSchema,
  AutofillFormMessageSchema,
]);

export type SidePanelMessage = z.infer<typeof SidePanelMessageSchema>;

export const BackgroundResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    data: FieldsExtractedPayloadSchema,
    tabUrl: z.string().optional(),
    executionState: ExecutionStateSchema,
  }),
  z.object({
    ok: z.literal(false),
    error: z.string(),
    code: z.string().optional(),
    executionState: ExecutionStateSchema.optional(),
  }),
]);

export type BackgroundResponse = z.infer<typeof BackgroundResponseSchema>;

export const AutofillResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    snapshotId: z.string(),
    results: z.array(FillResultSchema),
    tabUrl: z.string().optional(),
    executionState: ExecutionStateSchema,
  }),
  z.object({
    ok: z.literal(false),
    error: z.string(),
    code: z.string().optional(),
    executionState: ExecutionStateSchema,
  }),
]);

export type AutofillBackgroundResponse = z.infer<
  typeof AutofillResponseSchema
>;

export const ExecutionStateBroadcastSchema = z.object({
  type: z.literal("EXECUTION_STATE"),
  state: ExecutionStateSchema,
});
