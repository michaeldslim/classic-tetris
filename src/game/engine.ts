import {
  applyAction,
  applyGravityStep,
  applyDasDirection,
  processDas,
} from './actions';
import {
  advanceToNextStage,
  completeLineClear,
  createInitialState,
  createStageRestartState,
  getGravityInterval,
} from './lifecycle';
import { LINE_CLEAR_DURATION_MS } from './speed';
import type { EngineAction, GameState } from './types';

export {
  advanceToNextStage,
  completeLineClear,
  createInitialState,
  createStageRestartState,
  getGravityInterval,
  lockActivePiece,
  spawnNextPiece,
} from './lifecycle';
export { getGhostPiece } from './actions';
export type { ActivePiece, GameState } from './types';

export function tick(state: GameState, dt: number): GameState {
  if (state.gameOver || state.stageCleared || state.campaignComplete) {
    return state;
  }

  if (state.lineClear) {
    const elapsed = state.lineClear.elapsed + dt;

    if (elapsed >= LINE_CLEAR_DURATION_MS) {
      return completeLineClear({
        ...state,
        lineClear: { ...state.lineClear, elapsed },
      });
    }

    return {
      ...state,
      lineClear: { ...state.lineClear, elapsed },
    };
  }

  if (!state.active) {
    return state;
  }

  let nextState = processDas(state, dt);

  let acc = nextState.fallAccumulator + dt;
  const interval = getGravityInterval(nextState.level, nextState.stage);

  while (acc >= interval) {
    acc -= interval;
    nextState = applyGravityStep(nextState);
    if (nextState.gameOver || !nextState.active || nextState.stageCleared) {
      return { ...nextState, fallAccumulator: 0 };
    }
  }

  return { ...nextState, fallAccumulator: acc };
}

export function reduce(state: GameState, action: EngineAction): GameState {
  if (typeof action === 'object' && action.type === 'TICK') {
    return tick(state, action.dt);
  }

  if (typeof action === 'object' && action.type === 'RESTART') {
    return createInitialState();
  }

  if (typeof action === 'object' && action.type === 'RETRY_STAGE') {
    return createStageRestartState(state);
  }

  if (typeof action === 'object' && action.type === 'NEXT_STAGE') {
    if (!state.stageCleared) {
      return state;
    }
    return advanceToNextStage(state);
  }

  if (state.lineClear || state.stageCleared || state.campaignComplete) {
    return state;
  }

  if (typeof action === 'object' && action.type === 'DAS') {
    if (state.gameOver) {
      return state;
    }
    return applyDasDirection(state, action.direction);
  }

  if (state.gameOver) {
    return state;
  }

  return applyAction(state, action);
}
