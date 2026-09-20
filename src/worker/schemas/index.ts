import { z } from "zod";

export const depthSchema = z.enum(["explorar", "aprofundar", "investigar", "criar"]).default("explorar");

export const createExplorationSchema = z.object({
  firstMessage: z.string().min(1).max(2000),
  origin: z.enum(["guided", "spontaneous"]).default("guided"),
  depth: depthSchema,
});

export const postMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  depth: depthSchema,
});

export const postIdeaSchema = z.object({
  content: z.string().min(1).max(2000),
  fromExplorationId: z.string().uuid().optional(),
});

export const patchProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  fieldOfStudy: z.string().min(1).max(150).optional(),
  confirmed: z
    .object({
      interests: z.array(z.string().max(60)).max(30).optional(),
      hobbies: z.array(z.string().max(60)).max(30).optional(),
      technicalInterests: z.array(z.string().max(60)).max(30).optional(),
    })
    .optional(),
});

export const onboardingAnswerSchema = z.object({
  step: z.number().int().min(0),
  answer: z.string().min(1).max(1000),
});