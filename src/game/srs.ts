import type { TetrominoType } from '../theme/colors';
import { isValidPosition } from './board';
import type { BoardCell } from './types';

type KickOffset = readonly [number, number];

/** Guideline SRS wall kick tables (JLSTZ) */
const JLSTZ_KICKS: Record<string, KickOffset[]> = {
  '0>1': [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  '1>2': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  '2>3': [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  '3>0': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  '1>0': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  '2>1': [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  '3>2': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  '0>3': [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
};

/** Guideline SRS wall kick tables (I) */
const I_KICKS: Record<string, KickOffset[]> = {
  '0>1': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  '1>2': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  '2>3': [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  '3>0': [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  '1>0': [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  '2>1': [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  '3>2': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  '0>3': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
};

function getKickTable(type: TetrominoType): Record<string, KickOffset[]> {
  return type === 'I' ? I_KICKS : JLSTZ_KICKS;
}

export function trySrsRotation(
  board: BoardCell[][],
  type: TetrominoType,
  fromRotation: number,
  toRotation: number,
  pieceX: number,
  pieceY: number,
): { x: number; y: number; rotation: 0 | 1 | 2 | 3 } | null {
  if (type === 'O') {
    return {
      x: pieceX,
      y: pieceY,
      rotation: toRotation as 0 | 1 | 2 | 3,
    };
  }

  const clockwise = (toRotation - fromRotation + 4) % 4 === 1;
  const key = clockwise
    ? `${fromRotation}>${toRotation}`
    : `${fromRotation}>${toRotation}`;
  const kicks = getKickTable(type)[key] ?? [[0, 0]];

  for (const [dx, dy] of kicks) {
    const nextX = pieceX + dx;
    const nextY = pieceY + dy;
    if (isValidPosition(board, type, toRotation, nextX, nextY)) {
      return {
        x: nextX,
        y: nextY,
        rotation: toRotation as 0 | 1 | 2 | 3,
      };
    }
  }

  return null;
}
