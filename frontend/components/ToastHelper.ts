import * as Burnt from 'burnt';

export function showToast(
  title: string,
  preset: 'done' | 'error' | 'none' = 'done',
  haptic?: 'success' | 'warning' | 'error'
) {
  try {
    Burnt.toast({
      title,
      preset,
      from: 'top',
      haptic,
    });
  } catch (err) {
    console.warn('Toast:', title, err);
  }
}
