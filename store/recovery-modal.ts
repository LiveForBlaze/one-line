import { create } from "zustand";

interface RecoveryModalState {
  recoveryKey: string | null;
  setRecoveryKey: (recoveryKey: string) => void;
  clearRecoveryKey: () => void;
}

export const useRecoveryModalStore = create<RecoveryModalState>((set) => ({
  recoveryKey: null,
  setRecoveryKey: (recoveryKey) => set({ recoveryKey }),
  clearRecoveryKey: () => set({ recoveryKey: null }),
}));
