import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Clipboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { PinKeypad } from '@/components/PinKeypad';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/auth';
import { useT } from '@/hooks/useT';
import { Spacing, Radii, Fonts } from '@/constants/theme';

type Step = 'enter' | 'confirm' | 'recovery';

export default function PinSetupScreen() {
  const theme = useTheme();
  const { t } = useT();
  const router = useRouter();
  const auth = useAuthStore();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFirst = (pin: string) => {
    setFirstPin(pin);
    setStep('confirm');
  };

  const handleConfirm = async (pin: string) => {
    if (pin !== firstPin) {
      setError(true);
      setTimeout(() => {
        setError(false);
        setStep('enter');
        setFirstPin('');
      }, 700);
      return;
    }
    const key = await auth.setupPrivatePin(pin);
    setRecoveryKey(key);
    setStep('recovery');
  };

  // Split key into 4 groups: XXXX-XXXX-XXXX-XXXX
  const keyGroups = recoveryKey.split('-');

  if (step === 'recovery') {
    return (
      <View style={[styles.recoveryContainer, { backgroundColor: theme.background }]}>
        {/* Drag handle */}
        <View style={styles.handle}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
        </View>

        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.recoveryInner, { paddingBottom: insets.bottom + Spacing[6] }]}
        >
          {/* Header */}
          <View style={styles.recoveryHeader}>
            <Text variant="heading" style={styles.recoveryTitle}>
              {t('pin.recoveryTitle')}
            </Text>
            <Text variant="body" secondary style={styles.recoverySubtitle}>
              {t('pin.recoverySub')}
            </Text>
          </View>

          {/* Key display */}
          <View style={[styles.keyCard, { backgroundColor: theme.surfaceElevated }]}>
            <Text variant="caption" style={[styles.keyLabel, { color: theme.textTertiary }]}>
              {t('pin.recoveryKeyLabel')}
            </Text>

            {/* 2×2 grid of key groups */}
            <View style={styles.keyGrid}>
              {keyGroups.map((group, i) => (
                <View
                  key={i}
                  style={[styles.keyGroup, { backgroundColor: theme.background, borderColor: theme.border }]}
                >
                  <Text style={[styles.keyGroupText, { color: theme.text, fontFamily: Fonts.mono }]}>
                    {group}
                  </Text>
                </View>
              ))}
            </View>

            {/* Copy button */}
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                styles.copyBtn,
                {
                  backgroundColor: copied ? theme.tintBackground : theme.surface,
                  borderColor: copied ? theme.tint : theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text variant="label" style={{ color: copied ? theme.tint : theme.textSecondary }}>
                {copied ? t('pin.copied') : t('pin.copy')}
              </Text>
            </Pressable>
          </View>

          {/* Warning */}
          <Text variant="caption" secondary style={styles.keyWarning}>
            {t('pin.recoveryWarning')}
          </Text>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.doneBtn,
              { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.doneBtnText, { color: '#fff' }]}>
              {t('pin.recoverySaved')}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.handle}>
        <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
      </View>
      <View style={styles.content}>
        <Text variant="heading" style={styles.title}>
          {step === 'enter' ? t('pin.create') : t('pin.confirm')}
        </Text>
        <Text variant="body" secondary style={styles.subtitle}>
          {step === 'enter' ? t('pin.createSub') : t('pin.confirmSub')}
        </Text>

        <View style={styles.keypad}>
          <PinKeypad
            onComplete={step === 'enter' ? handleFirst : handleConfirm}
            error={error}
            label={error ? t('pin.mismatch') : undefined}
          />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.cancelBtn,
          { paddingBottom: insets.bottom + Spacing[4], opacity: pressed ? 0.6 : 1 },
        ]}
        onPress={() => router.back()}
      >
        <Text variant="label" style={{ color: theme.textSecondary }}>
          {t('pin.cancel')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: { alignItems: 'center', paddingTop: Spacing[3], paddingBottom: Spacing[2] },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  content: { flex: 1, alignItems: 'center', paddingTop: Spacing[10], gap: Spacing[2] },
  title: { marginBottom: Spacing[1] },
  subtitle: { textAlign: 'center', marginBottom: Spacing[8], paddingHorizontal: Spacing[6] },
  keypad: { marginTop: Spacing[4] },
  cancelBtn: {
    paddingTop: Spacing[4],
    paddingHorizontal: Spacing[8],
    alignSelf: 'center',
  },

  // Recovery screen
  recoveryContainer: { flex: 1 },
  recoveryInner: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    gap: Spacing[5],
  },
  recoveryHeader: { alignItems: 'center', gap: Spacing[2], paddingTop: Spacing[4] },
  recoveryTitle: { textAlign: 'center' },
  recoverySubtitle: { textAlign: 'center', lineHeight: 22 },
  keyCard: {
    borderRadius: Radii.xl,
    padding: Spacing[5],
    gap: Spacing[4],
    alignItems: 'center',
  },
  keyLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  keyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    justifyContent: 'center',
  },
  keyGroup: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: '44%',
    alignItems: 'center',
  },
  keyGroupText: {
    fontSize: 20,
    letterSpacing: 4,
  },
  copyBtn: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[2] + 1,
    borderRadius: Radii.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  keyWarning: {
    textAlign: 'center',
    lineHeight: 20,
  },
  doneBtn: {
    paddingVertical: Spacing[4],
    borderRadius: Radii.xl,
    alignItems: 'center',
    marginTop: 'auto',
  },
  doneBtnText: { fontSize: 16, fontWeight: '600' },
});
