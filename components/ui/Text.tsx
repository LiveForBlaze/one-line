import React from 'react';
import { Text as RNText, type TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Fonts, FontSizes, FontWeights } from '@/constants/theme';

interface Props extends TextProps {
  variant?: 'body' | 'entry' | 'caption' | 'label' | 'heading' | 'date' | 'title';
  color?: string;
  secondary?: boolean;
  tertiary?: boolean;
}

export function Text({ variant = 'body', color, secondary, tertiary, style, ...props }: Props) {
  const theme = useTheme();

  const textColor = color ?? (tertiary ? theme.textTertiary : secondary ? theme.textSecondary : theme.text);

  return (
    <RNText
      style={[styles[variant], { color: textColor, fontFamily: variant === 'entry' ? Fonts.serif : Fonts.sans }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.regular,
    lineHeight: 22,
  },
  entry: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.regular,
    lineHeight: 26,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.regular,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  heading: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  date: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
});
