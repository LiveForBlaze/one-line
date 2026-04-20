import React from 'react';
import { View, StyleSheet } from 'react-native';
import { differenceInYears, parseISO } from 'date-fns';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Radii, Fonts } from '@/constants/theme';
import { useT } from '@/hooks/useT';
import type { Entry } from '@/db/types';

interface Props {
  entries: Entry[];
  isPrivateModeOn: boolean;
}

export function OnThisDay({ entries, isPrivateModeOn }: Props) {
  const theme = useTheme();
  const { t } = useT();

  // Only show common entries unless private mode is on
  const visible = isPrivateModeOn ? entries : entries.filter((e) => e.kind === 'common');
  if (visible.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceElevated }]}>
      <View style={[styles.accentBar, { backgroundColor: theme.tint }]} />
      <View style={styles.inner}>
        <Text style={[styles.headerLabel, { color: theme.textTertiary }]}>
          {t('onThisDay.label')}
        </Text>
        {visible.map((entry) => {
          const yearsAgo = differenceInYears(new Date(), parseISO(entry.date));
          const isPrivate = entry.kind === 'private';

          return (
            <View key={`${entry.date}-${entry.kind}`} style={styles.item}>
              <Text style={[styles.yearsLabel, { color: isPrivate ? theme.textTertiary : theme.tint }]}>
                {yearsAgo === 1 ? t('onThisDay.yearAgo') : t('onThisDay.yearsAgo', { count: yearsAgo })}
              </Text>
              <Text
                style={[styles.entryText, { color: isPrivate ? theme.textSecondary : theme.text, fontFamily: Fonts.serif }]}
                numberOfLines={3}
              >
                {entry.text || '—'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing[7],
    borderRadius: Radii.xl,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: { width: 3 },
  inner: { flex: 1, padding: Spacing[4], gap: Spacing[1] },
  headerLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    marginBottom: Spacing[2],
  },
  item: { marginBottom: Spacing[3] },
  yearsLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 3 },
  entryText: { fontSize: 15, lineHeight: 22 },
});
