import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { moodLabel, normalizeMoodScore } from '@/db/types';

interface Props {
  score: number | null;
  size?: number;
}

export function MoodDot({ score, size = 8 }: Props) {
  const theme = useTheme();
  const label = moodLabel(score);
  const normalized = normalizeMoodScore(score);

  const color =
    label === 'positive'
      ? normalized === 3
        ? theme.positive
        : theme.tint
      : label === 'challenging'
        ? theme.challenging
        : theme.neutral;

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {},
});
