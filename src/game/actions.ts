import { isValidPosition } from './board';
import { lockActivePiece } from './lifecycle';
import { trySrsRotation } from './srs';
import {
  ARR_INTERVAL_MS,
  DAS_DELAY_MS,
} from './speed';
import type { ActivePiece, GameState } from './types';
import type { GameAction } from './types';

export function tryHorizontalMove(
  state: GameState,
  deltaX: number,
  scoreBonus = 0,
): GameState {
  if (!state.active) {
    return state;
  }

  const { type, x, y, rotation } = state.active;
  const nextX = x + deltaX;

  if (!isValidPosition(state.board, type, rotation, nextX, y)) {
    return state;
  }

  return {
    ...state,
    active: { ...state.active, x: nextX },
    score: state.score + scoreBonus,
  };
}

function tryMove(
  state: GameState,
  deltaX: number,
  deltaY: number,
  scoreBonus = 0,
): GameState {
  if (!state.active) {
    return state;
  }

  const { type, x, y, rotation } = state.active;
  const nextX = x + deltaX;
  const nextY = y + deltaY;

  if (!isValidPosition(state.board, type, rotation, nextX, nextY)) {
    return state;
  }

  return {
    ...state,
    active: { ...state.active, x: nextX, y: nextY },
    score: state.score + scoreBonus,
  };
}

function tryRotate(state: GameState): GameState {
  if (!state.active) {
    return state;
  }

  const { type, x, y, rotation } = state.active;
  const nextRotation = ((rotation + 1) % 4) as ActivePiece['rotation'];
  const result = trySrsRotation(
    state.board,
    type,
    rotation,
    nextRotation,
    x,
    y,
  );

  if (!result) {
    return state;
  }

  return {
    ...state,
    active: { ...state.active, ...result },
  };
}

function trySoftDrop(state: GameState): GameState {
  if (!state.active) {
    return state;
  }

  const moved = tryMove(state, 0, 1, 1);
  if (moved.active?.y !== state.active.y) {
    return resetDas(moved);
  }

  return lockActivePiece(state);
}

function hardDrop(state: GameState): GameState {
  if (!state.active) {
    return state;
  }

  let { x, y, rotation, type } = state.active;
  let dropDistance = 0;

  while (isValidPosition(state.board, type, rotation, x, y + 1)) {
    y += 1;
    dropDistance += 1;
  }

  const droppedState: GameState = {
    ...state,
    active: { ...state.active, y },
    score: state.score + dropDistance * 2,
  };

  return lockActivePiece(droppedState);
}

function resetDas(state: GameState): GameState {
  return {
    ...state,
    dasDirection: 0,
    dasAccumulator: 0,
    dasCharged: false,
  };
}

function withDasDirection(
  state: GameState,
  direction: -1 | 1,
): GameState {
  const moved = tryHorizontalMove(state, direction);
  if (moved.active?.x === state.active?.x) {
    return state;
  }

  return {
    ...moved,
    dasDirection: direction,
    dasAccumulator: 0,
    dasCharged: false,
  };
}

export function applyDasDirection(
  state: GameState,
  direction: -1 | 0 | 1,
): GameState {
  if (state.gameOver || !state.active) {
    return state;
  }

  if (direction === 0) {
    return resetDas(state);
  }

  if (state.dasDirection === direction) {
    return state;
  }

  return withDasDirection(state, direction);
}

export function processDas(state: GameState, dt: number): GameState {
  if (state.dasDirection === 0 || !state.active) {
    return state;
  }

  let dasAccumulator = state.dasAccumulator + dt;
  let nextState = state;

  if (!state.dasCharged) {
    if (dasAccumulator < DAS_DELAY_MS) {
      return { ...state, dasAccumulator };
    }

    dasAccumulator -= DAS_DELAY_MS;
    nextState = tryHorizontalMove(state, state.dasDirection);
    if (nextState.active?.x === state.active.x) {
      return resetDas(state);
    }

    nextState = {
      ...nextState,
      dasCharged: true,
      dasAccumulator,
      dasDirection: state.dasDirection,
    };
  } else {
    nextState = { ...state, dasAccumulator };
  }

  while (nextState.dasAccumulator >= ARR_INTERVAL_MS) {
    nextState = {
      ...nextState,
      dasAccumulator: nextState.dasAccumulator - ARR_INTERVAL_MS,
    };
    const moved = tryHorizontalMove(nextState, nextState.dasDirection);
    if (moved.active?.x === nextState.active?.x) {
      return resetDas(nextState);
    }
    nextState = {
      ...moved,
      dasDirection: nextState.dasDirection,
      dasCharged: true,
      dasAccumulator: nextState.dasAccumulator,
    };
  }

  return nextState;
}

export function applyAction(state: GameState, action: GameAction): GameState {
  if (state.gameOver || !state.active) {
    return state;
  }

  switch (action) {
    case 'LEFT':
      return resetDas(tryHorizontalMove(state, -1));
    case 'RIGHT':
      return resetDas(tryHorizontalMove(state, 1));
    case 'SOFT_DROP':
      return trySoftDrop(state);
    case 'ROTATE':
      return tryRotate(state);
    case 'HARD_DROP':
      return hardDrop(state);
    default:
      return state;
  }
}

export function applyGravityStep(state: GameState): GameState {
  if (!state.active) {
    return state;
  }

  const { type, x, y, rotation } = state.active;

  if (isValidPosition(state.board, type, rotation, x, y + 1)) {
    return resetDas({
      ...state,
      active: { ...state.active, y: y + 1 },
    });
  }

  return lockActivePiece(state);
}

export function getGhostPiece(state: GameState): ActivePiece | null {
  if (!state.active) {
    return null;
  }

  let ghostY = state.active.y;
  const { type, x, rotation } = state.active;

  while (isValidPosition(state.board, type, rotation, x, ghostY + 1)) {
    ghostY += 1;
  }

  if (ghostY === state.active.y) {
    return null;
  }

  return { ...state.active, y: ghostY };
}
