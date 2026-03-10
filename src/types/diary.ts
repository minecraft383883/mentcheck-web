export type Mood =
  | "alegria"
  | "tristeza"
  | "enojo"
  | "miedo"
  | "tedio"
  | "ansiedad"
  | "no_lo_se";

export interface DiaryEntry {
  id: string;
  patientProfileId?: string;
  date: string;
  mood: Mood;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MoodOption {
  value: Mood;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  symbol: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: "alegria",  label: "Alegría",   emoji: "😊", color: "#d97706", bg: "#fffbeb", symbol: "AL" },
  { value: "tristeza", label: "Tristeza",  emoji: "😢", color: "#2b6cb0", bg: "#ebf8ff", symbol: "TR" },
  { value: "enojo",    label: "Enojo",     emoji: "😠", color: "#c53030", bg: "#fff5f5", symbol: "EN" },
  { value: "miedo",    label: "Miedo",     emoji: "😨", color: "#6b46c1", bg: "#faf5ff", symbol: "MI" },
  { value: "tedio",    label: "Fastidio",  emoji: "😑", color: "#4a5568", bg: "#f7fafc", symbol: "FA" },
  { value: "ansiedad", label: "Ansiedad",  emoji: "😰", color: "#b7791f", bg: "#fffff0", symbol: "AN" },
  { value: "no_lo_se", label: "No lo sé",  emoji: "🤔", color: "#718096", bg: "#f7fafc", symbol: "?"  },
];
