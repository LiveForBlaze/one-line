export type EntryKind = 'common' | 'private';
export type MoodScore = -3 | -2 | -1 | 0 | 1 | 2 | 3;

export interface Entry {
  id: number;
  date: string;        // YYYY-MM-DD
  kind: EntryKind;
  text: string;
  mood_score: number | null;
  photo_path: string | null;
  created_at: string;
}

export type NewEntry = Omit<Entry, 'id' | 'created_at'>;
export type MoodLabel = 'positive' | 'neutral' | 'challenging';

export function normalizeMoodScore(score: number | null): MoodScore | null {
  if (score === null) return null;
  const normalized = Math.max(-3, Math.min(3, Math.round(score)));
  return normalized as MoodScore;
}

export function moodLabel(score: number | null): MoodLabel {
  const normalized = normalizeMoodScore(score);
  if (normalized === null) return 'neutral';
  if (normalized > 0) return 'positive';
  if (normalized < 0) return 'challenging';
  return 'neutral';
}
