import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, "請輸入計畫名稱"),
  startDate: z.string().min(1, "請選擇開始日期"),
  targetDate: z.string().min(1, "請選擇預計完成日期"),
  description: z.string().optional(),
});

export type EventSchemaType = z.infer<typeof eventSchema>;
