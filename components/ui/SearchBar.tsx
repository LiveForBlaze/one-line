import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onBlur?: () => void;
  blurKey?: number;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  onBlur,
  blurKey,
}: SearchBarProps) {
  const theme = useTheme();
  const { t } = useT();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (blurKey === undefined) return;
    inputRef.current?.blur();
  }, [blurKey]);

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.wrap,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.textTertiary} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={t("feed.search")}
          placeholderTextColor={theme.textTertiary}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>
      {value.length > 0 && (
        <Pressable onPress={onClear} style={styles.cancelBtn}>
          <Text type="label" variant="accent">
            {t("feed.cancel")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  wrap: {
    flex: 1,
    height: 44,
    borderRadius: Radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing[3],
    gap: Spacing[2],
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  cancelBtn: { paddingVertical: Spacing[1] },
});
