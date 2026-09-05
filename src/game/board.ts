import type { TetrominoType } from '../theme/colors';
import { tetrominoShapes } from './tetrominoes';
import { BOARD_HEIGHT, BOARD_WIDTH, type BoardCell } from './types';

export function createEmptyBoard(): BoardCell[][] {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null),
  );
}

function rotateShape(shape: number[][]): number[][] {
  const size = shape.length;
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => shape[size - 1 - col][row]),
  );
}

export function getRotatedShape(
  type: TetrominoType,
  rotation: number,
): number[][] {
  let shape = tetrominoShapes[type].map((row) => [...row]);
  for (let i = 0; i < rotation % 4; i++) {
    shape = rotateShape(shape);
  }
  return shape;
}

export function getPieceCells(
  type: TetrominoType,
  rotation: number,
  pieceX: number,
  pieceY: number,
): { x: number; y: number }[] {
  const shape = getRotatedShape(type, rotation);
  const cells: { x: number; y: number }[] = [];

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        cells.push({ x: pieceX + x, y: pieceY + y });
      }
    }
  }

  return cells;
}

export function isValidPosition(
  board: BoardCell[][],
  type: TetrominoType,
  rotation: number,
  pieceX: number,
  pieceY: number,
): boolean {
  for (const { x, y } of getPieceCells(type, rotation, pieceX, pieceY)) {
    if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) {
      return false;
    }
    if (y >= 0 && board[y][x] !== null) {
      return false;
    }
  }
  return true;
}

export function mergePiece(
  board: BoardCell[][],
  type: TetrominoType,
  rotation: number,
  pieceX: number,
  pieceY: number,
): BoardCell[][] {
  const nextBoard = board.map((row) => [...row]);

  for (const { x, y } of getPieceCells(type, rotation, pieceX, pieceY)) {
    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
      nextBoard[y][x] = type;
    }
  }

  return nextBoard;
}

export function clearLines(board: BoardCell[][]): {
  board: BoardCell[][];
  linesCleared: number;
} {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_HEIGHT - remaining.length;

  while (remaining.length < BOARD_HEIGHT) {
    remaining.unshift(Array.from({ length: BOARD_WIDTH }, () => null));
  }

  return { board: remaining, linesCleared };
}

export function findFullLineRows(board: BoardCell[][]): number[] {
  const rows: number[] = [];

  for (let y = 0; y < board.length; y++) {
    if (board[y]!.every((cell) => cell !== null)) {
      rows.push(y);
    }
  }

  return rows;
}
