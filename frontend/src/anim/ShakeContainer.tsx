import React, { ReactNode } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useShake } from './useShake';

export function ShakeContainer({ shakeKey, children }: { shakeKey: number; children: ReactNode }) {
  const { translateX } = useShake(shakeKey);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}
