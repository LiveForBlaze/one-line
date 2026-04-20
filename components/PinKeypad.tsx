import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Vibration, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const PIN_LENGTH = 4;

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

interface Props {
  onComplete: (pin: string) => void;
  error?: boolean;
  label?: string;
}

export function PinKeypad({ onComplete, error, label }: Props) {
  const theme = useTheme();
  const [pin, setPin] = useState("");
  const shakeX = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const shake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    Vibration.vibrate(200);
  }, [shakeX]);

  React.useEffect(() => {
    if (error) shake();
  }, [error, shake]);

  const handleKey = useCallback(
    (key: string) => {
      if (key === "⌫") {
        setPin((p) => p.slice(0, -1));
        return;
      }
      if (key === "") return;

      const next = pin + key;
      setPin(next);

      if (next.length === PIN_LENGTH) {
        onComplete(next);
        setPin("");
      }
    },
    [pin, onComplete],
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="label" secondary style={styles.label}>
          {label}
        </Text>
      )}

      <Animated.View style={[styles.dots, shakeStyle]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i < pin.length ? theme.text : "transparent",
                borderColor: error
                  ? theme.challenging
                  : i < pin.length
                    ? theme.text
                    : theme.borderStrong,
              },
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.keypad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((key, ki) => (
              <Pressable
                key={ki}
                style={({ pressed }) => [
                  styles.key,
                  {
                    backgroundColor:
                      pressed && key ? theme.surfaceElevated : "transparent",
                  },
                ]}
                onPress={() => handleKey(key)}
                disabled={!key}
              >
                <Text
                  type="subheader"
                  style={[styles.keyText, { color: theme.text }]}
                >
                  {key}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing[6],
  },
  label: {
    textAlign: "center",
    letterSpacing: 0.5,
  },
  dots: {
    flexDirection: "row",
    gap: Spacing[4],
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  keypad: {
    gap: Spacing[1],
  },
  row: {
    flexDirection: "row",
    gap: Spacing[1],
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: Radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: {},
});
