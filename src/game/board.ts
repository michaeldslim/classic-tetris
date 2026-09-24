import type { GameDifficulty } from '../settings/types';
import { DEFAULT_GAME_DIFFICULTY } from '../settings/types';
import type { TetrominoType } from '../theme/colors';
import { tetrominoShapes } from './tetrominoes';
import {
  getBoardHeight,
  getBoardWidth,
  type ActivePiece,
  type BoardCell,
  type GameState,
} from './types';

function boardWidth(board: BoardCell[][]): number {
  return board[0]?.length ?? getBoardWidth('standard');
}

function boardHeight(board: BoardCell[][]): number {
  return board.length;
}

export function createEmptyBoard(
  difficulty: GameDifficulty = DEFAULT_GAME_DIFFICULTY,
): BoardCell[][] {
  const height = getBoardHeight(difficulty);
  const width = getBoardWidth(difficulty);
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => null),
  );
}

export function resizeBoardToHeight(
  board: BoardCell[][],
  targetHeight: number,
): BoardCell[][] {
  const width = boardWidth(board);
  const currentHeight = boardHeight(board);
  if (currentHeight === targetHeight) {
    return board.map((row) => [...row]);
  }

  if (targetHeight > currentHeight) {
    const padRows = targetHeight - currentHeight;
    const padding = Array.from({ length: padRows }, () =>
      Array.from({ length: width }, () => null),
    );
    return [...padding, ...board.map((row) => [...row])];
  }

  const trimRows = currentHeight - targetHeight;
  return board.slice(trimRows).map((row) => [...row]);
}

export function resizeBoardToWidth(
  board: BoardCell[][],
  targetWidth: number,
): BoardCell[][] {
  const currentWidth = boardWidth(board);
  if (currentWidth === targetWidth) {
    return board.map((row) => [...row]);
  }

  if (targetWidth > currentWidth) {
    const padLeft = targetWidth - currentWidth;
    return board.map((row) => [
      ...Array.from({ length: padLeft }, () => null),
      ...row,
    ]);
  }

  const trimLeft = currentWidth - targetWidth;
  return board.map((row) => row.slice(trimLeft));
}

/** Match locked cells and active piece to the playfield for the current difficulty. */
export function ensureBoardForDifficulty(state: GameState): GameState {
  const targetHeight = getBoardHeight(state.gameDifficulty);
  const targetWidth = getBoardWidth(state.gameDifficulty);
  const currentHeight = boardHeight(state.board);
  const currentWidth = boardWidth(state.board);

  if (currentHeight === targetHeight && currentWidth === targetWidth) {
    return state;
  }

  const heightDelta = targetHeight - currentHeight;
  const widthDelta = targetWidth - currentWidth;

  let nextBoard = resizeBoardToHeight(state.board, targetHeight);
  nextBoard = resizeBoardToWidth(nextBoard, targetWidth);

  let active: ActivePiece | null = state.active;

  if (active) {
    active = {
      ...active,
      x: active.x + widthDelta,
      y: active.y + heightDelta,
    };
    if (
      !isValidPosition(nextBoard, active.type, active.rotation, active.x, active.y)
    ) {
      active = null;
    }
  }

  return { ...state, board: nextBoard, active };
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
  const width = boardWidth(board);
  const height = boardHeight(board);
  for (const { x, y } of getPieceCells(type, rotation, pieceX, pieceY)) {
    if (x < 0 || x >= width || y >= height) {
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
  const width = boardWidth(board);
  const height = boardHeight(board);

  for (const { x, y } of getPieceCells(type, rotation, pieceX, pieceY)) {
    if (y < 0 || y >= height || x < 0 || x >= width) {
      continue;
    }
    nextBoard[y][x] = type;
  }

  return nextBoard;
}

export function clearLines(board: BoardCell[][]): {
  board: BoardCell[][];
  linesCleared: number;
} {
  const width = boardWidth(board);
  const height = boardHeight(board);
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = height - remaining.length;

  while (remaining.length < height) {
    remaining.unshift(Array.from({ length: width }, () => null));
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
