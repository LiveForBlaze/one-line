import { Divider } from "@/components/ui/Divider";
import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";

import { SettingsRow, SettingsSection } from "./SettingsSection";

interface PrivacySectionProps {
  hasPin: boolean;
  isPrivateModeOn: boolean;
  hasBiometrics: boolean;
  biometricsEnabled: boolean;
  onSetupPrivateMode: () => void;
  onEnterPrivateMode: () => void;
  onExitPrivateMode: () => void;
  onToggleBiometrics: (value: boolean) => void;
  onChangePin: () => void;
  onRegenerateRecoveryKey: () => void;
}

export function PrivacySection({
  hasPin,
  isPrivateModeOn,
  hasBiometrics,
  biometricsEnabled,
  onSetupPrivateMode,
  onEnterPrivateMode,
  onExitPrivateMode,
  onToggleBiometrics,
  onChangePin,
  onRegenerateRecoveryKey,
}: PrivacySectionProps) {
  const { t } = useT();
  const theme = useTheme();
  const [showAdvancedPrivacy, setShowAdvancedPrivacy] = useState(false);

  useEffect(() => {
    if (!hasPin || !isPrivateModeOn) {
      setShowAdvancedPrivacy(false);
    }
  }, [hasPin, isPrivateModeOn]);

  return (
    <SettingsSection title={t("settings.privacy")}>
      {!hasPin ? (
        <SettingsRow
          label={t("settings.setupPrivateMode")}
          subtitle={t("settings.setupPrivateModeHint")}
          onPress={onSetupPrivateMode}
        />
      ) : !isPrivateModeOn ? (
        <SettingsRow
          label={t("settings.enterPrivateMode")}
          onPress={onEnterPrivateMode}
        />
      ) : (
        <>
          <SettingsRow
            label={t("settings.exitPrivateMode")}
            onPress={onExitPrivateMode}
          />
          {hasBiometrics && (
            <>
              <Divider inset={Spacing[4]} />
              <SettingsRow
                label={t("settings.useBiometrics")}
                right={
                  <Switch
                    value={biometricsEnabled}
                    onValueChange={onToggleBiometrics}
                    trackColor={{
                      false: theme.border,
                      true: theme.tintBackground,
                    }}
                    thumbColor={
                      biometricsEnabled ? theme.tint : theme.textTertiary
                    }
                    ios_backgroundColor={theme.border}
                  />
                }
              />
            </>
          )}
          <Divider inset={Spacing[4]} />
          <Pressable
            style={({ pressed }) => [
              styles.advancedToggle,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => setShowAdvancedPrivacy((value) => !value)}
          >
            <View style={styles.rowLabel}>
              <Text variant="label" secondary>
                {t("settings.advancedPrivacy")}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Ionicons
                name={showAdvancedPrivacy ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.textSecondary}
              />
            </View>
          </Pressable>
          {showAdvancedPrivacy && (
            <View
              style={[
                styles.advancedPanel,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <SettingsRow
                label={t("settings.changePIN")}
                onPress={onChangePin}
              />
              <View
                style={[
                  styles.advancedDivider,
                  { backgroundColor: theme.border },
                ]}
              />
              <SettingsRow
                label={t("settings.regenerateRecoveryKey")}
                onPress={onRegenerateRecoveryKey}
              />
            </View>
          )}
        </>
      )}
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  rowLabel: { flex: 1 },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    flexShrink: 0,
  },
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3] + 2,
    minHeight: 44,
    gap: Spacing[2],
  },
  advancedPanel: {
    marginHorizontal: Spacing[3],
    marginTop: Spacing[1],
    marginBottom: Spacing[3],
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  advancedDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing[4],
  },
});
