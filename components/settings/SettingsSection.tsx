import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface SettingsRowProps {
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text
        variant="caption"
        secondary
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        {title.toUpperCase()}
      </Text>
      <View
        style={[
          styles.sectionBody,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function SettingsRow({
  label,
  subtitle,
  value,
  onPress,
  right,
  destructive,
}: SettingsRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed && onPress ? 0.6 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.rowLabel}>
        <Text
          variant="body"
          style={{ color: destructive ? theme.challenging : theme.text }}
        >
          {label}
        </Text>
        {subtitle && (
          <Text variant="caption" secondary style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.rowRight}>
        {value && (
          <Text variant="body" secondary>
            {value}
          </Text>
        )}
        {right}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: Spacing[4], gap: Spacing[2] },
  sectionTitle: {
    paddingHorizontal: Spacing[2],
    letterSpacing: 1,
    marginBottom: Spacing[1],
  },
  sectionBody: {
    borderRadius: Radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4] + 1,
    minHeight: 56,
    gap: Spacing[2],
  },
  rowLabel: { flex: 1, gap: 2 },
  rowSubtitle: { marginTop: 1 },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    flexShrink: 0,
  },
});
