import { create } from 'zustand';
import { format } from 'date-fns';
import {
  upsertEntry,
  getEntryByDateAndKind,
  getAllEntries,
  getOnThisDay,
  searchEntries,
} from '@/db/queries';
import { scoreSentiment } from '@/services/sentiment';
import type { Entry, EntryKind } from '@/db/types';

interface EntriesState {
  entries: Entry[];
  todayCommon: Entry | null;
  todayPrivate: Entry | null;
  onThisDay: Entry[];
  searchResults: Entry[] | null;

  load: (includePrivate: boolean) => void;
  loadToday: () => void;
  loadOnThisDay: (date: Date, includePrivate: boolean) => void;
  saveEntry: (text: string, kind: EntryKind) => void;
  search: (query: string, kind: 'common' | 'private' | 'all') => void;
  clearSearch: () => void;
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
  entries: [],
  todayCommon: null,
  todayPrivate: null,
  onThisDay: [],
  searchResults: null,

  load(includePrivate: boolean) {
    const entries = getAllEntries(includePrivate);
    set({ entries });
  },

  loadToday() {
    const date = format(new Date(), 'yyyy-MM-dd');
    const todayCommon = getEntryByDateAndKind(date, 'common');
    const todayPrivate = getEntryByDateAndKind(date, 'private');
    set({ todayCommon, todayPrivate });
  },

  loadOnThisDay(date: Date, includePrivate: boolean) {
    const monthDay = format(date, 'MM-dd');
    const todayStr = format(date, 'yyyy-MM-dd');
    const rows = getOnThisDay(monthDay, includePrivate);
    set({ onThisDay: rows.filter((e) => e.date !== todayStr) });
  },

  saveEntry(text: string, kind: EntryKind) {
    const date = format(new Date(), 'yyyy-MM-dd');
    const mood_score = text.trim() ? scoreSentiment(text) : null;
    const saved = upsertEntry({ date, kind, text, mood_score, photo_path: null });
    const hasPrivate = get().entries.some((e) => e.kind === 'private');
    if (kind === 'common') {
      set({ todayCommon: saved });
    } else {
      set({ todayPrivate: saved });
    }
    get().load(kind === 'private' || hasPrivate);
  },

  search(query: string, kind: 'common' | 'private' | 'all') {
    if (!query.trim()) {
      set({ searchResults: null });
      return;
    }
    set({ searchResults: searchEntries(query, kind) });
  },

  clearSearch() {
    set({ searchResults: null });
  },
}));
