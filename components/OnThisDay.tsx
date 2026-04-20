import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import type { Entry } from "@/db/types";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { differenceInYears, parseISO } from "date-fns";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  entries: Entry[];
  isPrivateModeOn: boolean;
}

export function OnThisDay({ entries, isPrivateModeOn }: Props) {
  const theme = useTheme();
  const { t } = useT();

  // Only show common entries unless private mode is on
  const visible = isPrivateModeOn
    ? entries
    : entries.filter((e) => e.kind === "common");
  if (visible.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: theme.tint }]} />
      <View style={styles.inner}>
        <Text type="caption" variant="tertiary" style={styles.headerLabel}>
          {t("onThisDay.label")}
        </Text>
        {visible.map((entry) => {
          const yearsAgo = differenceInYears(new Date(), parseISO(entry.date));
          const isPrivate = entry.kind === "private";

          return (
            <View key={`${entry.date}-${entry.kind}`} style={styles.item}>
              <Text
                type="label"
                variant={isPrivate ? "tertiary" : "accent"}
                style={styles.yearsLabel}
              >
                {yearsAgo === 1
                  ? t("onThisDay.yearAgo")
                  : t("onThisDay.yearsAgo", { count: yearsAgo })}
              </Text>
              <Text
                type="text"
                variant={isPrivate ? "secondary" : "primary"}
                style={styles.entryText}
                numberOfLines={3}
              >
                {entry.text || "—"}
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
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  accentBar: { width: 3 },
  inner: { flex: 1, padding: Spacing[5], gap: Spacing[1] },
  headerLabel: {
    letterSpacing: 1.4,
    marginBottom: Spacing[3],
  },
  item: { marginBottom: Spacing[4] },
  yearsLabel: { marginBottom: 4 },
  entryText: {},
});
