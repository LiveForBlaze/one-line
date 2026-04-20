import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface RecoveryKeyModalProps {
  visible: boolean;
  recoveryKey: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}

export function RecoveryKeyModal({
  visible,
  recoveryKey,
  copied,
  onCopy,
  onClose,
}: RecoveryKeyModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useT();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
        </View>

        <View
          style={[
            styles.inner,
            {
              paddingTop: insets.top + Spacing[2],
              paddingBottom: insets.bottom + Spacing[6],
            },
          ]}
        >
          <View style={styles.header}>
            <Text variant="heading" style={styles.title}>
              {t("settings.newRecoveryKey")}
            </Text>
            <Text variant="body" secondary style={styles.subtitle}>
              {t("settings.newRecoveryKeyMessage")}
            </Text>
          </View>

          <View
            style={[styles.keyCard, { backgroundColor: theme.surfaceElevated }]}
          >
            <Text
              variant="caption"
              style={[styles.keyLabel, { color: theme.textTertiary }]}
            >
              {t("pin.recoveryKeyLabel")}
            </Text>

            <View style={styles.keyGrid}>
              {recoveryKey.split("-").map((group, index) => (
                <View
                  key={index}
                  style={[
                    styles.keyGroup,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: theme.text, letterSpacing: 4 }}>
                    {group}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={onCopy}
              style={({ pressed }) => [
                styles.copyButton,
                {
                  backgroundColor: copied
                    ? theme.tintBackground
                    : theme.surface,
                  borderColor: copied ? theme.tint : theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                variant="label"
                style={{ color: copied ? theme.tint : theme.textSecondary }}
              >
                {copied ? t("pin.copied") : t("pin.copy")}
              </Text>
            </Pressable>
          </View>

          <Text variant="caption" secondary style={styles.warning}>
            {t("pin.recoveryWarning")}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.doneButtonText, { color: "#fff" }]}>
              {t("pin.recoverySaved")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: {
    alignItems: "center",
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
  },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    gap: Spacing[5],
  },
  header: { alignItems: "center", gap: Spacing[2], paddingTop: Spacing[4] },
  title: { textAlign: "center" },
  subtitle: { textAlign: "center", lineHeight: 22 },
  keyCard: {
    borderRadius: Radii.xl,
    padding: Spacing[5],
    gap: Spacing[4],
    alignItems: "center",
  },
  keyLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  keyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing[2],
    justifyContent: "center",
  },
  keyGroup: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: "44%",
    alignItems: "center",
  },
  copyButton: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[2] + 1,
    borderRadius: Radii.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  warning: {
    textAlign: "center",
    lineHeight: 20,
  },
  doneButton: {
    paddingVertical: Spacing[4],
    borderRadius: Radii.xl,
    alignItems: "center",
    marginTop: "auto",
  },
  doneButtonText: { fontSize: 16, fontWeight: "600" },
});
