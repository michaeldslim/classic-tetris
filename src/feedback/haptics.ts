import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function run(fn: () => Promise<void>) {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    await fn();
  } catch {
    // Haptics unavailable on some devices/simulators
  }
}

export function hapticMove() {
  return run(() => Haptics.selectionAsync());
}

export function hapticRotate() {
  return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticDrop() {
  return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function hapticLineClear(linesCleared: number) {
  if (linesCleared >= 4) {
    return run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  }
  return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
}

export function hapticGameOver() {
  return run(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  );
}
