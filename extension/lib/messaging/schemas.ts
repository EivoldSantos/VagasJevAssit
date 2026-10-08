import { z } from "zod";

export const ExecutionStateSchema = z.enum([
  "IDLE",
  "ANALYZING",
  "READY",
  "FAILED",
]);

export type ExecutionState = z.infer<typeof ExecutionStateSchema>;

export const ExtractedFieldSchema = z.object({
  index: z.number(),
  label: z.string(),
  tagName: z.string(),
  inputType: z.string(),
  name: z.string(),
  id: z.string(),
  currentValue: z.string(),
  visible: z.boolean(),
});

export const FieldsExtractedPayloadSchema = z.object({
  count: z.number(),
  fields: z.array(ExtractedFieldSchema),
});

export type FieldsExtractedPayload = z.infer<
  typeof FieldsExtractedPayloadSchema
>;

export const AnalyzeFormMessageSchema = z.object({
  type: z.literal("ANALYZE_FORM"),
});

export const ExtractCompleteMessageSchema = z.object({
  type: z.literal("EXTRACT_COMPLETE"),
  data: FieldsExtractedPayloadSchema,
});

export const SidePanelMessageSchema = z.discriminatedUnion("type", [
  AnalyzeFormMessageSchema,
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

export const ExecutionStateBroadcastSchema = z.object({
  type: z.literal("EXECUTION_STATE"),
  state: ExecutionStateSchema,
});
