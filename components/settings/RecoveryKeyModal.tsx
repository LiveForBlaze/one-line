import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface RecoveryKeyModalProps {
  visible?: boolean;
  recoveryKey: string;
  copied: boolean;
  title: string;
  subtitle: string;
  actionLabel: string;
  onCopy: () => void;
  onAction: () => void;
  onClose?: () => void;
  useModal?: boolean;
  showHandle?: boolean;
  topInset?: number;
  bottomInset?: number;
}

export function RecoveryKeyModal({
  visible,
  recoveryKey,
  copied,
  title,
  subtitle,
  actionLabel,
  onCopy,
  onAction,
  onClose,
  useModal = true,
  showHandle = true,
  topInset,
  bottomInset,
}: RecoveryKeyModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useT();

  const resolvedTopInset = topInset ?? insets.top;
  const resolvedBottomInset = bottomInset ?? insets.bottom;

  const content = (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {showHandle && (
        <View style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
        </View>
      )}

      <View
        style={[
          styles.inner,
          {
            paddingTop: resolvedTopInset + Spacing[2],
            paddingBottom: resolvedBottomInset + Spacing[6],
          },
        ]}
      >
        <View style={styles.header}>
          <Text type="subheader" style={styles.title}>
            {title}
          </Text>
          <Text type="text" variant="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>

        <View
          style={[styles.keyCard, { backgroundColor: theme.surfaceElevated }]}
        >
          <Text type="overline" variant="tertiary" style={styles.keyLabel}>
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
                <Text type="label" style={{ color: theme.text, letterSpacing: 4 }}>
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
                backgroundColor: copied ? theme.tintBackground : theme.surface,
                borderColor: copied ? theme.tint : theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text type="label" variant={copied ? "accent" : "secondary"}>
              {copied ? t("pin.copied") : t("pin.copy")}
            </Text>
          </Pressable>
        </View>

        <Text type="caption" variant="secondary" style={styles.warning}>
          {t("pin.recoveryWarning")}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.doneButton,
            { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={onAction}
        >
          <Text type="action" style={[styles.doneButtonText, { color: "#fff" }]}>
            {actionLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  if (!useModal) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose ?? onAction}
    >
      {content}
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
  doneButtonText: {},
});
