import { Fonts, FontSizes } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from "react-native";

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
    fontFamily: Fonts.sansRegular,
    lineHeight: 22,
  },
  subheader: {
    fontSize: 25,
    fontFamily: Fonts.serifSemibold,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  header: {
    fontSize: 31,
    fontFamily: Fonts.serifBold,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  display: {
    fontSize: 38,
    fontFamily: Fonts.serifMedium,
    lineHeight: 42,
    letterSpacing: -1.4,
  },
  overline: {
    fontSize: 11,
    fontFamily: Fonts.sansSemibold,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  action: {
    fontSize: 16,
    fontFamily: Fonts.sansSemibold,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  entry: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.sansRegular,
    lineHeight: 30,
    letterSpacing: 0.15,
  },
  caption: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.sansMedium,
    lineHeight: 16,
    letterSpacing: 0.15,
  },
  label: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.sansSemibold,
    lineHeight: 18,
    letterSpacing: 0.05,
  },
  date: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.serifMedium,
    lineHeight: 18,
    letterSpacing: 0.35,
    textTransform: "uppercase",
  },
} satisfies Record<string, TextStyle>);
