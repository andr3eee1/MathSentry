import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useScanLine } from './useScanLine';
import { C } from '../theme/tokens';

export function ScanLine({ height, active }: { height: number; active: boolean }) {
  const { translateY } = useScanLine(height, active);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: translateY }] }));
  return (
    <View style={{ position: 'absolute', left: 16, right: 16, height }}>
      <Animated.View
        style={[
          {
            height: 2,
            backgroundColor: C.primary,
            shadowColor: C.primary,
            shadowOpacity: 0.45,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 18 },
            elevation: 14,
          },
          style,
        ]}
      />
    </View>
  );
}
