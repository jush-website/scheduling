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
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  createdAt: number;
}

export type EventFormData = Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>;
