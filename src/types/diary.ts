export type Mood =
  | "alegria"
  | "tristeza"
  | "enojo"
  | "miedo"
  | "tedio"
  | "ansiedad"
  | "no_lo_se";

export interface MoodOption {
  value: Mood;
  label: string;
  color: string;
  bg: string;
  symbol: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  mood: Mood;
  note: string;
  createdAt: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: "alegria",   label: "Alegría",   color: "#b7791f", bg: "#fefcbf", symbol: "Al" },
  { value: "tristeza",  label: "Tristeza",  color: "#2b6cb0", bg: "#bee3f8", symbol: "Tr" },
  { value: "enojo",     label: "Enojo",     color: "#c53030", bg: "#fed7d7", symbol: "En" },
  { value: "miedo",     label: "Miedo",     color: "#6b46c1", bg: "#e9d8fd", symbol: "Mi" },
  { value: "tedio",     label: "Tedio",     color: "#4a5568", bg: "#e2e8f0", symbol: "Te" },
  { value: "ansiedad",  label: "Ansiedad",  color: "#c05621", bg: "#feebc8", symbol: "An" },
  { value: "no_lo_se",  label: "No lo sé",  color: "#2d3748", bg: "#edf2f7", symbol: "?" },
];
