import type { TetrominoType } from '../theme/colors';
import { drawFromBag, createShuffledBag } from './bag';
import {
  isValidPosition,
  mergePiece,
  clearLines,
  createEmptyBoard,
  findFullLineRows,
} from './board';
import { getNextStage, getStageLineTarget, isStageComplete } from './campaign';
import { computeLineClearScore } from './scoring';
import { LOCK_SPAWN_DELAY_MS } from './speed';
import type { ActivePiece, GameState } from './types';

const SPAWN_X = 2;
const SPAWN_Y = 0;

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

export function spawnNextPiece(state: GameState): GameState {
  const pieceType = state.next;
  const { piece: next, bag } = drawFromBag(state.bag);
  const active: ActivePiece = {
    type: pieceType,
    x: SPAWN_X,
    y: SPAWN_Y,
    rotation: 0,
  };

  if (!isValidPosition(state.board, pieceType, 0, SPAWN_X, SPAWN_Y)) {
    return {
      ...state,
      next,
      bag,
      active: null,
      pendingSpawn: false,
      spawnDelayMs: 0,
      gameOver: true,
      ...resetDasState(state),
    };
  }

  return {
    ...state,
    next,
    bag,
    active,
    pendingSpawn: false,
    spawnDelayMs: 0,
    fallAccumulator: 0,
    ...resetDasState(state),
  };
}

function finalizeLineClear(state: GameState, linesCleared: number): GameState {
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
