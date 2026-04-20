import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Text } from '@/components/ui/Text';
import { MoodDot } from '@/components/MoodDot';
import { useTheme } from '@/hooks/useTheme';
import { useDateLocale } from '@/hooks/useDateLocale';
import { Fonts, FontSizes, Spacing } from '@/constants/theme';
import type { Entry } from '@/db/types';

interface Props {
  entry: Entry;
  isPrivateModeOn: boolean;
  onPress?: () => void;
}

export function EntryCard({ entry, isPrivateModeOn, onPress }: Props) {
  const theme = useTheme();
  const locale = useDateLocale();
  const isPrivate = entry.kind === 'private';
  const date = parseISO(entry.date);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isPrivate && { backgroundColor: theme.surfaceElevated },
        { opacity: pressed && onPress ? 0.6 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Date column */}
      <View style={styles.dateCol}>
        <Text style={[styles.dayNum, { color: isPrivate ? theme.textSecondary : theme.tint, fontFamily: Fonts.serif }]}>
          {format(date, 'd', { locale })}
        </Text>
        <Text style={[styles.weekday, { color: theme.textTertiary }]}>
          {format(date, 'EEE', { locale }).toUpperCase()}
        </Text>
      </View>

      {/* Thin divider */}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* Text */}
      <View style={styles.content}>
        {entry.text ? (
          <Text
            style={[styles.entryText, { color: isPrivate ? theme.textSecondary : theme.text, fontFamily: Fonts.serif }]}
            numberOfLines={2}
          >
            {entry.text}
          </Text>
        ) : (
          <Text style={[styles.entryText, { color: theme.textTertiary }]}>—</Text>
        )}
      </View>

      {/* Mood (common entries only) */}
      {!isPrivate && entry.mood_score !== null && (
        <View style={styles.moodCol}>
          <MoodDot score={entry.mood_score} size={7} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3] + 2,
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
    minHeight: 52,
  },
  dateCol: { width: 30, alignItems: 'center' },
  dayNum: { fontSize: 19, lineHeight: 22, fontWeight: '400' },
  weekday: { fontSize: 9, fontWeight: '600', letterSpacing: 0.8, marginTop: 1 },
  divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginVertical: 2 },
  content: { flex: 1 },
  entryText: { fontSize: FontSizes.base, lineHeight: 22 },
  moodCol: { alignItems: 'center', justifyContent: 'center', width: 14 },
});
