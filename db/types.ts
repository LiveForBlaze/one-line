export type EntryKind = 'common' | 'private';

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

export function moodLabel(score: number | null): MoodLabel {
  if (score === null) return 'neutral';
  if (score > 0.1) return 'positive';
  if (score < -0.1) return 'challenging';
  return 'neutral';
}
