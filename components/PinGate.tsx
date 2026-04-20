import { PinKeypad } from "@/components/PinKeypad";
import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth";
import { useSettingsStore } from "@/store/settings";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { normalizeRecoveryPhrase } from "../utils/recovery-phrase";

type View_ = "pin" | "recovery-key" | "new-pin" | "confirm-pin";

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

  // Reset to PIN view when modal closes
  useEffect(() => {
    if (!visible) {
      setView("pin");
      setRecoveryInput("");
      setRecoveryError(false);
      setNewPin("");
      setPinError(false);
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
      const didReset = await resetPinWithRecoveryKey(recoveryInput, pin);
      if (didReset) {
        onUnlocked();
      }
    },
    [newPin, onUnlocked, recoveryInput, resetPinWithRecoveryKey],
  );

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
            <Text type="subheader" style={styles.title}>
              {t("auth.recoveryTitle")}
            </Text>
            <Text type="text" variant="secondary" style={styles.subtitle}>
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
                },
              ]}
              value={recoveryInput}
              onChangeText={(v) => {
                setRecoveryInput(v.replace(/[^a-zA-Z\s]/g, "").toLowerCase());
                setRecoveryError(false);
              }}
              placeholder={t("auth.recoveryPlaceholder")}
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              numberOfLines={3}
              autoFocus
              textAlignVertical="top"
            />
            {recoveryError && (
              <Text
                type="caption"
                variant="challenging"
                style={styles.recoveryErr}
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
            disabled={!normalizeRecoveryPhrase(recoveryInput)}
          >
            <Text
              type="action"
              style={[styles.submitBtnText, { color: "#fff" }]}
            >
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
            <Text type="label" variant="secondary">
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
            <Text type="subheader" style={styles.title}>
              {view === "new-pin" ? t("pin.create") : t("pin.confirm")}
            </Text>
            <Text type="text" variant="secondary" style={styles.subtitle}>
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
          <Text type="display" variant="accent" style={styles.appName}>
            OneLine
          </Text>
          <Text type="subheader" style={styles.title}>
            {t("auth.privateTitle")}
          </Text>
          <Text type="text" variant="secondary" style={styles.subtitle}>
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
              <Text type="label" variant="accent">
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
            <Text type="label" variant="secondary">
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
              <Text type="label" variant="secondary">
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
    marginBottom: Spacing[2],
    paddingTop: Spacing[2],
  },
  title: { textAlign: "center", marginBottom: Spacing[1] },
  subtitle: { textAlign: "center" },
  footer: { marginTop: Spacing[8], alignItems: "center", gap: Spacing[3] },
  footerBtn: { paddingVertical: Spacing[2], paddingHorizontal: Spacing[4] },
  recoveryInputWrap: { width: "100%", marginBottom: Spacing[6] },
  recoveryInput: {
    width: "100%",
    minHeight: 112,
    borderRadius: Radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    fontSize: 17,
    lineHeight: 24,
  },
  recoveryErr: { textAlign: "center", marginTop: Spacing[2] },
  submitBtn: {
    width: "100%",
    paddingVertical: Spacing[4],
    borderRadius: Radii.xl,
    alignItems: "center",
  },
  submitBtnText: {},
});
