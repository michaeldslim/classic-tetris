import { drawFromBag, createShuffledBag } from './bag';
import {
  mergePiece,
  clearLines,
  createEmptyBoard,
  findFullLineRows,
} from './board';
import { getNextStage, isStageComplete } from './campaign';
import { finalizeBonusLineClear } from './bonusGame';
import { computeLineClearScore } from './scoring';
import { spawnNextPiece } from './spawn';
import { LOCK_SPAWN_DELAY_MS } from './speed';
import { isValidTetrominoType } from './tetrominoes';
import type { GameState } from './types';

function isLiveGameplay(state: GameState): boolean {
  if (state.gameOver || state.campaignComplete) {
    return false;
  }

  if (state.mode === 'campaign' && state.stageCleared) {
    return false;
  }

  if (state.mode === 'bonus' && state.bonus?.ended) {
    return false;
  }

  return true;
}

/** Heal inconsistent piece/spawn state that can leave a frozen or missing piece. */
export function reconcileGameState(state: GameState): GameState {
  if (state.active && !isValidTetrominoType(state.active.type)) {
    return spawnNextPiece({
      ...state,
      active: null,
      pendingSpawn: false,
      spawnDelayMs: 0,
    });
  }

  if (state.active && state.pendingSpawn) {
    return lockActivePiece({
      ...state,
      pendingSpawn: false,
      spawnDelayMs: 0,
    });
  }

  if (state.active && state.lineClear) {
    return lockActivePiece({
      ...state,
      lineClear: null,
    });
  }

  if (
    isLiveGameplay(state) &&
    !state.active &&
    !state.pendingSpawn &&
    !state.lineClear
  ) {
    return spawnNextPiece(state);
  }

  return state;
}

function resetDasState(state: GameState): Pick<
  GameState,
  'dasDirection' | 'dasAccumulator' | 'dasCharged'
> {
  return {
    dasDirection: 0,
    dasAccumulator: 0,
    dasCharged: false,
  };
}

function finalizeLineClear(state: GameState, linesCleared: number): GameState {
  if (state.mode === 'bonus') {
    return finalizeBonusLineClear(state, linesCleared);
  }

  const lines = state.lines + linesCleared;
  const clearedState: GameState = {
    ...state,
    lines,
    score: state.score + computeLineClearScore(linesCleared, state.level),
    lineClear: null,
  };

  if (isStageComplete(lines, state.stage, state.stageLineTargetOverride)) {
    return {
      ...clearedState,
      active: null,
      stageCleared: true,
      ...resetDasState(clearedState),
    };
  }

  return spawnNextPiece(clearedState);
}

export function completeLineClear(state: GameState): GameState {
  if (!state.lineClear) {
    return state;
  }

  const { board, linesCleared } = clearLines(state.board);

  return finalizeLineClear(
    {
      ...state,
      board,
    },
    linesCleared,
  );
}

export function lockActivePiece(state: GameState): GameState {
  if (!state.active) {
    return state;
  }

  const { type, x, y, rotation } = state.active;
  const mergedBoard = mergePiece(state.board, type, rotation, x, y);
  const fullRows = findFullLineRows(mergedBoard);

  if (fullRows.length === 0) {
    return {
      ...state,
      board: mergedBoard,
      active: null,
      pendingSpawn: true,
      spawnDelayMs: LOCK_SPAWN_DELAY_MS,
      ...resetDasState(state),
    };
  }

  return {
    ...state,
    board: mergedBoard,
    active: null,
    pendingSpawn: false,
    spawnDelayMs: 0,
    lineClear: { rows: fullRows, elapsed: 0 },
    ...resetDasState(state),
  };
}

export function goToCampaignStage(
  state: GameState,
  level: number,
  stage: number,
  modifiers: { stageLineTarget?: number; gravityTier?: number } = {},
): GameState {
  const bag = createShuffledBag();
  const { piece: first, bag: bagAfterFirst } = drawFromBag(bag);

  return spawnNextPiece({
    board: createEmptyBoard(),
    active: null,
    next: first,
    bag: bagAfterFirst,
    mode: 'campaign',
    score: state.score,
    level,
    stage,
    lines: 0,
    stageLineTargetOverride: modifiers.stageLineTarget,
    gravityTierOverride: modifiers.gravityTier,
    gameOver: false,
    stageCleared: false,
    campaignComplete: false,
    fallAccumulator: 0,
    dasDirection: 0,
    dasAccumulator: 0,
    dasCharged: false,
    lineClear: null,
    pendingSpawn: false,
    spawnDelayMs: 0,
  });
}

export function createStateAtCampaignPosition(
  level: number,
  stage: number,
  modifiers: { stageLineTarget?: number; gravityTier?: number } = {},
): GameState {
  return goToCampaignStage(createInitialState(), level, stage, modifiers);
}

export function advanceToNextStage(state: GameState): GameState {
  const next = getNextStage(state.level, state.stage);

  if (!next) {
    return {
      ...state,
      stageCleared: false,
      campaignComplete: true,
      active: null,
      ...resetDasState(state),
    };
  }

  return spawnNextPiece({
    ...state,
    mode: 'campaign',
    board: createEmptyBoard(),
    level: next.level,
    stage: next.stage,
    lines: 0,
    stageLineTargetOverride: undefined,
    gravityTierOverride: undefined,
    stageCleared: false,
    lineClear: null,
    fallAccumulator: 0,
    ...resetDasState(state),
  });
}

export function createInitialState(): GameState {
  const bag = createShuffledBag();
  const { piece: first, bag: bagAfterFirst } = drawFromBag(bag);

  return spawnNextPiece({
    board: createEmptyBoard(),
    active: null,
    next: first,
    bag: bagAfterFirst,
    mode: 'campaign',
    score: 0,
    level: 1,
    stage: 1,
    lines: 0,
    gameOver: false,
    stageCleared: false,
    campaignComplete: false,
    fallAccumulator: 0,
    dasDirection: 0,
    dasAccumulator: 0,
    dasCharged: false,
    lineClear: null,
    pendingSpawn: false,
    spawnDelayMs: 0,
  });
}

export function createStageRestartState(state: GameState): GameState {
  const bag = createShuffledBag();
  const { piece: first, bag: bagAfterFirst } = drawFromBag(bag);

  return spawnNextPiece({
    board: createEmptyBoard(),
    active: null,
    next: first,
    bag: bagAfterFirst,
    mode: 'campaign',
    score: state.score,
    level: state.level,
    stage: state.stage,
    lines: 0,
    stageLineTargetOverride: state.stageLineTargetOverride,
    gravityTierOverride: state.gravityTierOverride,
    gameOver: false,
    stageCleared: false,
    campaignComplete: false,
    fallAccumulator: 0,
    dasDirection: 0,
    dasAccumulator: 0,
    dasCharged: false,
    lineClear: null,
    pendingSpawn: false,
    spawnDelayMs: 0,
  });
}

export { getGravityInterval } from './speed';
