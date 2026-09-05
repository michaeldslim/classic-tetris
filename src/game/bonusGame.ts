import { createShuffledBag, drawFromBag } from './bag';
import { createEmptyBoard, mergePiece } from './board';
import { spawnNextPiece } from './spawn';
import { computeLineClearScore } from './scoring';
import type { GameState } from './types';

/** Probability of bonus after a stage clear (0–1). */
export const BONUS_TRIGGER_CHANCE = 0.25;

/** Force a bonus every N stage clears (0 = disabled). */
export const BONUS_EVERY_N_STAGES = 4;

/** Bonus round duration in milliseconds. */
export const BONUS_DURATION_MS = 60_000;

/** Lines to clear for a successful bonus. */
export const BONUS_LINE_TARGET = 10;

/** Score multiplier applied to line clears during bonus. */
export const BONUS_SCORE_MULTIPLIER = 2;

export type CampaignSnapshot = {
  level: number;
  stage: number;
  score: number;
  lines: number;
  stageLineTargetOverride?: number;
  gravityTierOverride?: number;
};

export type BonusGameState = {
  timeRemainingMs: number;
  lines: number;
  earnedScore: number;
  ended: boolean;
  success: boolean;
};

export function computeBonusLineClearScore(
  linesCleared: number,
  level: number,
): number {
  return computeLineClearScore(linesCleared, level) * BONUS_SCORE_MULTIPLIER;
}

export function shouldTriggerBonus(input: {
  stagesClearedTotal: number;
  random?: () => number;
}): boolean {
  const rng = input.random ?? Math.random;

  if (
    BONUS_EVERY_N_STAGES > 0 &&
    input.stagesClearedTotal % BONUS_EVERY_N_STAGES === 0
  ) {
    return true;
  }

  return rng() < BONUS_TRIGGER_CHANCE;
}

export function createCampaignSnapshot(state: GameState): CampaignSnapshot {
  return {
    level: state.level,
    stage: state.stage,
    score: state.score,
    lines: state.lines,
    stageLineTargetOverride: state.stageLineTargetOverride,
    gravityTierOverride: state.gravityTierOverride,
  };
}

export function enterBonus(state: GameState): GameState {
  if (!state.stageCleared || state.mode === 'bonus') {
    return state;
  }

  const bag = createShuffledBag();
  const { piece: first, bag: bagAfterFirst } = drawFromBag(bag);

  return spawnNextPiece({
    ...state,
    mode: 'bonus',
    campaignSnapshot: createCampaignSnapshot(state),
    bonus: {
      timeRemainingMs: BONUS_DURATION_MS,
      lines: 0,
      earnedScore: 0,
      ended: false,
      success: false,
    },
    board: createEmptyBoard(),
    active: null,
    next: first,
    bag: bagAfterFirst,
    lines: 0,
    stageCleared: false,
    gameOver: false,
    stageLineTargetOverride: BONUS_LINE_TARGET,
    gravityTierOverride: undefined,
    fallAccumulator: 0,
    lineClear: null,
    pendingSpawn: false,
    spawnDelayMs: 0,
    dasDirection: 0,
    dasAccumulator: 0,
    dasCharged: false,
  });
}

export function exitBonus(state: GameState): GameState {
  if (state.mode !== 'bonus' || !state.campaignSnapshot) {
    return state;
  }

  const snapshot = state.campaignSnapshot;
  const earnedScore = state.bonus?.earnedScore ?? 0;

  return {
    ...state,
    mode: 'campaign',
    level: snapshot.level,
    stage: snapshot.stage,
    score: snapshot.score + earnedScore,
    lines: snapshot.lines,
    stageLineTargetOverride: snapshot.stageLineTargetOverride,
    gravityTierOverride: snapshot.gravityTierOverride,
    stageCleared: true,
    campaignSnapshot: undefined,
    bonus: undefined,
    board: createEmptyBoard(),
    active: null,
    gameOver: false,
    campaignComplete: false,
    lineClear: null,
    pendingSpawn: false,
    spawnDelayMs: 0,
    fallAccumulator: 0,
    dasDirection: 0,
    dasAccumulator: 0,
    dasCharged: false,
  };
}

export function finalizeBonusLineClear(
  state: GameState,
  linesCleared: number,
): GameState {
  if (state.mode !== 'bonus' || !state.bonus || state.bonus.ended) {
    return state;
  }

  const lines = state.lines + linesCleared;
  const earnedScore =
    state.bonus.earnedScore +
    computeBonusLineClearScore(linesCleared, state.level);
  const bonus: BonusGameState = {
    ...state.bonus,
    lines,
    earnedScore,
  };

  const clearedState: GameState = {
    ...state,
    lines,
    lineClear: null,
    bonus,
  };

  if (lines >= BONUS_LINE_TARGET) {
    return {
      ...clearedState,
      active: null,
      bonus: {
        ...bonus,
        ended: true,
        success: true,
      },
      dasDirection: 0,
      dasAccumulator: 0,
      dasCharged: false,
    };
  }

  return spawnNextPiece(clearedState);
}

export function tickBonusTimer(state: GameState, dt: number): GameState {
  if (
    state.mode !== 'bonus' ||
    !state.bonus ||
    state.bonus.ended ||
    state.lineClear ||
    state.pendingSpawn
  ) {
    return state;
  }

  const timeRemainingMs = Math.max(0, state.bonus.timeRemainingMs - dt);

  if (timeRemainingMs <= 0) {
    let nextState = state;

    if (nextState.active) {
      const { type, x, y, rotation } = nextState.active;
      nextState = {
        ...nextState,
        board: mergePiece(nextState.board, type, rotation, x, y),
        active: null,
        pendingSpawn: false,
        spawnDelayMs: 0,
        lineClear: null,
      };
    }

    return {
      ...nextState,
      active: null,
      pendingSpawn: false,
      spawnDelayMs: 0,
      lineClear: null,
      bonus: {
        ...state.bonus,
        timeRemainingMs: 0,
        ended: true,
        success: state.bonus.lines >= BONUS_LINE_TARGET,
      },
      dasDirection: 0,
      dasAccumulator: 0,
      dasCharged: false,
    };
  }

  return {
    ...state,
    bonus: {
      ...state.bonus,
      timeRemainingMs,
    },
  };
}
