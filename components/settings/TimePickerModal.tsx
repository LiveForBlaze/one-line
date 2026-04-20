import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HOURS = Array.from({ length: 24 }, (_, value) => value);
const MINUTES = Array.from({ length: 60 }, (_, value) => value);

interface TimePickerModalProps {
  visible: boolean;
  draftHour: number;
  draftMinute: number;
  onChangeHour: (hour: number) => void;
  onChangeMinute: (minute: number) => void;
  onSave: () => void;
  onClose: () => void;
}

export function TimePickerModal({
  visible,
  draftHour,
  draftMinute,
  onChangeHour,
  onChangeMinute,
  onSave,
  onClose,
}: TimePickerModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useT();

  const draftTimeLabel = `${String(draftHour).padStart(2, "0")}:${String(
    draftMinute,
  ).padStart(2, "0")}`;

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

        <View style={styles.headerRow}>
          <Pressable onPress={onClose}>
            <Text type="label" variant="secondary">
              {t("auth.cancel")}
            </Text>
          </Pressable>
          <Text type="label" variant="secondary" style={styles.sheetTitle}>
            {t("settings.reminderTime").toUpperCase()}
          </Text>
          <Pressable onPress={onSave}>
            <Text type="label" variant="accent">
              {t("settings.done")}
            </Text>
          </Pressable>
        </View>

        <Text type="header" style={styles.timeValue}>
          {draftTimeLabel}
        </Text>

        <View style={styles.pickerRow}>
          <View
            style={[
              styles.column,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text type="caption" variant="secondary" style={styles.columnTitle}>
              {t("settings.hours")}
            </Text>
            <FlatList
              data={HOURS}
              keyExtractor={(item) => `hour-${item}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = item === draftHour;

                return (
                  <Pressable
                    onPress={() => onChangeHour(item)}
                    style={[
                      styles.option,
                      selected && { backgroundColor: theme.tintBackground },
                    ]}
                  >
                    <Text type="text" variant={selected ? "accent" : "primary"}>
                      {String(item).padStart(2, "0")}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>

          <View
            style={[
              styles.column,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text type="caption" variant="secondary" style={styles.columnTitle}>
              {t("settings.minutes")}
            </Text>
            <FlatList
              data={MINUTES}
              keyExtractor={(item) => `minute-${item}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = item === draftMinute;

                return (
                  <Pressable
                    onPress={() => onChangeMinute(item)}
                    style={[
                      styles.option,
                      selected && { backgroundColor: theme.tintBackground },
                    ]}
                  >
                    <Text type="text" variant={selected ? "accent" : "primary"}>
                      {String(item).padStart(2, "0")}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
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
    maxHeight: "78%",
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
  },
  sheetTitle: { letterSpacing: 0.6 },
  timeValue: {
    textAlign: "center",
    marginBottom: Spacing[4],
  },
  pickerRow: {
    flexDirection: "row",
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  column: {
    flex: 1,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing[2],
    maxHeight: 320,
  },
  columnTitle: {
    textAlign: "center",
    letterSpacing: 0.6,
    marginBottom: Spacing[2],
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.md,
    marginHorizontal: Spacing[2],
    marginVertical: 2,
    minHeight: 40,
  },
});
