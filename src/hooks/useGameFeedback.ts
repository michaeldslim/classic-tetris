import { useEffect, useRef } from 'react';
import {
  hapticDrop,
  hapticGameOver,
  hapticLineClear,
  hapticMove,
  hapticRotate,
} from '../feedback/haptics';
import { useGameAudio } from '../audio/GameAudioContext';
import { countFilledCells } from '../game/board';
import type { GameAction, GameState } from '../game/types';

export function useGameFeedback(
  state: GameState,
  lastAction: GameAction | null,
) {
  const { playSfx } = useGameAudio();
  const prevGameOverRef = useRef(state.gameOver);
  const prevLineClearRef = useRef(state.lineClear);
  const prevCellCountRef = useRef(countFilledCells(state.board));

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
    const cellCount = countFilledCells(state.board);
    const lockedWithLines =
      state.lineClear !== null && prevLineClearRef.current === null;
    const lockedWithoutLines =
      cellCount > prevCellCountRef.current && state.lineClear === null;

    if (lockedWithLines && !state.gameOver) {
      void hapticLineClear(state.lineClear!.rows.length);
      playSfx('lineMatched');
    } else if (lockedWithoutLines && !state.gameOver) {
      playSfx('dropped');
    }

    prevLineClearRef.current = state.lineClear;
    prevCellCountRef.current = cellCount;
  }, [state.board, state.lineClear, state.gameOver, playSfx]);
}
