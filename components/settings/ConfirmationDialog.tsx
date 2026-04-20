import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmationDialogProps) {
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
        style={[styles.centered, { paddingBottom: insets.bottom + Spacing[4] }]}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.dialog,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <Text type="subheader" style={styles.dialogTitle}>
            {title}
          </Text>
          <Text type="text" variant="secondary" style={styles.dialogMessage}>
            {message}
          </Text>
          <View style={styles.actionStack}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={onConfirm}
            >
              <Text
                type="action"
                style={[styles.primaryButtonText, { color: "#fff" }]}
              >
                {confirmLabel}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  backgroundColor: theme.surfaceElevated,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={onClose}
            >
              <Text type="label">{t("auth.cancel")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  backdropBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  centered: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing[6],
  },
  dialog: {
    width: "100%",
    borderRadius: Radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing[6],
  },
  dialogTitle: {
    textAlign: "center",
    marginBottom: Spacing[2],
  },
  dialogMessage: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing[5],
  },
  actionStack: {
    gap: Spacing[3],
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: Radii.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: Radii.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {},
});
