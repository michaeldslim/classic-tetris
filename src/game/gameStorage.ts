import AsyncStorage from '@react-native-async-storage/async-storage';
import { isGameDifficulty } from '../difficulty/difficultyProfile';
import { DEFAULT_GAME_DIFFICULTY } from '../settings/types';
import type { BonusGameState, CampaignSnapshot } from './bonusGame';
import { reconcileGameState } from './lifecycle';
import { isValidTetrominoType, tetrominoTypes } from './tetrominoes';
import type { ActivePiece, GameMode, GameState, LineClearEffect } from './types';
import { BOARD_HEIGHT, BOARD_WIDTH, DEFAULT_PLAY_TIMING } from './types';

const SESSION_KEY = '@classic-tetris/session';
const SESSION_VERSION = 1;

export type BonusPhaseSnapshot = 'none' | 'intro' | 'result';

export type GameSessionSnapshot = {
  version: typeof SESSION_VERSION;
  state: GameState;
  paused: boolean;
  stagesClearedCount: number;
  recordedStageKey: string | null;
  bonusCheckStageKey: string | null;
  pendingBonus: boolean;
  bonusPhase: BonusPhaseSnapshot;
  savedAt: number;
};

export type GameSessionUiState = {
  paused: boolean;
  stagesClearedCount: number;
  recordedStageKey: string | null;
  bonusCheckStageKey: string | null;
  pendingBonus: boolean;
  bonusPhase: BonusPhaseSnapshot;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseRotation(value: unknown): ActivePiece['rotation'] | null {
  return value === 0 || value === 1 || value === 2 || value === 3 ? value : null;
}

function parseDasDirection(value: unknown): GameState['dasDirection'] | null {
  return value === -1 || value === 0 || value === 1 ? value : null;
}

function parseGameMode(value: unknown): GameMode | null {
  return value === 'campaign' || value === 'bonus' ? value : null;
}

function parseBonusPhase(value: unknown): BonusPhaseSnapshot | null {
  return value === 'none' || value === 'intro' || value === 'result' ? value : null;
}

function parseBoard(value: unknown): GameState['board'] | null {
  if (!Array.isArray(value) || value.length !== BOARD_HEIGHT) {
    return null;
  }

  const board: GameState['board'] = [];

  for (const row of value) {
    if (!Array.isArray(row) || row.length !== BOARD_WIDTH) {
      return null;
    }

    const parsedRow: GameState['board'][number] = [];
    for (const cell of row) {
      if (cell !== null && !isValidTetrominoType(cell)) {
        return null;
      }
      parsedRow.push(cell);
    }
    board.push(parsedRow);
  }

  return board;
}

function parseActivePiece(value: unknown): ActivePiece | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const piece = value as Partial<ActivePiece>;
  const rotation = parseRotation(piece.rotation);

  if (
    !isValidTetrominoType(piece.type) ||
    !isFiniteNumber(piece.x) ||
    !isFiniteNumber(piece.y) ||
    rotation === null
  ) {
    return null;
  }

  return {
    type: piece.type,
    x: Math.floor(piece.x),
    y: Math.floor(piece.y),
    rotation,
  };
}

function parseLineClear(value: unknown): LineClearEffect | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const effect = value as Partial<LineClearEffect>;
  if (!Array.isArray(effect.rows) || !isFiniteNumber(effect.elapsed)) {
    return null;
  }

  const rows = effect.rows.filter((row) => isFiniteNumber(row)).map((row) => Math.floor(row));
  if (rows.length !== effect.rows.length) {
    return null;
  }

  return {
    rows,
    elapsed: Math.max(0, effect.elapsed),
  };
}

function parseBag(value: unknown): GameState['bag'] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const bag: GameState['bag'] = [];
  for (const item of value) {
    if (!isValidTetrominoType(item)) {
      return null;
    }
    bag.push(item);
  }

  return bag;
}

