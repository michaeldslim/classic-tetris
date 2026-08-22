import { type Dispatch, useEffect, useRef } from 'react';
import type { EngineAction, GameState } from '../game/types';

export function useGameLoop(
  state: GameState,
  dispatch: Dispatch<EngineAction>,
  paused = false,
) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    if (state.gameOver || paused || state.campaignComplete) {
      return;
    }

    let frameId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      if (!stateRef.current.gameOver && !pausedRef.current && !stateRef.current.campaignComplete) {
        dispatch({ type: 'TICK', dt });
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [state.gameOver, state.campaignComplete, paused, dispatch]);
}
