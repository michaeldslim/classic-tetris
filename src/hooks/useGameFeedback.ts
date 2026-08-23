import { useEffect, useRef } from 'react';
import {
  hapticDrop,
  hapticGameOver,
  hapticLineClear,
  hapticMove,
  hapticRotate,
} from '../feedback/haptics';
import { useGameAudio } from '../audio/GameAudioContext';
import type { GameAction, GameState } from '../game/types';

export function useGameFeedback(
  state: GameState,
  lastAction: GameAction | null,
) {
  const { playSfx } = useGameAudio();
  const prevGameOverRef = useRef(state.gameOver);
  const prevLineClearRef = useRef(state.lineClear);

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
    if (state.gameOver && !prevGameOverRef.current) {
      void hapticGameOver();
      playSfx('gameOver');
    }
    prevGameOverRef.current = state.gameOver;
  }, [state.gameOver, playSfx]);

  useEffect(() => {
    const lockedWithLines =
      state.lineClear !== null && prevLineClearRef.current === null;

    if (lockedWithLines && !state.gameOver) {
      void hapticLineClear(state.lineClear!.rows.length);
      playSfx('lineMatched');
    }

    prevLineClearRef.current = state.lineClear;
  }, [state.lineClear, state.gameOver, playSfx]);
}
