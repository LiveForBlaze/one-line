import { PinKeypad } from "@/components/PinKeypad";
import { RecoveryKeyModal } from "@/components/settings/RecoveryKeyModal";
import { Text } from "@/components/ui/Text";
import { Spacing } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Clipboard, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = "enter" | "confirm" | "recovery";

export default function PinSetupScreen() {
  const theme = useTheme();
  const { t } = useT();
  const router = useRouter();
  const auth = useAuthStore();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("enter");
  const [firstPin, setFirstPin] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFirst = (pin: string) => {
    setFirstPin(pin);
    setStep("confirm");
  };

  const handleConfirm = async (pin: string) => {
    if (pin !== firstPin) {
      setError(true);
      setTimeout(() => {
        setError(false);
        setStep("enter");
        setFirstPin("");
      }, 700);
      return;
    }
    const key = await auth.setupPrivatePin(pin);
    setRecoveryKey(key);
    setStep("recovery");
  };

  if (step === "recovery") {
    return (
      <RecoveryKeyModal
        useModal={false}
        topInset={insets.top}
        bottomInset={insets.bottom}
        recoveryKey={recoveryKey}
        copied={copied}
        title={t("pin.recoveryTitle")}
        subtitle={t("pin.recoverySub")}
        actionLabel={t("pin.recoverySaved")}
        onCopy={handleCopy}
        onAction={() => router.back()}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.handle}>
        <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
      </View>
      <View style={styles.content}>
        <Text type="subheader" style={styles.title}>
          {step === "enter" ? t("pin.create") : t("pin.confirm")}
        </Text>
        <Text type="text" variant="secondary" style={styles.subtitle}>
          {step === "enter" ? t("pin.createSub") : t("pin.confirmSub")}
        </Text>

        <View style={styles.keypad}>
          <PinKeypad
            onComplete={step === "enter" ? handleFirst : handleConfirm}
            error={error}
            label={error ? t("pin.mismatch") : undefined}
          />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.cancelBtn,
          {
            paddingBottom: insets.bottom + Spacing[4],
            opacity: pressed ? 0.6 : 1,
          },
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
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
  },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: Spacing[10],
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
