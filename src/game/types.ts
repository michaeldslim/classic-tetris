import type { BonusGameState, CampaignSnapshot } from './bonusGame';
import type { GameDifficulty } from '../settings/types';
import { DEFAULT_GAME_DIFFICULTY } from '../settings/types';
import type { TetrominoType } from '../theme/colors';

export type ActivePiece = {
  type: TetrominoType;
  x: number;
  y: number;
  rotation: 0 | 1 | 2 | 3;
};

export type LineClearEffect = {
  rows: number[];
  elapsed: number;
};

export type GameMode = 'campaign' | 'bonus';

export type GameState = {
  board: BoardCell[][];
  active: ActivePiece | null;
  next: TetrominoType;
  bag: TetrominoType[];
  mode: GameMode;
  campaignSnapshot?: CampaignSnapshot;
  bonus?: BonusGameState;
  score: number;
  /** Campaign level (1–5). */
  level: number;
  /** Stage within the current level (1–5). */
  stage: number;
  /** Lines cleared in the current stage. */
  lines: number;
  /** Overrides campaign line target for hidden / special stages. */
  stageLineTargetOverride?: number;
  /** Overrides gravity tier for hidden / special stages. */
  gravityTierOverride?: number;
  gameOver: boolean;
  stageCleared: boolean;
  campaignComplete: boolean;
  fallAccumulator: number;
  /** -1 = left, 0 = none, 1 = right */
  dasDirection: -1 | 0 | 1;
  dasAccumulator: number;
  dasCharged: boolean;
  lineClear: LineClearEffect | null;
  /** Piece locked; spawn deferred so lock SFX can play before next piece appears. */
  pendingSpawn: boolean;
  /** Countdown (ms) before spawnNextPiece runs after a lock. */
  spawnDelayMs: number;
  /** Active play difficulty for this session (Phase 9). */
  gameDifficulty: GameDifficulty;
  gravityScale: number;
  dasDelayMs: number;
  arrIntervalMs: number;
};

export const DEFAULT_PLAY_TIMING = {
  gameDifficulty: DEFAULT_GAME_DIFFICULTY,
  gravityScale: 2,
  dasDelayMs: 220,
  arrIntervalMs: 95,
} as const;

export type GameAction =
  | 'LEFT'
  | 'RIGHT'
  | 'SOFT_DROP'
  | 'ROTATE'
  | 'HARD_DROP';

export type StageModifiers = {
  stageLineTarget?: number;
  gravityTier?: number;
};

export type EngineAction =
  | GameAction
  | { type: 'TICK'; dt: number }
  | ({ type: 'RESTART'; level?: number; stage?: number } & StageModifiers)
  | { type: 'RETRY_STAGE' }
  | ({ type: 'NEXT_STAGE'; level?: number; stage?: number } & StageModifiers)
  | { type: 'DAS'; direction: -1 | 0 | 1 }
  | { type: 'ENTER_BONUS' }
  | { type: 'EXIT_BONUS' }
  | {
      type: 'UPDATE_PLAY_PROFILE';
      gameDifficulty: GameDifficulty;
      gravityScale: number;
      dasDelayMs: number;
      arrIntervalMs: number;
      stageLineTargetOverride?: number;
      gravityTierOverride?: number;
    };

export type BoardCell = TetrominoType | null;

export type GameStats = {
  score: number;
  level: number;
  stage: number;
  lines: number;
  lineTarget: number;
  gravityTier?: number;
  bonusMode?: boolean;
  bonusTimerSec?: number;
  bonusMultiplier?: number;
};

/** Casual (easy) — classic 8×16. */
export const BOARD_WIDTH_CASUAL = 8;
/** Standard and pro playfield width. */
export const BOARD_WIDTH_STANDARD = 10;

/** @deprecated Use getBoardWidth() or board[0].length from game state. */
export const BOARD_WIDTH = BOARD_WIDTH_STANDARD;

/** Casual (easy) playfield height. */
export const BOARD_HEIGHT_CASUAL = 16;
/** Standard and pro playfield height. */
export const BOARD_HEIGHT_STANDARD = 18;

/** @deprecated Use getBoardHeight() or board.length from game state. */
export const BOARD_HEIGHT = BOARD_HEIGHT_STANDARD;

export const VALID_BOARD_WIDTHS = [
  BOARD_WIDTH_CASUAL,
  BOARD_WIDTH_STANDARD,
] as const;

export const VALID_BOARD_HEIGHTS = [
  BOARD_HEIGHT_CASUAL,
  BOARD_HEIGHT_STANDARD,
] as const;

export function getBoardWidth(difficulty: GameDifficulty): number {
  return difficulty === 'casual' ? BOARD_WIDTH_CASUAL : BOARD_WIDTH_STANDARD;
}

export function getBoardHeight(difficulty: GameDifficulty): number {
  return difficulty === 'casual'
    ? BOARD_HEIGHT_CASUAL
    : BOARD_HEIGHT_STANDARD;
}

export const MINI_BOARD_SIZE = 4;

export function computeCellSize(
  availableWidth: number,
  availableHeight: number,
  boardHeight: number = BOARD_HEIGHT_STANDARD,
  boardWidth: number = BOARD_WIDTH_STANDARD,
): number {
  return Math.max(
    Math.floor(
      Math.min(
        availableWidth / boardWidth,
        availableHeight / boardHeight,
      ),
    ),
    1,
  );
}

/** Side-HUD + bottom tutorial layout (casual / legacy 6c9dd4f sizing). */
export type CasualPlayLayoutMetrics = {
  sectionWidth: number;
  sectionHeight: number;
  tutorialLayoutHeight: number;
  hudWidth?: number;
  playGap?: number;
  boardBorder?: number;
  bottomLift?: number;
  boardRows?: number;
  boardCols?: number;
};

export function computeCasualPlayCellSize({
  sectionWidth,
  sectionHeight,
  tutorialLayoutHeight,
  hudWidth = 72,
  playGap = 8,
  boardBorder = 14,
  bottomLift = 24,
  boardRows = BOARD_HEIGHT_CASUAL,
  boardCols = BOARD_WIDTH_CASUAL,
}: CasualPlayLayoutMetrics): number {
  const boardInnerWidth = sectionWidth - hudWidth - playGap - boardBorder;
  const playAreaHeight = sectionHeight - tutorialLayoutHeight - bottomLift;
  const boardInnerHeight = playAreaHeight - boardBorder;
  return computeCellSize(
    boardInnerWidth,
    Math.max(boardInnerHeight, 120),
    boardRows,
    boardCols,
  );
}
