import { useCallback, useState } from 'react';
import { createInitialState, reduce } from '../game/engine';
import { reconcileGameState } from '../game/lifecycle';
import type { EngineAction, GameState } from '../game/types';

export function useGameEngine(initialState?: GameState) {
  const [state, setState] = useState(() =>
    initialState ? reconcileGameState(initialState) : createInitialState(),
  );

  const dispatch = useCallback((action: EngineAction) => {
    setState((prev) => reduce(prev, action));
  }, []);

  return { state, dispatch };
}
