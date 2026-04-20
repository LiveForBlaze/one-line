import { Text } from "@/components/ui/Text";
import { Spacing } from "@/constants/theme";
import { useDateLocale } from "@/hooks/useDateLocale";
import { useTheme } from "@/hooks/useTheme";
import { format, parseISO } from "date-fns";
import React from "react";
import { StyleSheet, View } from "react-native";

export function MonthSeparator({ dateStr }: { dateStr: string }) {
  const theme = useTheme();
  const locale = useDateLocale();
  const date = parseISO(dateStr);

  return (
    <View style={styles.container}>
      <Text type="label" variant="secondary" style={styles.label}>
        {(() => {
          const s = format(date, "LLLL yyyy", { locale });
          return s.charAt(0).toUpperCase() + s.slice(1);
        })()}
      </Text>
      <View style={[styles.rule, { backgroundColor: theme.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[3],
    gap: Spacing[2],
  },
  label: { letterSpacing: 0.6, fontWeight: "600" },
  rule: { height: StyleSheet.hairlineWidth },
});
