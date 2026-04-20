# OneLine — One Line a Day

A minimalist diary app. One line per day. No more.  
After a year — 365 lines of your life. After five years — a book.

## Features

### MVP (current)
- **Daily entry** — one text field, auto-saves as you type, soft 200-char limit
- **Private entries** — toggle marks an entry as private; it shows as a blank day in the feed (no indicator), unlocked by PIN or biometrics
- **On This Day** — below today's entry, see what you wrote 1, 2, 3... years ago on the same date
- **Feed** — scrollable history with month separators, mood dots, and full-text search
- **Mood scoring** — local dictionary-based sentiment analysis (positive / neutral / challenging); no data sent anywhere
- **Daily reminder** — configurable push notification; skipped automatically if you've already written
- **Light / dark theme** — follows system setting

### Roadmap
- **v1.1** — Insights tab: word cloud, mood trends, monthly summary, patterns
- **v1.2** — Premium ($3.99 one-time): mood mosaic widget, export (TXT/PDF), themes, photo per entry, yearly recap (Spotify Wrapped style)

## Privacy

All data lives **only on your device**.

- No accounts, no registration, no sync
- Sentiment analysis runs locally (dictionary-based, not AI)
- PIN stored in iOS Keychain / Android Keystore, never plain text
- Private entries are invisible in the feed — shown as empty days to protect against a glancing eye
- Optional backup: encrypted export to iCloud / Google Drive (coming in v1.2)

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React Native + Expo 54 | Cross-platform, fast iteration |
| Navigation | Expo Router (file-based) | Type-safe routes, deep links |
| State | Zustand | Zero boilerplate, no providers |
| Database | expo-sqlite (WAL mode) | Local-only, fast, no server |
| Auth | expo-secure-store + expo-local-authentication | Keychain/Keystore + Face/Touch ID |
| Notifications | expo-notifications | Daily reminder |
| Dates | date-fns | Lightweight, tree-shakeable |
| Architecture | New Architecture (Fabric + JSI) | Enabled by default in Expo 54 |

## Project Structure

```
app/
  (tabs)/
    index.tsx       # Today screen
    feed.tsx        # Entries feed
    settings.tsx    # Settings
  pin/
    setup.tsx       # PIN creation modal
    verify.tsx      # PIN verification modal
  _layout.tsx       # Root layout, DB init

db/
  client.ts         # SQLite singleton + schema
  queries.ts        # All DB operations
  types.ts          # Entry type, mood helpers

store/
  entries.ts        # Entries state (Zustand)
  settings.ts       # App settings (persisted)
  auth.ts           # PIN / biometrics state

services/
  sentiment.ts      # Local mood scoring (Ru + En)
  notifications.ts  # Daily reminder scheduling

components/
  EntryCard.tsx     # Feed row
  OnThisDay.tsx     # Year-ago block
  MonthSeparator.tsx
  PinKeypad.tsx     # Animated 4-digit keypad
  MoodDot.tsx       # Color dot (green / gray / orange)
  ui/
    Text.tsx        # Typed text component
    Divider.tsx

constants/
  theme.ts          # Colors, fonts, spacing, radii

hooks/
  useTheme.ts       # Returns current theme colors
```

## Getting Started

```bash
pnpm install
```

**iOS simulator:**
```bash
pnpm ios
```

**Android emulator:**
```bash
pnpm android
```

**Type check:**
```bash
npx tsc --noEmit
```

Requires Xcode (iOS) or Android Studio (Android). For a physical device, use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) — expo-sqlite, expo-secure-store, and expo-local-authentication are native modules not supported in Expo Go.

## Design Principles

- **No shame** — the app never says "you missed a day"
- **No clutter** — serif font for entries, no emoji or decorative elements in UI
- **No red** — negative mood color is soft orange ("a hard day", not "a bad day")
- **No leaks** — private entries leave zero trace in the feed, widgets, or notifications
- **No subscription** — one-time purchase for premium; your diary shouldn't expire
