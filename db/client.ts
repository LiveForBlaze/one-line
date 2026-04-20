import { openDatabaseSync } from 'expo-sqlite';

export const db = openDatabaseSync('diary.db');

export function initSchema() {
  db.execSync(`PRAGMA journal_mode = WAL;`);

  // Check if we're on the old schema (has is_private column)
  const cols = db.getAllSync<{ name: string }>(`PRAGMA table_info(entries)`);
  const hasIsPrivate = cols.some((c) => c.name === 'is_private');
  const hasKind = cols.some((c) => c.name === 'kind');

  if (hasIsPrivate && !hasKind) {
    // Migrate old schema to new
    db.execSync(`
      ALTER TABLE entries RENAME TO entries_v1;

      CREATE TABLE entries (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        date        TEXT    NOT NULL,
        kind        TEXT    NOT NULL DEFAULT 'common',
        text        TEXT    NOT NULL DEFAULT '',
        mood_score  REAL,
        photo_path  TEXT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
        UNIQUE(date, kind)
      );

      INSERT INTO entries (id, date, kind, text, mood_score, photo_path, created_at)
        SELECT id, date,
               CASE WHEN is_private = 1 THEN 'private' ELSE 'common' END,
               text, mood_score, photo_path, created_at
        FROM entries_v1;

      DROP TABLE entries_v1;

      CREATE INDEX IF NOT EXISTS idx_entries_date ON entries (date DESC);
    `);
  } else {
    // Fresh install
    db.execSync(`
      CREATE TABLE IF NOT EXISTS entries (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        date        TEXT    NOT NULL,
        kind        TEXT    NOT NULL DEFAULT 'common',
        text        TEXT    NOT NULL DEFAULT '',
        mood_score  REAL,
        photo_path  TEXT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
        UNIQUE(date, kind)
      );

      CREATE INDEX IF NOT EXISTS idx_entries_date ON entries (date DESC);
    `);
  }
}
