import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Text } from '@/components/ui/Text';
import { Divider } from '@/components/ui/Divider';
import { PinGate } from '@/components/PinGate';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore, type AppLanguage } from '@/store/settings';
import { useAuthStore } from '@/store/auth';
import { scheduleDailyReminder, cancelDailyReminder, requestPermissions } from '@/services/notifications';
import { Spacing, Radii } from '@/constants/theme';
import { useT } from '@/hooks/useT';
import { i18n } from '@/i18n';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text variant="caption" secondary style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {title.toUpperCase()}
      </Text>
      <View style={[styles.sectionBody, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

function Row({
  label,
  subtitle,
  value,
  onPress,
  right,
  destructive,
}: {
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.row, { opacity: pressed && onPress ? 0.6 : 1 }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.rowLabel}>
        <Text variant="body" style={{ color: destructive ? theme.challenging : theme.text }}>
          {label}
        </Text>
        {subtitle && (
          <Text variant="caption" secondary style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={styles.rowRight}>
        {value && <Text variant="body" secondary>{value}</Text>}
        {right}
      </View>
    </Pressable>
  );
}

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

  const { isPrivateModeOn } = auth;

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setHasBiometrics);
    auth.hasPrivatePin().then(setHasPin);
  }, []);

  const handleNotificationsToggle = useCallback(async (val: boolean) => {
    settings.setNotificationsEnabled(val);
    if (val) {
      const granted = await requestPermissions();
      if (granted) {
        await scheduleDailyReminder(settings.notificationHour, settings.notificationMinute);
      } else {
        settings.setNotificationsEnabled(false);
      }
    } else {
      await cancelDailyReminder();
    }
  }, [settings]);

  const handleBiometricsToggle = useCallback(async (val: boolean) => {
    if (val) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('settings.confirmBiometrics'),
        disableDeviceFallback: true,
        cancelLabel: t('auth.cancel'),
      });
      if (result.success) settings.setBiometricsEnabled(true);
    } else {
      settings.setBiometricsEnabled(false);
    }
  }, [settings, t]);

  const handleRemovePrivateMode = useCallback(() => {
    Alert.alert(
      t('settings.removePrivateModeTitle'),
      t('settings.removePrivateModeMessage'),
      [
        { text: t('auth.cancel'), style: 'cancel' },
        {
          text: t('settings.removePrivateModeOk'),
          style: 'destructive',
          onPress: async () => {
            await auth.removePrivatePin();
            settings.setBiometricsEnabled(false);
            setHasPin(false);
          },
        },
      ],
    );
  }, [auth, settings, t]);

  const handleRegenerateRecoveryKey = useCallback(async () => {
    const newKey = await auth.regenerateRecoveryKey();
    Alert.alert(
      t('settings.newRecoveryKey'),
      newKey,
      [{ text: t('settings.savedIt'), style: 'default' }],
    );
  }, [auth, t]);

  const LANGUAGES: { code: AppLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ru', label: 'Russian', native: 'Русский' },
    { code: 'de', label: 'German', native: 'Deutsch' },
    { code: 'fr', label: 'French', native: 'Français' },
    { code: 'es', label: 'Spanish', native: 'Español' },
    { code: 'pt', label: 'Portuguese', native: 'Português' },
    { code: 'it', label: 'Italian', native: 'Italiano' },
    { code: 'nl', label: 'Dutch', native: 'Nederlands' },
    { code: 'pl', label: 'Polish', native: 'Polski' },
    { code: 'tr', label: 'Turkish', native: 'Türkçe' },
    { code: 'ja', label: 'Japanese', native: '日本語' },
    { code: 'ko', label: 'Korean', native: '한국어' },
    { code: 'zh', label: 'Chinese', native: '中文' },
    { code: 'ar', label: 'Arabic', native: 'العربية' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'sv', label: 'Swedish', native: 'Svenska' },
    { code: 'da', label: 'Danish', native: 'Dansk' },
    { code: 'fi', label: 'Finnish', native: 'Suomi' },
    { code: 'uk', label: 'Ukrainian', native: 'Українська' },
  ];

  const activeLangCode = settings.language ?? i18n.language ?? 'en';
  const currentLang = LANGUAGES.find((l) => l.code === activeLangCode) ?? LANGUAGES[0];
  const currentLangLabel = currentLang.native;

  const handleLanguageSelect = useCallback((code: AppLanguage) => {
    settings.setLanguage(code);
    i18n.changeLanguage(code);
    setShowLangPicker(false);
  }, [settings]);

  const notificationTimeLabel = `${String(settings.notificationHour).padStart(2, '0')}:${String(settings.notificationMinute).padStart(2, '0')}`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing[4] }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageHeader}>
        <Text variant="title">{t('settings.title')}</Text>
      </View>

      <Section title={t('settings.reminders')}>
        <Row
          label={t('settings.dailyReminder')}
          right={
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: theme.border, true: theme.tintBackground }}
              thumbColor={settings.notificationsEnabled ? theme.tint : theme.textTertiary}
              ios_backgroundColor={theme.border}
            />
          }
        />
        {settings.notificationsEnabled && (
          <>
            <Divider inset={Spacing[4]} />
            <Row label={t('settings.reminderTime')} value={notificationTimeLabel} onPress={() => {}} />
          </>
        )}
      </Section>

      <Section title={t('settings.privacy')}>
        {!hasPin ? (
          // No Private Mode set up yet
          <Row
            label={t('settings.setupPrivateMode')}
            subtitle={t('settings.setupPrivateModeHint')}
            onPress={() => {
              router.push('/pin/setup');
              // After setup, refresh hasPin on next focus
              setTimeout(() => auth.hasPrivatePin().then(setHasPin), 500);
            }}
          />
        ) : !isPrivateModeOn ? (
          // PIN set but mode is off
          <Row
            label={t('settings.enterPrivateMode')}
            onPress={() => setShowUnlockGate(true)}
          />
        ) : (
          // Private Mode is ON — show all controls
          <>
            <Row
              label={t('settings.exitPrivateMode')}
              onPress={() => auth.lockPrivate()}
            />
            <Divider inset={Spacing[4]} />
            <Row
              label={t('settings.changePIN')}
              onPress={() => router.push('/pin/setup')}
            />
            <Divider inset={Spacing[4]} />
            <Row
              label={t('settings.removePrivateMode')}
              onPress={handleRemovePrivateMode}
              destructive
            />
          </>
        )}
      </Section>

      <Section title={t('settings.general')}>
        <Row
          label={t('settings.language')}
          value={currentLangLabel}
          onPress={() => setShowLangPicker(true)}
        />
      </Section>

      <Section title={t('settings.about')}>
        <Row label="OneLine" value="1.0.0" />
        <Divider inset={Spacing[4]} />
        <Row label={t('settings.dataLocal')} />
      </Section>

      <PinGate
        visible={showUnlockGate}
        onUnlocked={() => setShowUnlockGate(false)}
        onCancel={() => setShowUnlockGate(false)}
      />

      <Modal
        visible={showLangPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLangPicker(false)}
        statusBarTranslucent
      >
        <Pressable style={langStyles.backdrop} onPress={() => setShowLangPicker(false)}>
          <View style={langStyles.backdropBg} />
        </Pressable>

        <View style={[langStyles.sheet, { backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing[4] }]}>
          <View style={langStyles.handle}>
            <View style={[langStyles.handleBar, { backgroundColor: theme.border }]} />
          </View>
          <Text variant="label" secondary style={langStyles.sheetTitle}>
            {t('settings.language').toUpperCase()}
          </Text>
          <FlatList
            data={LANGUAGES}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isActive = item.code === activeLangCode;
              return (
                <Pressable
                  style={({ pressed }) => [langStyles.langRow, { opacity: pressed ? 0.6 : 1 }]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <View style={langStyles.langLabel}>
                    <Text variant="body" style={{ color: theme.text }}>{item.native}</Text>
                    <Text variant="caption" secondary style={{ marginLeft: Spacing[2] }}>{item.label}</Text>
                  </View>
                  {isActive && (
                    <Text variant="body" style={{ color: theme.tint }}>✓</Text>
                  )}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => (
              <View style={[langStyles.separator, { backgroundColor: theme.border }]} />
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: Spacing[16], gap: Spacing[4] },
  pageHeader: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[2] },
  section: { paddingHorizontal: Spacing[4], gap: Spacing[1] },
  sectionTitle: {
    paddingHorizontal: Spacing[2],
    marginBottom: Spacing[1],
    letterSpacing: 0.6,
  },
  sectionBody: {
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3] + 2,
    minHeight: 44,
    gap: Spacing[2],
  },
  rowLabel: { flex: 1, gap: 2 },
  rowSubtitle: { marginTop: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], flexShrink: 0 },
});

const langStyles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  backdropBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: { alignItems: 'center', paddingTop: Spacing[3], paddingBottom: Spacing[1] },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  sheetTitle: { paddingHorizontal: Spacing[5], paddingVertical: Spacing[3], letterSpacing: 0.6 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3] + 2,
    minHeight: 48,
  },
  langLabel: { flexDirection: 'row', alignItems: 'center' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: Spacing[5] },
});
