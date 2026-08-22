import { useEffect, useRef } from 'react';
import {
  hapticDrop,
  hapticGameOver,
  hapticLineClear,
  hapticMove,
  hapticRotate,
} from '../feedback/haptics';
import type { GameAction, GameState } from '../game/types';

export function useGameFeedback(
  state: GameState,
  lastAction: GameAction | null,
) {
  const prevLinesRef = useRef(state.lines);
  const prevGameOverRef = useRef(state.gameOver);

  useEffect(() => {
    if (!lastAction) {
      return;
    }

    switch (lastAction) {
      case 'LEFT':
      case 'RIGHT':
        void hapticMove();
        break;
      case 'ROTATE':
        void hapticRotate();
        break;
      case 'SOFT_DROP':
      case 'HARD_DROP':
        void hapticDrop();
        break;
      default:
        break;
    }
  }, [lastAction]);

  useEffect(() => {
    const cleared = state.lines - prevLinesRef.current;
    if (cleared > 0) {
      void hapticLineClear(cleared);
    }
    prevLinesRef.current = state.lines;
  }, [state.lines]);

  useEffect(() => {
    if (state.gameOver && !prevGameOverRef.current) {
      void hapticGameOver();
    }
    prevGameOverRef.current = state.gameOver;
  }, [state.gameOver]);
}
