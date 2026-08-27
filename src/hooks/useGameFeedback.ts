import { useEffect, useRef, useState } from 'react';
import {
  hapticDrop,
  hapticGameOver,
  hapticLineClear,
  hapticLock,
  hapticMove,
  hapticRotate,
} from '../feedback/haptics';
import { useGameAudio } from '../audio/GameAudioContext';
import type { GameAction, GameState } from '../game/types';

export function useGameFeedback(
  state: GameState,
  lastAction: GameAction | null,
) {
  const { playSfx, playLineClearSfx } = useGameAudio();
  const prevGameOverRef = useRef(state.gameOver);
  const prevLineClearRef = useRef(state.lineClear);
  const prevPendingSpawnRef = useRef(state.pendingSpawn);
  const [lockPulseKey, setLockPulseKey] = useState(0);

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
      const lineCount = state.lineClear!.rows.length;
      void hapticLineClear(lineCount);
      playLineClearSfx(lineCount);
    }

    prevLineClearRef.current = state.lineClear;
  }, [state.lineClear, state.gameOver, playLineClearSfx]);

  useEffect(() => {
    if (
      state.pendingSpawn &&
      !prevPendingSpawnRef.current &&
      state.lineClear === null
    ) {
      void hapticLock();
      setLockPulseKey((key) => key + 1);
    }
    prevPendingSpawnRef.current = state.pendingSpawn;
  }, [state.pendingSpawn, state.lineClear]);

  return { lockPulseKey };
}