function parseCampaignSnapshot(value: unknown): CampaignSnapshot | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const snapshot = value as Partial<CampaignSnapshot>;
  if (
    !isFiniteNumber(snapshot.level) ||
    !isFiniteNumber(snapshot.stage) ||
    !isFiniteNumber(snapshot.score) ||
    !isFiniteNumber(snapshot.lines)
  ) {
    return undefined;
  }

  return {
    level: Math.floor(snapshot.level),
    stage: Math.floor(snapshot.stage),
    score: Math.max(0, Math.floor(snapshot.score)),
    lines: Math.max(0, Math.floor(snapshot.lines)),
    stageLineTargetOverride:
      snapshot.stageLineTargetOverride === undefined
        ? undefined
        : isFiniteNumber(snapshot.stageLineTargetOverride)
          ? Math.max(1, Math.floor(snapshot.stageLineTargetOverride))
          : undefined,
    gravityTierOverride:
      snapshot.gravityTierOverride === undefined
        ? undefined
        : isFiniteNumber(snapshot.gravityTierOverride)
          ? Math.max(0, Math.floor(snapshot.gravityTierOverride))
          : undefined,
  };
}

function parseBonusState(value: unknown): BonusGameState | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const bonus = value as Partial<BonusGameState>;
  if (
    !isFiniteNumber(bonus.timeRemainingMs) ||
    !isFiniteNumber(bonus.lines) ||
    !isFiniteNumber(bonus.earnedScore) ||
    typeof bonus.ended !== 'boolean' ||
    typeof bonus.success !== 'boolean'
  ) {
    return undefined;
  }

  return {
    timeRemainingMs: Math.max(0, bonus.timeRemainingMs),
    lines: Math.max(0, Math.floor(bonus.lines)),
    earnedScore: Math.max(0, Math.floor(bonus.earnedScore)),
    ended: bonus.ended,
    success: bonus.success,
  };
}

function parseGameState(value: unknown): GameState | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const raw = value as Partial<GameState>;
  const board = parseBoard(raw.board);
  const bag = parseBag(raw.bag);
  const mode = parseGameMode(raw.mode);
  const dasDirection = parseDasDirection(raw.dasDirection);

  if (
    !board ||
    !bag ||
    !mode ||
    dasDirection === null ||
    !isValidTetrominoType(raw.next) ||
    !isFiniteNumber(raw.score) ||
    !isFiniteNumber(raw.level) ||
    !isFiniteNumber(raw.stage) ||
    !isFiniteNumber(raw.lines) ||
    typeof raw.gameOver !== 'boolean' ||
    typeof raw.stageCleared !== 'boolean' ||
    typeof raw.campaignComplete !== 'boolean' ||
    !isFiniteNumber(raw.fallAccumulator) ||
    !isFiniteNumber(raw.dasAccumulator) ||
    typeof raw.dasCharged !== 'boolean' ||
    typeof raw.pendingSpawn !== 'boolean' ||
    !isFiniteNumber(raw.spawnDelayMs)
  ) {
    return null;
  }

  const active = parseActivePiece(raw.active);
  if (raw.active !== null && raw.active !== undefined && active === null) {
    return null;
  }

  const lineClear = parseLineClear(raw.lineClear);
  if (raw.lineClear !== null && raw.lineClear !== undefined && lineClear === null) {
    return null;
  }

  const gameDifficulty = isGameDifficulty(raw.gameDifficulty)
    ? raw.gameDifficulty
    : DEFAULT_GAME_DIFFICULTY;

  return reconcileGameState({
    board,
    active,
    next: raw.next,
    bag,
    mode,
    campaignSnapshot: parseCampaignSnapshot(raw.campaignSnapshot),
    bonus: parseBonusState(raw.bonus),
    score: Math.max(0, Math.floor(raw.score)),
    level: Math.max(1, Math.floor(raw.level)),
    stage: Math.max(1, Math.floor(raw.stage)),
    lines: Math.max(0, Math.floor(raw.lines)),
    stageLineTargetOverride:
      raw.stageLineTargetOverride === undefined
        ? undefined
        : isFiniteNumber(raw.stageLineTargetOverride)
          ? Math.max(1, Math.floor(raw.stageLineTargetOverride))
          : undefined,
    gravityTierOverride:
      raw.gravityTierOverride === undefined
        ? undefined
        : isFiniteNumber(raw.gravityTierOverride)
          ? Math.max(0, Math.floor(raw.gravityTierOverride))
          : undefined,
    gameOver: raw.gameOver,
    stageCleared: raw.stageCleared,
    campaignComplete: raw.campaignComplete,
    fallAccumulator: Math.max(0, raw.fallAccumulator),
    dasDirection,
    dasAccumulator: Math.max(0, raw.dasAccumulator),
    dasCharged: raw.dasCharged,
    lineClear,
    pendingSpawn: raw.pendingSpawn,
    spawnDelayMs: Math.max(0, raw.spawnDelayMs),
    gameDifficulty,
    gravityScale: isFiniteNumber(raw.gravityScale)
      ? raw.gravityScale
      : DEFAULT_PLAY_TIMING.gravityScale,
    dasDelayMs: isFiniteNumber(raw.dasDelayMs)
      ? raw.dasDelayMs
      : DEFAULT_PLAY_TIMING.dasDelayMs,
    arrIntervalMs: isFiniteNumber(raw.arrIntervalMs)
      ? raw.arrIntervalMs
      : DEFAULT_PLAY_TIMING.arrIntervalMs,
  });
}

