import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { type AppLanguage } from "@/store/settings";
import React from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SupportedLanguage {
  code: AppLanguage;
  label: string;
  native: string;
}

interface LanguagePickerModalProps {
  visible: boolean;
  activeLanguageCode: AppLanguage;
  languages: SupportedLanguage[];
  onSelect: (code: AppLanguage) => void;
  onClose: () => void;
}

export function LanguagePickerModal({
  visible,
  activeLanguageCode,
  languages,
  onSelect,
  onClose,
}: LanguagePickerModalProps) {
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
        <Text variant="label" secondary style={styles.sheetTitle}>
          {t("settings.language").toUpperCase()}
        </Text>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = item.code === activeLanguageCode;

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.langRow,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={() => onSelect(item.code)}
              >
                <View style={styles.langLabel}>
                  <Text variant="body" style={{ color: theme.text }}>
                    {item.native}
                  </Text>
                  <Text
                    variant="caption"
                    secondary
                    style={{ marginLeft: Spacing[2] }}
                  >
                    {item.label}
                  </Text>
                </View>
                {isActive && (
                  <Text variant="body" style={{ color: theme.tint }}>
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
    maxHeight: "70%",
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
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3] + 2,
    minHeight: 48,
  },
  langLabel: { flexDirection: "row", alignItems: "center" },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: Spacing[5] },
});
