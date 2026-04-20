import { RecoveryKeyModal } from "@/components/settings/RecoveryKeyModal";
import { useT } from "@/hooks/useT";
import { useRecoveryModalStore } from "@/store/recovery-modal";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Clipboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PinRecoveryScreen() {
  const { t } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recoveryKey = useRecoveryModalStore((state) => state.recoveryKey);
  const clearRecoveryKey = useRecoveryModalStore(
    (state) => state.clearRecoveryKey,
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!recoveryKey) {
      router.back();
    }
  }, [recoveryKey, router]);

  const handleCopy = useCallback(() => {
    if (!recoveryKey) return;
    Clipboard.setString(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [recoveryKey]);

  if (!recoveryKey) {
    return null;
  }

  return (
    <RecoveryKeyModal
      useModal={false}
      showHandle={false}
      topInset={insets.top}
      bottomInset={insets.bottom}
      recoveryKey={recoveryKey}
      copied={copied}
      title={t("pin.recoveryTitle")}
      subtitle={t("pin.recoverySub")}
      actionLabel={t("pin.recoverySaved")}
      onCopy={handleCopy}
      onAction={() => {
        clearRecoveryKey();
        router.back();
      }}
    />
  );
}