function parseSession(value: unknown): GameSessionSnapshot | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const raw = value as Partial<GameSessionSnapshot>;
  if (raw.version !== SESSION_VERSION) {
    return null;
  }

  const state = parseGameState(raw.state);
  const bonusPhase = parseBonusPhase(raw.bonusPhase);
  if (
    !state ||
    bonusPhase === null ||
    typeof raw.paused !== 'boolean' ||
    !isFiniteNumber(raw.stagesClearedCount) ||
    !isFiniteNumber(raw.savedAt) ||
    typeof raw.pendingBonus !== 'boolean' ||
    (raw.recordedStageKey !== null && typeof raw.recordedStageKey !== 'string') ||
    (raw.bonusCheckStageKey !== null && typeof raw.bonusCheckStageKey !== 'string')
  ) {
    return null;
  }

  return {
    version: SESSION_VERSION,
    state,
    paused: raw.paused,
    stagesClearedCount: Math.max(0, Math.floor(raw.stagesClearedCount)),
    recordedStageKey: raw.recordedStageKey ?? null,
    bonusCheckStageKey: raw.bonusCheckStageKey ?? null,
    pendingBonus: raw.pendingBonus,
    bonusPhase,
    savedAt: Math.max(0, Math.floor(raw.savedAt)),
  };
}

export function isResumableSession(snapshot: GameSessionSnapshot): boolean {
  return !snapshot.state.gameOver && !snapshot.state.campaignComplete;
}

export async function loadGameSession(): Promise<GameSessionSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = parseSession(JSON.parse(raw));
    if (!parsed || !isResumableSession(parsed)) {
      if (parsed) {
        await clearGameSession();
      }
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function saveGameSession(snapshot: GameSessionSnapshot): Promise<void> {
  if (!isResumableSession(snapshot)) {
    await clearGameSession();
    return;
  }

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
}

export async function clearGameSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export function createGameSessionSnapshot(
  state: GameState,
  ui: GameSessionUiState,
): GameSessionSnapshot {
  return {
    version: SESSION_VERSION,
    state,
    paused: ui.paused,
    stagesClearedCount: ui.stagesClearedCount,
    recordedStageKey: ui.recordedStageKey,
    bonusCheckStageKey: ui.bonusCheckStageKey,
    pendingBonus: ui.pendingBonus,
    bonusPhase: ui.bonusPhase,
    savedAt: Date.now(),
  };
}

export function getSessionProgressLabel(snapshot: GameSessionSnapshot): {
  level: number;
  stage: number;
  score: number;
} {
  return {
    level: snapshot.state.level,
    stage: snapshot.state.stage,
    score: snapshot.state.score,
  };
}

export const VALID_TETROMINO_TYPES = tetrominoTypes;
