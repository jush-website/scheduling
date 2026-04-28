import { z } from 'zod';
import { isBefore, parse } from 'date-fns';

export const eventSchema = z.object({
  title: z.string().min(1, "行程標題為必填"),
  date: z.string().min(1, "日期為必填"),
  isAllDay: z.boolean(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.isAllDay && data.startTime && data.endTime) {
    const start = parse(data.startTime, 'HH:mm', new Date());
    const end = parse(data.endTime, 'HH:mm', new Date());
    
    if (isBefore(end, start)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "結束時間必須在開始時間之後",
        path: ["endTime"],
      });
    }
  }
});

export type EventSchemaType = z.infer<typeof eventSchema>;
