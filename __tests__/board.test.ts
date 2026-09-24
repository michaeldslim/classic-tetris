import {
  clearLines,
  createEmptyBoard,
  findFullLineRows,
  isValidPosition,
  mergePiece,
} from '../src/game/board';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../src/game/types';

describe('board', () => {
  it('creates an empty 10x18 grid', () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(BOARD_HEIGHT);
    expect(board[0]).toHaveLength(BOARD_WIDTH);
    expect(board.every((row) => row.every((cell) => cell === null))).toBe(true);
  });

  it('detects collision with locked cells', () => {
    const board = createEmptyBoard();
    board[5]![3] = 'T';

    expect(isValidPosition(board, 'O', 0, 2, 3)).toBe(true);
    expect(isValidPosition(board, 'O', 0, 2, 4)).toBe(false);
  });

  it('merges a piece into the board', () => {
    const board = createEmptyBoard();
    const merged = mergePiece(board, 'I', 0, 2, 0);
    const filled = merged.flat().filter((cell) => cell === 'I');

    expect(filled).toHaveLength(4);
  });

  it('rejects out-of-bounds horizontal placement for O', () => {
    expect(isValidPosition(createEmptyBoard(), 'O', 0, 8, 10)).toBe(false);
    expect(isValidPosition(createEmptyBoard(), 'O', 0, 7, 10)).toBe(true);
  });

  it('merges a full O piece on the right edge', () => {
    const board = createEmptyBoard();
    const merged = mergePiece(board, 'O', 0, 7, 13);
    const filled = merged.flat().filter((cell) => cell === 'O');

    expect(filled).toHaveLength(4);
    expect(merged[13]![8]).toBe('O');
    expect(merged[13]![9]).toBe('O');
    expect(merged[14]![8]).toBe('O');
    expect(merged[14]![9]).toBe('O');
  });

  it('finds full line row indices', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_WIDTH; x++) {
      board[10]![x] = 'T';
    }

    expect(findFullLineRows(board)).toEqual([10]);
    expect(findFullLineRows(createEmptyBoard())).toEqual([]);
  });

  it('clears full lines and adds empty rows on top', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < BOARD_WIDTH; x++) {
      board[BOARD_HEIGHT - 1]![x] = 'I';
      board[BOARD_HEIGHT - 2]![x] = 'J';
    }

    const { board: cleared, linesCleared } = clearLines(board);

    expect(linesCleared).toBe(2);
    expect(cleared[0]!.every((cell) => cell === null)).toBe(true);
    expect(cleared[1]!.every((cell) => cell === null)).toBe(true);
    expect(cleared[BOARD_HEIGHT - 1]!.every((cell) => cell === null)).toBe(
      true,
    );
  });
});
