import * as ExpoHaptics from 'expo-haptics';

export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

// Haptics are decorative: a device or Expo Go build without the native module
// (or with vibration disabled) must never surface as an error to the user.

export function impactAsync(
  style?: ExpoHaptics.ImpactFeedbackStyle
): Promise<void> {
  return ExpoHaptics.impactAsync(style).catch(() => {});
}

export function notificationAsync(
  type?: ExpoHaptics.NotificationFeedbackType
): Promise<void> {
  return ExpoHaptics.notificationAsync(type).catch(() => {});
}
