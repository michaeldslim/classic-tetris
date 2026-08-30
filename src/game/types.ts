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

export type GameState = {
  board: BoardCell[][];
  active: ActivePiece | null;
  next: TetrominoType;
  bag: TetrominoType[];
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
};

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
  | { type: 'DAS'; direction: -1 | 0 | 1 };

export type BoardCell = TetrominoType | null;

export type GameStats = {
  score: number;
  level: number;
  stage: number;
  lines: number;
  lineTarget: number;
  gravityTier?: number;
};

export const BOARD_WIDTH = 8;
export const BOARD_HEIGHT = 16;
export const MINI_BOARD_SIZE = 4;

export function computeCellSize(
  availableWidth: number,
  availableHeight: number,
): number {
  return Math.max(
    Math.floor(
      Math.min(
        availableWidth / BOARD_WIDTH,
        availableHeight / BOARD_HEIGHT,
      ),
    ),
    1,
  );
}
