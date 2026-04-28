export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  isAllDay: boolean;
  isCompleted: boolean; // 新增狀態
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  createdAt: any;
}

export type EventFormData = Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'isCompleted'>;
