import { Fonts, FontSizes, FontWeights } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Text as RNText, StyleSheet, type TextProps } from "react-native";

type TextType =
  | "text"
  | "subheader"
  | "header"
  | "display"
  | "overline"
  | "action"
  | "body"
  | "entry"
  | "caption"
  | "label"
  | "heading"
  | "date"
  | "title";

type TextColorVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "positive"
  | "challenging";

type LegacyOrColorVariant = TextType | TextColorVariant;

interface Props extends TextProps {
  type?: TextType;
  variant?: LegacyOrColorVariant;
  color?: string;
  secondary?: boolean;
  tertiary?: boolean;
}

export function Text({
  type,
  variant,
  color,
  secondary,
  tertiary,
  style,
  ...props
}: Props) {
  const theme = useTheme();
  const resolvedType = getResolvedType(
    type ?? (variant && isTextType(variant) ? variant : "body"),
  );
  const resolvedColor = getTextColor({
    color,
    variant,
    secondary,
    tertiary,
    theme,
  });

  return (
    <RNText
      style={[
        styles[resolvedType],
        {
          color: resolvedColor,
          fontFamily: Fonts.sans,
        },
        style,
      ]}
      {...props}
    />
  );
}

function getResolvedType(type: TextType) {
  if (type === "body") return "text";
  if (type === "heading") return "subheader";
  if (type === "title") return "header";
  return type;
}

function isTextType(value: LegacyOrColorVariant): value is TextType {
  return [
    "text",
    "subheader",
    "header",
    "display",
    "overline",
    "action",
    "body",
    "entry",
    "caption",
    "label",
    "heading",
    "date",
    "title",
  ].includes(value);
}

function getTextColor({
  color,
  variant,
  secondary,
  tertiary,
  theme,
}: {
  color?: string;
  variant?: LegacyOrColorVariant;
  secondary?: boolean;
  tertiary?: boolean;
  theme: ReturnType<typeof useTheme>;
}) {
  if (color) return color;

  if (variant === "secondary" || secondary) return theme.textSecondary;
  if (variant === "tertiary" || tertiary) return theme.textTertiary;
  if (variant === "accent") return theme.tint;
  if (variant === "positive") return theme.positive;
  if (variant === "challenging") return theme.challenging;

  return theme.text;
}

const styles = StyleSheet.create({
  text: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.regular,
    lineHeight: 22,
  },
  subheader: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  header: {
    fontSize: FontSizes["2xl"],
    fontWeight: FontWeights.bold,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  display: {
    fontSize: FontSizes["3xl"],
    fontWeight: FontWeights.regular,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  overline: {
    fontSize: 10,
    fontWeight: FontWeights.semibold,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  action: {
    fontSize: 16,
    fontWeight: FontWeights.semibold,
    lineHeight: 20,
    letterSpacing: 0.1,
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
  date: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
