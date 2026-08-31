import { type Dispatch, type RefObject, useEffect, useRef } from 'react';
import { ARR_INTERVAL_MS } from '../game/speed';
import type { EngineAction, GameState } from '../game/types';

export function useGameLoop(
  state: GameState,
  dispatch: Dispatch<EngineAction>,
  paused = false,
  softDropActiveRef?: RefObject<boolean>,
) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const softDropActiveRefStable = useRef(softDropActiveRef);
  softDropActiveRefStable.current = softDropActiveRef;

  const bonusEnded = state.mode === 'bonus' && state.bonus?.ended === true;
  const campaignStageCleared =
    state.mode === 'campaign' && state.stageCleared;

  useEffect(() => {
    if (
      state.gameOver ||
      paused ||
      state.campaignComplete ||
      campaignStageCleared ||
      bonusEnded
    ) {
      return;
    }

    let frameId = 0;
    let lastTime = performance.now();
    let softDropAccumulator = 0;

    const loop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      const current = stateRef.current;
      const currentBonusEnded =
        current.mode === 'bonus' && current.bonus?.ended === true;
      const currentCampaignStageCleared =
        current.mode === 'campaign' && current.stageCleared;

      if (
        !current.gameOver &&
        !pausedRef.current &&
        !current.campaignComplete &&
        !currentCampaignStageCleared &&
        !currentBonusEnded
      ) {
        dispatch({ type: 'TICK', dt });

        if (softDropActiveRefStable.current?.current) {
          softDropAccumulator += dt;
          while (softDropAccumulator >= ARR_INTERVAL_MS) {
            softDropAccumulator -= ARR_INTERVAL_MS;
            dispatch('SOFT_DROP');
          }
        } else {
          softDropAccumulator = 0;
        }
      } else {
        softDropAccumulator = 0;
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [
    state.gameOver,
    state.campaignComplete,
    campaignStageCleared,
    bonusEnded,
    paused,
    dispatch,
  ]);
}
