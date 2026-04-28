import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, "行程標題為必填"),
  date: z.string().min(1, "日期為必填"),
  isAllDay: z.boolean().default(true),
  description: z.string().optional(),
});

export type EventSchemaType = z.infer<typeof eventSchema>;
