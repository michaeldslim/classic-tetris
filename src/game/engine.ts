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
  createStateAtCampaignPosition,
  getGravityInterval,
  goToCampaignStage,
  reconcileGameState,
} from './lifecycle';
import { enterBonus, exitBonus, tickBonusTimer } from './bonusGame';
import { getLineClearDuration } from './lineClearFx';
import { spawnNextPiece } from './spawn';
import type { EngineAction, GameState } from './types';

export {
  advanceToNextStage,
  completeLineClear,
  createInitialState,
  createStageRestartState,
  createStateAtCampaignPosition,
  getGravityInterval,
  goToCampaignStage,
  lockActivePiece,
} from './lifecycle';
export { spawnNextPiece } from './spawn';
export { getGhostPiece } from './actions';
export type { ActivePiece, GameState } from './types';

export function tick(state: GameState, dt: number): GameState {
  state = reconcileGameState(state);

  if (state.mode === 'bonus' && state.bonus && !state.bonus.ended) {
    state = tickBonusTimer(state, dt);
    if (state.bonus?.ended) {
      return state;
    }
  }

  if (state.gameOver || state.campaignComplete) {
    return state;
  }

  if (state.mode === 'campaign' && state.stageCleared) {
    return state;
  }

  if (state.mode === 'bonus' && state.bonus?.ended) {
    return state;
  }

  if (state.lineClear) {
    const elapsed = state.lineClear.elapsed + dt;

    if (elapsed >= getLineClearDuration(state.lineClear.rows.length)) {
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

  if (state.pendingSpawn) {
    const spawnDelayMs = state.spawnDelayMs - dt;
    if (spawnDelayMs <= 0) {
      return spawnNextPiece({
        ...state,
        spawnDelayMs: 0,
      });
    }

    return {
      ...state,
      spawnDelayMs,
    };
  }

  if (!state.active) {
    return state;
  }

  let nextState = processDas(state, dt);

  let acc = nextState.fallAccumulator + dt;
  const interval = getGravityInterval(
    nextState.level,
    nextState.stage,
    nextState.gravityTierOverride,
  );

  while (acc >= interval) {
    acc -= interval;
    nextState = applyGravityStep(nextState);
    if (
      nextState.pendingSpawn ||
      nextState.gameOver ||
      !nextState.active ||
      nextState.stageCleared
    ) {
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
    if (action.level !== undefined && action.stage !== undefined) {
      return createStateAtCampaignPosition(action.level, action.stage, {
        stageLineTarget: action.stageLineTarget,
        gravityTier: action.gravityTier,
      });
    }
    return createInitialState();
  }

  if (typeof action === 'object' && action.type === 'RETRY_STAGE') {
    return createStageRestartState(state);
  }

  if (typeof action === 'object' && action.type === 'NEXT_STAGE') {
    if (!state.stageCleared) {
      return state;
    }
    if (action.level !== undefined && action.stage !== undefined) {
      return goToCampaignStage(state, action.level, action.stage, {
        stageLineTarget: action.stageLineTarget,
        gravityTier: action.gravityTier,
      });
    }
    return advanceToNextStage(state);
  }

  if (typeof action === 'object' && action.type === 'ENTER_BONUS') {
    return enterBonus(state);
  }

  if (typeof action === 'object' && action.type === 'EXIT_BONUS') {
    return exitBonus(state);
  }

  if (state.mode === 'bonus' && state.bonus?.ended) {
    return state;
  }

  if (state.pendingSpawn || state.lineClear || state.campaignComplete) {
    return state;
  }

  if (state.mode === 'campaign' && state.stageCleared) {
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
