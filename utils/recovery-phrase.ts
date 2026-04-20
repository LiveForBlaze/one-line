import { wordlist } from "@scure/bip39/wordlists/english.js";

export const RECOVERY_PHRASE_WORD_COUNT = 8;
const WORDLIST_MASK = 2047;

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);

  if (globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(bytes);
  }

  for (let index = 0; index < length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }

  return bytes;
}

export function generateRecoveryPhrase(): string {
  const bytes = getRandomBytes(RECOVERY_PHRASE_WORD_COUNT * 2);

  const words = Array.from({ length: RECOVERY_PHRASE_WORD_COUNT }, (_, index) => {
    const offset = index * 2;
    const value = (bytes[offset] << 8) | bytes[offset + 1];
    return wordlist[value & WORDLIST_MASK];
  });

  return words.join(" ");
}

export function normalizeRecoveryPhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitRecoveryPhrase(value: string): string[] {
  const normalized = normalizeRecoveryPhrase(value);
  return normalized ? normalized.split(" ") : [];
}