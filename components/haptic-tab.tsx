import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

export function HapticTab(props: BottomTabBarButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0.92, 1], [0.7, 1]),
  }));

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      onPressOut={(ev) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        props.onPressOut?.(ev);
      }}
    >
      <Animated.View style={[{ flex: 1 }, animStyle]}>
        {props.children}
      </Animated.View>
    </PlatformPressable>
  );
}
