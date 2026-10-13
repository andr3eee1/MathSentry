import React, { ReactNode } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { usePulse } from './usePulse';

export function PulseView({ active, children }: { active: boolean; children: ReactNode }) {
  const { scale, opacity } = usePulse(active);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  return <Animated.View style={style}>{children}</Animated.View>;
}
