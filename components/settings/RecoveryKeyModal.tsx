import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { splitRecoveryPhrase } from "../../utils/recovery-phrase";

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
  const phraseWords = splitRecoveryPhrase(recoveryKey);

  const resolvedTopInset = topInset ?? insets.top;
  const resolvedBottomInset = bottomInset ?? insets.bottom;
  const phraseRows = Array.from(
    { length: Math.ceil(phraseWords.length / 2) },
    (_, rowIndex) => phraseWords.slice(rowIndex * 2, rowIndex * 2 + 2),
  );

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
        <View style={styles.contentTop}>
          <View style={styles.contentCenter}>
            <View style={styles.header}>
              <Text type="subheader" style={styles.title}>
                {title}
              </Text>
              <Text type="text" variant="secondary" style={styles.subtitle}>
                {subtitle}
              </Text>
            </View>

            <View
              style={[
                styles.keyCard,
                { backgroundColor: theme.surfaceElevated },
              ]}
            >
              <Text type="overline" variant="tertiary" style={styles.keyLabel}>
                {t("pin.recoveryKeyLabel")}
              </Text>

              <View style={styles.keyGrid}>
                {phraseRows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.keyGridRow}>
                    {row.map((word, columnIndex) => {
                      const wordIndex = rowIndex * 2 + columnIndex;

                      return (
                        <View
                          key={`${word}-${wordIndex}`}
                          style={[
                            styles.keyItem,
                            {
                              backgroundColor: theme.background,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.keyIndex,
                              {
                                backgroundColor: theme.surface,
                                borderColor: theme.border,
                              },
                            ]}
                          >
                            <Text type="caption" variant="secondary">
                              {wordIndex + 1}
                            </Text>
                          </View>
                          <Text
                            type="text"
                            style={{ color: theme.text }}
                            numberOfLines={1}
                          >
                            {word}
                          </Text>
                        </View>
                      );
                    })}
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
                <Text type="label" variant={copied ? "accent" : "secondary"}>
                  {copied ? t("pin.copied") : t("pin.copy")}
                </Text>
              </Pressable>
            </View>

            <Text type="caption" variant="secondary" style={styles.warning}>
              {t("pin.recoveryWarning")}
            </Text>
          </View>
        </View>

        <View style={styles.contentBottom}>
          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={onAction}
          >
            <Text
              type="action"
              style={[styles.doneButtonText, { color: "#fff" }]}
            >
              {actionLabel}
            </Text>
          </Pressable>
        </View>
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
  },
  contentTop: {
    flex: 1,
    justifyContent: "center",
  },
  contentCenter: {
    gap: Spacing[5],
  },
  contentBottom: {
    paddingTop: Spacing[4],
  },
  header: { alignItems: "center", gap: Spacing[2], paddingTop: Spacing[4] },
  title: { textAlign: "center" },
  subtitle: { textAlign: "center", lineHeight: 22 },
  keyCard: {
    borderRadius: Radii.xl,
    padding: Spacing[4],
    gap: Spacing[3],
    alignItems: "center",
  },
  keyLabel: {},
  keyGrid: {
    width: "100%",
    gap: Spacing[2],
  },
  keyGridRow: {
    flexDirection: "row",
    gap: Spacing[2],
  },
  keyItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2] + 2,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  keyIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
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
  },
  doneButtonText: {},
});
