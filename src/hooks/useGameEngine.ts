import { useCallback, useState } from 'react';
import { createInitialState, reduce } from '../game/engine';
import type { EngineAction } from '../game/types';

export function useGameEngine() {
  const [state, setState] = useState(createInitialState);

  const dispatch = useCallback((action: EngineAction) => {
    setState((prev) => reduce(prev, action));
  }, []);

  return { state, dispatch };
}
