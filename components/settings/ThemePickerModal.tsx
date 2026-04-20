import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { type ThemeMode } from "@/store/settings";
import React from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ThemeOption {
  code: ThemeMode;
  label: string;
}

interface ThemePickerModalProps {
  visible: boolean;
  activeThemeMode: ThemeMode;
  options: ThemeOption[];
  onSelect: (mode: ThemeMode) => void;
  onClose: () => void;
}

export function ThemePickerModal({
  visible,
  activeThemeMode,
  options,
  onSelect,
  onClose,
}: ThemePickerModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useT();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.backdropBg} />
      </Pressable>

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.background,
            paddingBottom: insets.bottom + Spacing[4],
          },
        ]}
      >
        <View style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
        </View>
        <Text type="label" variant="secondary" style={styles.sheetTitle}>
          {t("settings.theme").toUpperCase()}
        </Text>
        <FlatList
          data={options}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = item.code === activeThemeMode;

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.optionRow,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={() => onSelect(item.code)}
              >
                <Text type="text">
                  {item.label}
                </Text>
                {isActive && (
                  <Text type="text" variant="accent">
                    ✓
                  </Text>
                )}
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => (
            <View
              style={[styles.separator, { backgroundColor: theme.border }]}
            />
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  backdropBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: "55%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    alignItems: "center",
    paddingTop: Spacing[3],
    paddingBottom: Spacing[1],
  },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  sheetTitle: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    letterSpacing: 0.6,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3] + 2,
    minHeight: 48,
  },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: Spacing[5] },
});
