import { useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { SPRING } from '../constants/anim';
import { useEffect } from 'react';

export function useShake(shakeKey: number, amplitude = 8) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (shakeKey > 0) {
      translateX.value = withSequence(
        withSpring(amplitude, SPRING.default),
        withSpring(-amplitude, SPRING.default),
        withSpring(amplitude * 0.5, SPRING.default),
        withSpring(-amplitude * 0.5, SPRING.default),
        withSpring(0, SPRING.default),
      );
    }
  }, [shakeKey]);

  return { translateX };
}
