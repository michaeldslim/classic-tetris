import type { TetrominoType } from '../theme/colors';
import { drawFromBag, createShuffledBag } from './bag';
import {
  isValidPosition,
  mergePiece,
  clearLines,
  createEmptyBoard,
  findFullLineRows,
} from './board';
import { getNextStage, isStageComplete } from './campaign';
import { computeLineClearScore } from './scoring';
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
      gameOver: true,
      ...resetDasState(state),
    };
  }

  return {
    ...state,
    next,
    bag,
    active,
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

  if (isStageComplete(lines, state.stage)) {
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
    return spawnNextPiece({
      ...state,
      board: mergedBoard,
      active: null,
    });
  }

  return {
    ...state,
    board: mergedBoard,
    active: null,
    lineClear: { rows: fullRows, elapsed: 0 },
    ...resetDasState(state),
  };
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
  });
}

export { getGravityInterval } from './speed';
