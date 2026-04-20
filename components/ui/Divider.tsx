import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export function Divider({ inset = 0 }: { inset?: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.divider, { backgroundColor: theme.border, marginLeft: inset }]} />
  );
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth },
});
