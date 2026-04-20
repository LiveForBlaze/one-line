import { MoodDot } from "@/components/MoodDot";
import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import type { Entry } from "@/db/types";
import { useDateLocale } from "@/hooks/useDateLocale";
import { useTheme } from "@/hooks/useTheme";
import { format, parseISO } from "date-fns";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface Props {
  entry: Entry;
  isPrivateModeOn: boolean;
  onPress?: () => void;
}

export function EntryCard({ entry, isPrivateModeOn, onPress }: Props) {
  const theme = useTheme();
  const locale = useDateLocale();
  const isPrivate = entry.kind === "private";
  const date = parseISO(entry.date);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isPrivate ? theme.surfaceElevated : theme.surface,
          borderColor: theme.border,
          opacity: pressed && onPress ? 0.72 : 1,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Date column */}
      <View style={styles.dateCol}>
        <Text
          type="subheader"
          variant={isPrivate ? "secondary" : "accent"}
          style={styles.dayNum}
        >
          {format(date, "d", { locale })}
        </Text>
        <Text type="caption" variant="tertiary" style={styles.weekday}>
          {format(date, "EEE", { locale }).toUpperCase()}
        </Text>
      </View>

      {/* Thin divider */}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* Text */}
      <View style={styles.content}>
        {entry.text ? (
          <Text
            type="text"
            variant={isPrivate ? "secondary" : "primary"}
            style={styles.entryText}
            numberOfLines={2}
          >
            {entry.text}
          </Text>
        ) : (
          <Text type="text" variant="tertiary" style={styles.entryText}>
            —
          </Text>
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
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing[3] + 2,
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
    minHeight: 68,
  },
  dateCol: { width: 30, alignItems: "center" },
  dayNum: { fontSize: 24, lineHeight: 26, fontWeight: "300" },
  weekday: { fontSize: 9, fontWeight: "600", letterSpacing: 0.8, marginTop: 1 },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    marginVertical: 2,
  },
  content: { flex: 1 },
  entryText: { lineHeight: 24 },
  moodCol: { alignItems: "center", justifyContent: "center", width: 14 },
});
