import { PinKeypad } from "@/components/PinKeypad";
import { Text } from "@/components/ui/Text";
import { Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth";
import { useRecoveryModalStore } from "@/store/recovery-modal";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = "current" | "new" | "confirm";

export default function PinSetupScreen() {
  const theme = useTheme();
  const { t } = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const auth = useAuthStore();
  const insets = useSafeAreaInsets();
  const setPendingRecoveryKey = useRecoveryModalStore(
    (state) => state.setRecoveryKey,
  );
  const mode = params.mode === "change" ? "change" : "create";
  const isChangeMode = mode === "change";
  const verticalInset = Math.max(insets.top, insets.bottom) + Spacing[4];

  const [step, setStep] = useState<Step>(isChangeMode ? "current" : "new");
  const [nextPin, setNextPin] = useState("");
  const [error, setError] = useState(false);
  const [errorLabel, setErrorLabel] = useState<string | undefined>(undefined);

  const showError = (label: string, onReset?: () => void) => {
    setErrorLabel(label);
    setError(true);
    setTimeout(() => {
      setError(false);
      setErrorLabel(undefined);
      onReset?.();
    }, 700);
  };

  const handleCurrentPin = async (pin: string) => {
    const isValid = await auth.verifyPin(pin);

    if (!isValid) {
      showError(t("pin.currentInvalid"));
      return;
    }

    setStep("new");
  };

  const handleNewPin = (pin: string) => {
    setNextPin(pin);
    setStep("confirm");
  };

  const handleConfirm = async (pin: string) => {
    if (pin !== nextPin) {
      showError(t("pin.mismatch"), () => {
        setStep("new");
        setNextPin("");
      });
      return;
    }

    if (isChangeMode) {
      await auth.changePrivatePin(pin);
      router.back();
      return;
    }

    const key = await auth.setupPrivatePin(pin);
    setPendingRecoveryKey(key);
    router.replace("/pin/recovery");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: verticalInset,
        },
      ]}
    >
      <View style={styles.handle}>
        <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
      </View>
      <View style={styles.content}>
        <Text type="subheader" style={styles.title}>
          {step === "current"
            ? t("pin.enterCurrent")
            : step === "new"
              ? isChangeMode
                ? t("pin.change")
                : t("pin.create")
              : isChangeMode
                ? t("pin.confirmNew")
                : t("pin.confirm")}
        </Text>
        <Text type="text" variant="secondary" style={styles.subtitle}>
          {step === "current"
            ? t("pin.enterCurrentSub")
            : step === "new"
              ? isChangeMode
                ? t("pin.changeSub")
                : t("pin.createSub")
              : isChangeMode
                ? t("pin.confirmNewSub")
                : t("pin.confirmSub")}
        </Text>

        <View style={styles.keypad}>
          <PinKeypad
            onComplete={
              step === "current"
                ? handleCurrentPin
                : step === "new"
                  ? handleNewPin
                  : handleConfirm
            }
            error={error}
            label={error ? errorLabel : undefined}
          />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.cancelBtn,
          { opacity: pressed ? 0.6 : 1 },
        ]}
        onPress={() => router.back()}
      >
        <Text type="label" variant="secondary">
          {t("pin.cancel")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle: {
    alignItems: "center",
    paddingBottom: Spacing[2],
  },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[2],
  },
  title: { marginBottom: Spacing[1] },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing[8],
    paddingHorizontal: Spacing[6],
  },
  keypad: { marginTop: Spacing[4] },
  cancelBtn: {
    paddingTop: Spacing[4],
    paddingHorizontal: Spacing[8],
    alignSelf: "center",
  },
});
