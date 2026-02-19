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
  daysWithEntry: number;
  totalDays: number;
}
