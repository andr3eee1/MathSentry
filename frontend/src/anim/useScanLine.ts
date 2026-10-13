import { useSharedValue, withRepeat, withTiming, interpolate, Extrapolation, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';

export function useScanLine(size: number, active: boolean) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active || size <= 0) {
      progress.value = withTiming(0, { duration: 200 });
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [active, size]);

  const translateY = interpolate(progress.value, [0, 1], [8, Math.max(8, size - 8)], Extrapolation.CLAMP);
  return { translateY, progress };
}
