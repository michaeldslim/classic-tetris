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

export function hapticLock() {
  return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticLineClear(linesCleared: number) {
  if (linesCleared >= 4) {
    return run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  }
  if (linesCleared >= 3) {
    return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  }
  if (linesCleared >= 2) {
    return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  }
  return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function hapticGameOver() {
  return run(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  );
}
