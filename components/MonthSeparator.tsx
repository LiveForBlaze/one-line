import React from 'react';
import { View, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { useDateLocale } from '@/hooks/useDateLocale';
import { Spacing } from '@/constants/theme';

export function MonthSeparator({ dateStr }: { dateStr: string }) {
  const theme = useTheme();
  const locale = useDateLocale();
  const date = parseISO(dateStr);

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      <Text variant="label" secondary>
        {(() => { const s = format(date, 'LLLL yyyy', { locale }); return s.charAt(0).toUpperCase() + s.slice(1); })()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
