import { drawFromBag } from './bag';
import { isValidPosition } from './board';
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

function endBonusFromBlockedSpawn(state: GameState): GameState {
  if (state.mode !== 'bonus' || !state.bonus) {
    return state;
  }

  const lineTarget = state.stageLineTargetOverride ?? state.bonus.lines;

  return {
    ...state,
    active: null,
    pendingSpawn: false,
    spawnDelayMs: 0,
    gameOver: false,
    bonus: {
      ...state.bonus,
      ended: true,
      success: state.bonus.lines >= lineTarget,
    },
    ...resetDasState(state),
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
    if (state.mode === 'bonus') {
      return endBonusFromBlockedSpawn({
        ...state,
        next,
        bag,
      });
    }

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
