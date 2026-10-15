import * as Burnt from 'burnt';

export function showToast(
  title: string,
  preset: 'done' | 'error' | 'none' = 'done',
  haptic?: 'success' | 'warning' | 'error',
  duration: number = 2.5
) {
  try {
    Burnt.toast({
      title,
      preset,
      from: 'top',
      haptic,
      duration,
    });
  } catch (err) {
    console.warn('Toast:', title, err);
  }
}
