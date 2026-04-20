import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import {
  generateRecoveryPhrase,
  normalizeRecoveryPhrase,
} from "../utils/recovery-phrase";

const PRIVATE_PIN_KEY = "oneline_private_pin";
const RECOVERY_KEY_KEY = "oneline_recovery_key";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

interface AuthState {
  isPrivateModeOn: boolean;
  attempts: number;
  lockedUntil: number | null;

  hasPrivatePin: () => Promise<boolean>;
  /** Creates PIN + recovery key. Returns the plaintext recovery key to show once. */
  setupPrivatePin: (pin: string) => Promise<string>;
  changePrivatePin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  lockPrivate: () => void;
  isRateLimited: () => boolean;
  remainingLockSeconds: () => number;
  verifyRecoveryKey: (key: string) => Promise<boolean>;
  /** Resets PIN using a valid recovery phrase and keeps that phrase unchanged. */
  resetPinWithRecoveryKey: (
    recoveryKey: string,
    newPin: string,
  ) => Promise<boolean>;
  /** Re-generates recovery phrase (call only when private mode is already ON). Returns new phrase. */
  regenerateRecoveryKey: () => Promise<string>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isPrivateModeOn: false,
  attempts: 0,
  lockedUntil: null,

  async hasPrivatePin() {
    return (await SecureStore.getItemAsync(PRIVATE_PIN_KEY)) !== null;
  },

  async setupPrivatePin(pin: string) {
    const recoveryKey = generateRecoveryPhrase();
    await SecureStore.setItemAsync(PRIVATE_PIN_KEY, pin);
    await SecureStore.setItemAsync(RECOVERY_KEY_KEY, recoveryKey);
    set({ isPrivateModeOn: true, attempts: 0, lockedUntil: null });
    return recoveryKey;
  },

  async changePrivatePin(pin: string) {
    await SecureStore.setItemAsync(PRIVATE_PIN_KEY, pin);
    set({ isPrivateModeOn: true, attempts: 0, lockedUntil: null });
  },

  async verifyPin(pin: string) {
    const { lockedUntil, attempts } = get();
    if (lockedUntil && Date.now() < lockedUntil) return false;

    const stored = await SecureStore.getItemAsync(PRIVATE_PIN_KEY);
    if (stored === pin) {
      set({ isPrivateModeOn: true, attempts: 0, lockedUntil: null });
      return true;
    }

    const newAttempts = attempts + 1;
    set(
      newAttempts >= MAX_ATTEMPTS
        ? { attempts: 0, lockedUntil: Date.now() + LOCKOUT_MS }
        : { attempts: newAttempts },
    );
    return false;
  },

  async unlockWithBiometrics() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock Private Mode",
      cancelLabel: "Use PIN",
      disableDeviceFallback: true,
    });
    if (result.success) set({ isPrivateModeOn: true });
    return result.success;
  },

  lockPrivate: () => set({ isPrivateModeOn: false }),

  isRateLimited() {
    const { lockedUntil } = get();
    return lockedUntil !== null && Date.now() < lockedUntil;
  },

  remainingLockSeconds() {
    const { lockedUntil } = get();
    if (!lockedUntil) return 0;
    return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  },

  async verifyRecoveryKey(key: string) {
    const stored = await SecureStore.getItemAsync(RECOVERY_KEY_KEY);
    return (
      stored !== null &&
      normalizeRecoveryPhrase(stored) === normalizeRecoveryPhrase(key)
    );
  },

  async resetPinWithRecoveryKey(recoveryKey: string, newPin: string) {
    const valid = await get().verifyRecoveryKey(recoveryKey);
    if (!valid) return false;
    await SecureStore.setItemAsync(PRIVATE_PIN_KEY, newPin);
    set({ isPrivateModeOn: true, attempts: 0, lockedUntil: null });
    return true;
  },

  async regenerateRecoveryKey() {
    const newKey = generateRecoveryPhrase();
    await SecureStore.setItemAsync(RECOVERY_KEY_KEY, newKey);
    return newKey;
  },
}));
