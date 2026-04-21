import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";

export function AccentLine() {
  const theme = useTheme();
  return <View style={[styles.line, { backgroundColor: theme.tint }]} />;
}

const styles = StyleSheet.create({
  line: {
    width: 40,
    height: 3,
    borderRadius: 999,
    marginTop: 6,
  },
});
