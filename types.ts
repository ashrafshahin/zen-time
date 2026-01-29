
export type Priority = 'low' | 'medium' | 'high';

export interface WeatherInfo {
  temp: string;
  condition: string;
  location: string;
  sourceUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  title?: string;
  mobile: string;
  timezone: string;
  avatarUrl?: string;
  joinedAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  dueDate: string;
  reminderTime?: string;
  reminderSent?: boolean;
  phoneNumber?: string;
  smsEnabled?: boolean;
  priority: Priority;
  completed: boolean;
  category: string;
  isRoutine: boolean;
}

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent';
  timestamp: number;
}

export interface DailyInsight {
  summary: string;
  suggestions: string[];
}
