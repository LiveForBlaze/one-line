import { PinKeypad } from "@/components/PinKeypad";
import { Text } from "@/components/ui/Text";
import { Fonts, Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth";
import { useSettingsStore } from "@/store/settings";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useCallback, useEffect, useState } from "react";
import {
  Clipboard,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type View_ =
  | "pin"
  | "recovery-key"
  | "new-pin"
  | "confirm-pin"
  | "new-recovery-key";

interface Props {
  visible: boolean;
  onUnlocked: () => void;
  onCancel?: () => void;
}

export function PinGate({ visible, onUnlocked, onCancel }: Props) {
  const theme = useTheme();
  const { t } = useT();
  const {
    verifyPin,
    unlockWithBiometrics,
    isRateLimited,
    remainingLockSeconds,
    verifyRecoveryKey,
    resetPinWithRecoveryKey,
  } = useAuthStore();
  const { biometricsEnabled } = useSettingsStore();

  const [view, setView] = useState<View_>("pin");
  const [pinError, setPinError] = useState(false);
  const [lockMsg, setLockMsg] = useState("");
  const [hasBio, setHasBio] = useState(false);

  // Recovery flow state
  const [recoveryInput, setRecoveryInput] = useState("");
  const [recoveryError, setRecoveryError] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [newRecoveryKey, setNewRecoveryKey] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    Clipboard.setString(newRecoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [newRecoveryKey]);

  // Reset to PIN view when modal closes
  useEffect(() => {
    if (!visible) {
      setView("pin");
      setRecoveryInput("");
      setRecoveryError(false);
      setNewPin("");
    }
  }, [visible]);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setHasBio);
  }, []);

  const tryBiometrics = useCallback(async () => {
    if (!biometricsEnabled || !hasBio) return;
    const ok = await unlockWithBiometrics();
    if (ok) onUnlocked();
  }, [biometricsEnabled, hasBio, unlockWithBiometrics, onUnlocked]);

  useEffect(() => {
    if (visible && view === "pin") tryBiometrics();
  }, [tryBiometrics, view, visible]);

  useEffect(() => {
    if (!visible) return;
    const tick = () => {
      const rem = remainingLockSeconds();
      setLockMsg(rem > 0 ? t("auth.tooManyAttempts", { seconds: rem }) : "");
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [visible, remainingLockSeconds, t]);

  const handlePin = useCallback(
    async (pin: string) => {
      if (isRateLimited()) return;
      const ok = await verifyPin(pin);
      if (ok) {
        onUnlocked();
      } else {
        setPinError(true);
        setTimeout(() => setPinError(false), 700);
      }
    },
    [verifyPin, isRateLimited, onUnlocked],
  );

  const handleRecoverySubmit = useCallback(async () => {
    const ok = await verifyRecoveryKey(recoveryInput);
    if (ok) {
      setView("new-pin");
    } else {
      setRecoveryError(true);
    }
  }, [recoveryInput, verifyRecoveryKey]);

  const handleNewPin = useCallback((pin: string) => {
    setNewPin(pin);
    setView("confirm-pin");
  }, []);

  const handleConfirmPin = useCallback(
    async (pin: string) => {
      if (pin !== newPin) {
        setPinError(true);
        setTimeout(() => {
          setPinError(false);
          setView("new-pin");
          setNewPin("");
        }, 700);
        return;
      }
      const newKey = await resetPinWithRecoveryKey(recoveryInput, pin);
      if (newKey) {
        setNewRecoveryKey(newKey);
        setCopied(false);
        setView("new-recovery-key");
      }
    },
    [newPin, recoveryInput, resetPinWithRecoveryKey],
  );

  // ── Show new recovery key after reset ───────────────────────────────────
  if (view === "new-recovery-key") {
    const groups = newRecoveryKey.split("-");
    return (
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          <View style={styles.brand}>
            <Text variant="heading" style={styles.title}>
              {t("pin.recoveryTitle")}
            </Text>
            <Text variant="body" secondary style={styles.subtitle}>
              {t("pin.recoverySub")}
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
              {groups.map((g, i) => (
                <View
                  key={i}
                  style={[
                    styles.keyGroup,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.keyGroupText,
                      { color: theme.text, fontFamily: Fonts.mono },
                    ]}
                  >
                    {g}
                  </Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                styles.copyBtn,
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

          <Text
            variant="caption"
            secondary
            style={[styles.recoveryErr, { marginTop: Spacing[4] }]}
          >
            {t("pin.recoveryWarning")}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: theme.tint,
                opacity: pressed ? 0.8 : 1,
                marginTop: Spacing[6],
              },
            ]}
            onPress={onUnlocked}
          >
            <Text style={[styles.submitBtnText, { color: "#fff" }]}>
              {t("pin.recoverySaved")}
            </Text>
          </Pressable>
        </Animated.View>
      </Modal>
    );
  }

  // ── Recovery key entry view ──────────────────────────────────────────────
  if (view === "recovery-key") {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          <View style={styles.brand}>
            <Text variant="heading" style={styles.title}>
              {t("auth.recoveryTitle")}
            </Text>
            <Text variant="body" secondary style={styles.subtitle}>
              {t("auth.recoverySub")}
            </Text>
          </View>

          <View style={styles.recoveryInputWrap}>
            <TextInput
              style={[
                styles.recoveryInput,
                {
                  color: recoveryError ? theme.challenging : theme.text,
                  backgroundColor: theme.surfaceElevated,
                  borderColor: recoveryError ? theme.challenging : theme.border,
                  fontFamily: Fonts.mono,
                },
              ]}
              value={recoveryInput}
              onChangeText={(v) => {
                // Strip everything except alphanumerics, uppercase, max 16 chars
                const raw = v
                  .replace(/[^A-Z0-9]/gi, "")
                  .toUpperCase()
                  .slice(0, 16);
                // Insert dashes at positions 4, 8, 12
                const masked = raw.match(/.{1,4}/g)?.join("-") ?? raw;
                setRecoveryInput(masked);
                setRecoveryError(false);
              }}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
            />
            {recoveryError && (
              <Text
                variant="caption"
                style={[styles.recoveryErr, { color: theme.challenging }]}
              >
                {t("auth.recoveryInvalid")}
              </Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: theme.tint,
                opacity: pressed || !recoveryInput.trim() ? 0.6 : 1,
              },
            ]}
            onPress={handleRecoverySubmit}
            disabled={!recoveryInput.trim()}
          >
            <Text style={[styles.submitBtnText, { color: "#fff" }]}>
              {t("auth.recoverySubmit")}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.footerBtn,
              { opacity: pressed ? 0.5 : 1, marginTop: Spacing[4] },
            ]}
            onPress={() => {
              setView("pin");
              setRecoveryInput("");
              setRecoveryError(false);
            }}
          >
            <Text variant="label" secondary>
              {t("auth.backToPin")}
            </Text>
          </Pressable>
        </Animated.View>
      </Modal>
    );
  }

  // ── New PIN entry (after recovery) ───────────────────────────────────────
  if (view === "new-pin" || view === "confirm-pin") {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          <View style={styles.brand}>
            <Text variant="heading" style={styles.title}>
              {view === "new-pin" ? t("pin.create") : t("pin.confirm")}
            </Text>
            <Text variant="body" secondary style={styles.subtitle}>
              {view === "new-pin" ? t("pin.createSub") : t("pin.confirmSub")}
            </Text>
          </View>
          <PinKeypad
            onComplete={view === "new-pin" ? handleNewPin : handleConfirmPin}
            error={pinError}
            label={pinError ? t("pin.mismatch") : undefined}
          />
        </Animated.View>
      </Modal>
    );
  }

  // ── Default: PIN entry ───────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.brand}>
          <Text
            style={[
              styles.appName,
              { color: theme.tint, fontFamily: Fonts.serif },
            ]}
          >
            OneLine
          </Text>
          <Text variant="heading" style={styles.title}>
            {t("auth.privateTitle")}
          </Text>
          <Text variant="body" secondary style={styles.subtitle}>
            {t("auth.privateSubtitle")}
          </Text>
        </View>

        <PinKeypad
          onComplete={handlePin}
          error={pinError}
          label={lockMsg || (pinError ? t("auth.incorrectPin") : undefined)}
        />

        <View style={styles.footer}>
          {biometricsEnabled && hasBio && (
            <Pressable
              style={({ pressed }) => [
                styles.footerBtn,
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={tryBiometrics}
            >
              <Text variant="label" style={{ color: theme.tint }}>
                {t("auth.useBiometrics")}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.footerBtn,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            onPress={() => setView("recovery-key")}
          >
            <Text variant="label" secondary>
              {t("auth.forgotPin")}
            </Text>
          </Pressable>
          {onCancel && (
            <Pressable
              style={({ pressed }) => [
                styles.footerBtn,
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={onCancel}
            >
              <Text variant="label" secondary>
                {t("auth.cancel")}
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing[6],
  },
  brand: { alignItems: "center", marginBottom: Spacing[10] },
  appName: {
    fontSize: 38,
    lineHeight: 52,
    fontWeight: "400",
    letterSpacing: -1,
    marginBottom: Spacing[2],
    paddingTop: Spacing[2],
  },
  title: { textAlign: "center", marginBottom: Spacing[1] },
  subtitle: { textAlign: "center" },
  footer: { marginTop: Spacing[8], alignItems: "center", gap: Spacing[3] },
  footerBtn: { paddingVertical: Spacing[2], paddingHorizontal: Spacing[4] },
  keyCard: {
    width: "100%",
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
  keyGroupText: { fontSize: 20, letterSpacing: 4 },
  copyBtn: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[2] + 1,
    borderRadius: Radii.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  recoveryInputWrap: { width: "100%", marginBottom: Spacing[6] },
  recoveryInput: {
    width: "100%",
    height: 52,
    borderRadius: Radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing[5],
    fontSize: 18,
    letterSpacing: 2,
    textAlign: "center",
  },
  recoveryErr: { textAlign: "center", marginTop: Spacing[2] },
  submitBtn: {
    width: "100%",
    paddingVertical: Spacing[4],
    borderRadius: Radii.xl,
    alignItems: "center",
  },
  submitBtnText: { fontSize: 16, fontWeight: "600" },
});
