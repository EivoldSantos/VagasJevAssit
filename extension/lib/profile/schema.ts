import { z } from "zod";
import { experienceDatesValid } from "./dates";

export const PROFILE_SCHEMA_VERSION = 1;

export const DataProvenanceSchema = z.object({
  source: z.enum(["manual", "resume", "inferred"]),
  verified: z.boolean(),
  confidence: z.number().min(0).max(1),
  lastConfirmedAt: z.string().optional(),
});

export type DataProvenance = z.infer<typeof DataProvenanceSchema>;

const optionalTrimmed = z
  .string()
  .transform((s) => s.trim())
  .optional();

export const ExperienceSchema = z
  .object({
    company: optionalTrimmed,
    title: optionalTrimmed,
    startDate: optionalTrimmed,
    endDate: optionalTrimmed,
    current: z.boolean().optional(),
    responsibilities: optionalTrimmed,
    achievements: optionalTrimmed,
  })
  .superRefine((exp, ctx) => {
    if (!experienceDatesValid(exp)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Datas da experiência inválidas (fim antes do início ou current com fim preenchido).",
      });
    }
  });

export const EducationSchema = z.object({
  institution: optionalTrimmed,
  degree: optionalTrimmed,
  field: optionalTrimmed,
  startDate: optionalTrimmed,
  endDate: optionalTrimmed,
});

export const SkillSchema = z.object({
  name: z.string().trim().min(1),
  kind: z.enum(["technical", "behavioral"]),
});

export const LanguageSchema = z.object({
  name: z.string().trim().min(1),
  level: optionalTrimmed,
});

export const CertificationSchema = z.object({
  name: z.string().trim().min(1),
  issuer: optionalTrimmed,
  date: optionalTrimmed,
});

export const SavedAnswerSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
  approved: z.boolean(),
});

export const SourceDocumentSchema = z.object({
  id: z.string().trim().min(1),
  kind: z.literal("pdf"),
  name: z.string().trim().min(1),
});

/** Aligned with docs/SPEC.md §6.1; desiredRole at root per D-03. */
export const CandidateProfileSchema = z.object({
  id: z.string().trim().min(1),
  /** Cargo pretendido (spec §5.3) */
  desiredRole: optionalTrimmed,
  personalInfo: z
    .object({
      fullName: optionalTrimmed,
      email: optionalTrimmed,
      phone: optionalTrimmed,
      city: optionalTrimmed,
      state: optionalTrimmed,
      country: optionalTrimmed,
      address: optionalTrimmed,
      linkedin: optionalTrimmed,
      github: optionalTrimmed,
      portfolio: optionalTrimmed,
    })
    .default({}),
  professionalSummary: optionalTrimmed,
  experiences: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  preferences: z
    .object({
      workMode: z.enum(["remote", "hybrid", "onsite"]).optional(),
      desiredLocation: optionalTrimmed,
      availability: optionalTrimmed,
      salaryExpectation: optionalTrimmed,
      contractType: optionalTrimmed,
    })
    .default({}),
  savedAnswers: z.array(SavedAnswerSchema).default([]),
  sourceDocuments: z.array(SourceDocumentSchema).default([]),
  fieldMeta: z.record(z.string(), DataProvenanceSchema).optional(),
  updatedAt: z.string().trim().min(1),
});

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;

export function createEmptyProfile(id = "default"): CandidateProfile {
  return {
    id,
    personalInfo: {},
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    preferences: {},
    savedAnswers: [],
    sourceDocuments: [],
    updatedAt: new Date().toISOString(),
  };
}
