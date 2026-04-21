import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";

export function AccentLine() {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.segment1, { backgroundColor: theme.tint }]} />
      <View style={[styles.segment2, { backgroundColor: theme.tint2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 3,
  },
  segment1: { width: 28, height: 3, borderRadius: 999 },
  segment2: { width: 12, height: 3, borderRadius: 999 },
});
