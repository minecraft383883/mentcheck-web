import { Mood } from "./diary";

export interface DailyMoodRecord {
  date: string;
  mood: Mood | null;
  hasNote: boolean;
}

export interface MonthlyStats {
  month: string;
  year: number;
  records: DailyMoodRecord[];
  dominantMood: Mood | null;
  moodCounts: Record<string, number>;
  daysWithEntry: number;
  totalDays: number;
  streak: number;
}
