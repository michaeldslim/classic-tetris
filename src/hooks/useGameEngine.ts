import { useCallback, useState } from 'react';
import { playLockSound } from '../audio/lockSound';
import { createInitialState, reduce } from '../game/engine';
import type { EngineAction, GameState } from '../game/types';

function shouldPlayLockSound(prev: GameState, next: GameState): boolean {
  return (
    !prev.pendingSpawn &&
    next.pendingSpawn &&
    !next.lineClear &&
    !next.gameOver
  );
}

export function useGameEngine() {
  const [state, setState] = useState(createInitialState);

  const dispatch = useCallback((action: EngineAction) => {
    setState((prev) => {
      const next = reduce(prev, action);
      if (shouldPlayLockSound(prev, next)) {
        playLockSound();
      }
      return next;
    });
  }, []);

  return { state, dispatch };
}
