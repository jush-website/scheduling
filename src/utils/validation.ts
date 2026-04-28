import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startDate: z.string().min(1, "Start date is required"),
  targetDate: z.string().min(1, "Target date is required"),
  description: z.string().optional(),
});

export type EventSchemaType = z.infer<typeof eventSchema>;
