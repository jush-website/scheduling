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
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string; // YYYY-MM-DD
  createdAt: any;
  date: string; // Added for backward compatibility with calendar views (mapping to targetDate)
}

export type EventFormData = Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'isCompleted' | 'date'>;
