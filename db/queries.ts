import { db } from './client';
import type { Entry, EntryKind, NewEntry } from './types';

export function upsertEntry(entry: Omit<NewEntry, 'mood_score'> & { mood_score?: number | null }): Entry {
  return db.getFirstSync<Entry>(
    `INSERT INTO entries (date, kind, text, mood_score, photo_path)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date, kind) DO UPDATE SET
       text       = excluded.text,
       mood_score = excluded.mood_score,
       photo_path = excluded.photo_path
     RETURNING *`,
    [entry.date, entry.kind, entry.text, entry.mood_score ?? null, entry.photo_path ?? null],
  )!;
}

export function getEntryByDateAndKind(date: string, kind: EntryKind): Entry | null {
  return db.getFirstSync<Entry>(
    `SELECT * FROM entries WHERE date = ? AND kind = ?`,
    [date, kind],
  ) ?? null;
}

export function getAllEntries(includePrivate: boolean): Entry[] {
  if (includePrivate) {
    return db.getAllSync<Entry>(`SELECT * FROM entries ORDER BY date DESC, kind ASC`);
  }
  return db.getAllSync<Entry>(
    `SELECT * FROM entries WHERE kind = 'common' ORDER BY date DESC`,
  );
}

export function getOnThisDay(monthDay: string, includePrivate: boolean): Entry[] {
  if (includePrivate) {
    return db.getAllSync<Entry>(
      `SELECT * FROM entries WHERE date LIKE ? ORDER BY date DESC, kind ASC`,
      [`%-${monthDay}`],
    );
  }
  return db.getAllSync<Entry>(
    `SELECT * FROM entries WHERE date LIKE ? AND kind = 'common' ORDER BY date DESC`,
    [`%-${monthDay}`],
  );
}

export function searchEntries(query: string, kind: 'common' | 'private' | 'all'): Entry[] {
  if (kind === 'all') {
    return db.getAllSync<Entry>(
      `SELECT * FROM entries WHERE text LIKE ? ORDER BY date DESC LIMIT 100`,
      [`%${query}%`],
    );
  }
  return db.getAllSync<Entry>(
    `SELECT * FROM entries WHERE text LIKE ? AND kind = ? ORDER BY date DESC LIMIT 100`,
    [`%${query}%`, kind],
  );
}

export function deleteEntry(date: string, kind: EntryKind): void {
  db.runSync(`DELETE FROM entries WHERE date = ? AND kind = ?`, [date, kind]);
}

export function getStreak(): number {
  const rows = db.getAllSync<{ date: string }>(
    `SELECT DISTINCT date FROM entries WHERE kind = 'common' AND text != '' ORDER BY date DESC`,
  );
  if (rows.length === 0) return 0;

  const today = new Date();
  let streak = 0;
  let cursor = new Date(today);

  for (const row of rows) {
    const cursorStr = cursor.toISOString().slice(0, 10);
    if (row.date === cursorStr) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (row.date < cursorStr) {
      break;
    }
  }
  return streak;
}
