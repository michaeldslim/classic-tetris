import { useEffect } from 'react';
import { Platform } from 'react-native';
import type { GameAction } from '../game/types';

const KEY_MAP: Record<string, GameAction> = {
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  ArrowDown: 'SOFT_DROP',
  ArrowUp: 'ROTATE',
  ' ': 'HARD_DROP',
  x: 'ROTATE',
  X: 'ROTATE',
  z: 'ROTATE',
  Z: 'ROTATE',
};

export function useKeyboardControls(
  onAction: (action: GameAction) => void,
  onPauseToggle: () => void,
  onRestart: () => void,
  gameplayEnabled: boolean,
) {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === 'Escape' || key === 'p' || key === 'P') {
        event.preventDefault();
        onPauseToggle();
        return;
      }

      if (key === 'r' || key === 'R') {
        event.preventDefault();
        onRestart();
        return;
      }

      if (!gameplayEnabled) {
        return;
      }

      const action = KEY_MAP[key];
      if (!action) {
        return;
      }

      event.preventDefault();
      onAction(action);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameplayEnabled, onAction, onPauseToggle, onRestart]);
}
