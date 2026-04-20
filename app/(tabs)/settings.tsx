import { PinGate } from "@/components/PinGate";
import { ConfirmationDialog } from "@/components/settings/ConfirmationDialog";
import { LanguagePickerModal } from "@/components/settings/LanguagePickerModal";
import { PrivacySection } from "@/components/settings/PrivacySection";
import { RecoveryKeyModal } from "@/components/settings/RecoveryKeyModal";
import {
  SettingsRow,
  SettingsSection,
} from "@/components/settings/SettingsSection";
import { ThemePickerModal } from "@/components/settings/ThemePickerModal";
import { TimePickerModal } from "@/components/settings/TimePickerModal";
import { Divider } from "@/components/ui/Divider";
import { Text } from "@/components/ui/Text";
import { Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { i18n } from "@/i18n";
import {
  cancelDailyReminder,
  requestPermissions,
  scheduleDailyReminder,
} from "@/services/notifications";
import { useAuthStore } from "@/store/auth";
import {
  useSettingsStore,
  type AppLanguage,
  type ThemeMode,
} from "@/store/settings";
import * as LocalAuthentication from "expo-local-authentication";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Clipboard, ScrollView, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SUPPORTED_LANGUAGES: {
  code: AppLanguage;
  label: string;
  native: string;
}[] = [
  { code: "en", label: "English", native: "English" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "de", label: "German", native: "Deutsch" },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useT();
  const router = useRouter();
  const settings = useSettingsStore();
  const auth = useAuthStore();
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [showUnlockGate, setShowUnlockGate] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRegenerateConfirmModal, setShowRegenerateConfirmModal] =
    useState(false);
  const [newRecoveryKey, setNewRecoveryKey] = useState("");
  const [showRecoveryKeyModal, setShowRecoveryKeyModal] = useState(false);
  const [recoveryKeyCopied, setRecoveryKeyCopied] = useState(false);
  const [draftHour, setDraftHour] = useState(settings.notificationHour);
  const [draftMinute, setDraftMinute] = useState(settings.notificationMinute);

  const { isPrivateModeOn } = auth;

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setHasBiometrics);
  }, []);

  useFocusEffect(
    useCallback(() => {
      auth.hasPrivatePin().then(setHasPin);
    }, [auth]),
  );

  const handleNotificationsToggle = useCallback(
    async (val: boolean) => {
      settings.setNotificationsEnabled(val);
      if (val) {
        const granted = await requestPermissions();
        if (granted) {
          await scheduleDailyReminder(
            settings.notificationHour,
            settings.notificationMinute,
          );
        } else {
          settings.setNotificationsEnabled(false);
        }
      } else {
        await cancelDailyReminder();
      }
    },
    [settings],
  );

  const handleBiometricsToggle = useCallback(
    async (val: boolean) => {
      if (val) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: t("settings.confirmBiometrics"),
          disableDeviceFallback: true,
          cancelLabel: t("auth.cancel"),
        });
        if (result.success) settings.setBiometricsEnabled(true);
      } else {
        settings.setBiometricsEnabled(false);
      }
    },
    [settings, t],
  );

  const handleRegenerateRecoveryKey = useCallback(() => {
    setShowRegenerateConfirmModal(true);
  }, []);

  const confirmRegenerateRecoveryKey = useCallback(async () => {
    const newKey = await auth.regenerateRecoveryKey();
    setShowRegenerateConfirmModal(false);
    setRecoveryKeyCopied(false);
    setNewRecoveryKey(newKey);
    setShowRecoveryKeyModal(true);
  }, [auth]);

  const handleCopyRecoveryKey = useCallback(() => {
    Clipboard.setString(newRecoveryKey);
    setRecoveryKeyCopied(true);
    setTimeout(() => setRecoveryKeyCopied(false), 2000);
  }, [newRecoveryKey]);

  const activeLangCode = settings.language ?? i18n.language ?? "en";
  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === activeLangCode) ??
    SUPPORTED_LANGUAGES[0];
  const currentLangLabel = currentLang.native;
  const themeOptions: { code: ThemeMode; label: string }[] = [
    { code: "system", label: t("settings.themeSystem") },
    { code: "light", label: t("settings.themeLight") },
    { code: "dark", label: t("settings.themeDark") },
  ];
  const currentThemeLabel =
    themeOptions.find((option) => option.code === settings.themeMode)?.label ??
    themeOptions[0].label;

  const handleLanguageSelect = useCallback(
    (code: AppLanguage) => {
      settings.setLanguage(code);
      i18n.changeLanguage(code);
      setShowLangPicker(false);
    },
    [settings],
  );

  const handleThemeSelect = useCallback(
    (mode: ThemeMode) => {
      settings.setThemeMode(mode);
      setShowThemePicker(false);
    },
    [settings],
  );

  const openTimePicker = useCallback(() => {
    setDraftHour(settings.notificationHour);
    setDraftMinute(settings.notificationMinute);
    setShowTimePicker(true);
  }, [settings.notificationHour, settings.notificationMinute]);

  const handleTimeSave = useCallback(async () => {
    settings.setNotificationTime(draftHour, draftMinute);
    setShowTimePicker(false);

    if (settings.notificationsEnabled) {
      await scheduleDailyReminder(draftHour, draftMinute);
    }
  }, [draftHour, draftMinute, settings]);

  const notificationTimeLabel = `${String(settings.notificationHour).padStart(2, "0")}:${String(settings.notificationMinute).padStart(2, "0")}`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing[4] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageHeader}>
        <Text variant="header">{t("settings.title")}</Text>
      </View>

      <SettingsSection title={t("settings.reminders")}>
        <SettingsRow
          label={t("settings.dailyReminder")}
          right={
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: theme.border, true: theme.tintBackground }}
              thumbColor={
                settings.notificationsEnabled ? theme.tint : theme.textTertiary
              }
              ios_backgroundColor={theme.border}
            />
          }
        />
        {settings.notificationsEnabled && (
          <>
            <Divider inset={Spacing[4]} />
            <SettingsRow
              label={t("settings.reminderTime")}
              value={notificationTimeLabel}
              onPress={openTimePicker}
            />
          </>
        )}
      </SettingsSection>

      <PrivacySection
        hasPin={hasPin}
        isPrivateModeOn={isPrivateModeOn}
        hasBiometrics={hasBiometrics}
        biometricsEnabled={settings.biometricsEnabled}
        onSetupPrivateMode={() => {
          router.push("/pin/setup");
          setTimeout(() => auth.hasPrivatePin().then(setHasPin), 500);
        }}
        onEnterPrivateMode={() => setShowUnlockGate(true)}
        onExitPrivateMode={() => auth.lockPrivate()}
        onToggleBiometrics={handleBiometricsToggle}
        onChangePin={() => router.push("/pin/setup?mode=change")}
        onRegenerateRecoveryKey={handleRegenerateRecoveryKey}
      />

      <SettingsSection title={t("settings.general")}>
        <SettingsRow
          label={t("settings.theme")}
          value={currentThemeLabel}
          onPress={() => setShowThemePicker(true)}
        />
        <Divider inset={Spacing[4]} />
        <SettingsRow
          label={t("settings.language")}
          value={currentLangLabel}
          onPress={() => setShowLangPicker(true)}
        />
      </SettingsSection>

      <SettingsSection title={t("settings.about")}>
        <SettingsRow label="OneLine" value="1.0.0" />
        <Divider inset={Spacing[4]} />
        <SettingsRow label={t("settings.dataLocal")} />
      </SettingsSection>

      <PinGate
        visible={showUnlockGate}
        onUnlocked={() => setShowUnlockGate(false)}
        onCancel={() => setShowUnlockGate(false)}
      />

      <ConfirmationDialog
        visible={showRegenerateConfirmModal}
        title={t("settings.confirmRegenerateRecoveryKeyTitle")}
        message={t("settings.confirmRegenerateRecoveryKeyMessage")}
        confirmLabel={t("settings.confirmRegenerateRecoveryKeyOk")}
        onConfirm={confirmRegenerateRecoveryKey}
        onClose={() => setShowRegenerateConfirmModal(false)}
      />

      <RecoveryKeyModal
        visible={showRecoveryKeyModal}
        recoveryKey={newRecoveryKey}
        copied={recoveryKeyCopied}
        title={t("settings.newRecoveryKey")}
        subtitle={t("settings.newRecoveryKeyMessage")}
        actionLabel={t("pin.recoverySaved")}
        onCopy={handleCopyRecoveryKey}
        onAction={() => {
          setShowRecoveryKeyModal(false);
          setNewRecoveryKey("");
        }}
        onClose={() => {
          setShowRecoveryKeyModal(false);
          setNewRecoveryKey("");
        }}
      />

      <TimePickerModal
        visible={showTimePicker}
        draftHour={draftHour}
        draftMinute={draftMinute}
        onChangeHour={setDraftHour}
        onChangeMinute={setDraftMinute}
        onSave={handleTimeSave}
        onClose={() => setShowTimePicker(false)}
      />

      <LanguagePickerModal
        visible={showLangPicker}
        activeLanguageCode={activeLangCode}
        languages={SUPPORTED_LANGUAGES}
        onSelect={handleLanguageSelect}
        onClose={() => setShowLangPicker(false)}
      />

      <ThemePickerModal
        visible={showThemePicker}
        activeThemeMode={settings.themeMode}
        options={themeOptions}
        onSelect={handleThemeSelect}
        onClose={() => setShowThemePicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: Spacing[16], gap: Spacing[4] },
  pageHeader: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[2] },
});
