import {
  clearLines,
  createEmptyBoard,
  findFullLineRows,
  isValidPosition,
  mergePiece,
} from '../src/game/board';
import {
  BOARD_HEIGHT_CASUAL,
  BOARD_HEIGHT_STANDARD,
  BOARD_WIDTH_CASUAL,
  BOARD_WIDTH_STANDARD,
  computeCasualPlayCellSize,
} from '../src/game/types';

describe('board', () => {
  it('creates an empty 8x16 grid on casual difficulty', () => {
    const board = createEmptyBoard('casual');
    expect(board).toHaveLength(BOARD_HEIGHT_CASUAL);
    expect(board[0]).toHaveLength(BOARD_WIDTH_CASUAL);
    expect(board.every((row) => row.every((cell) => cell === null))).toBe(true);
  });

  it('creates an empty 10x18 grid on standard difficulty', () => {
    const board = createEmptyBoard('standard');
    expect(board).toHaveLength(BOARD_HEIGHT_STANDARD);
    expect(board[0]).toHaveLength(BOARD_WIDTH_STANDARD);
  });

  it('computes casual side-HUD cell size from section metrics', () => {
    const cell = computeCasualPlayCellSize({
      sectionWidth: 360,
      sectionHeight: 520,
      tutorialLayoutHeight: 80,
    });
    expect(cell).toBeGreaterThan(0);
    expect(cell).toBe(
      Math.min(
        Math.floor((360 - 72 - 8 - 14) / BOARD_WIDTH_CASUAL),
        Math.floor((520 - 80 - 24 - 14) / BOARD_HEIGHT_CASUAL),
      ),
    );
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
    const board = createEmptyBoard('standard');
    expect(isValidPosition(board, 'O', 0, 8, 10)).toBe(false);
    expect(isValidPosition(board, 'O', 0, 7, 10)).toBe(true);
  });

  it('merges a full O piece on the right edge', () => {
    const board = createEmptyBoard('standard');
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
    for (let x = 0; x < board[0]!.length; x++) {
      board[10]![x] = 'T';
    }

    expect(findFullLineRows(board)).toEqual([10]);
    expect(findFullLineRows(createEmptyBoard())).toEqual([]);
  });

  it('clears full lines and adds empty rows on top', () => {
    const board = createEmptyBoard('standard');
    const height = board.length;
    for (let x = 0; x < board[0]!.length; x++) {
      board[height - 1]![x] = 'I';
      board[height - 2]![x] = 'J';
    }

    const { board: cleared, linesCleared } = clearLines(board);

    expect(linesCleared).toBe(2);
    expect(cleared[0]!.every((cell) => cell === null)).toBe(true);
    expect(cleared[1]!.every((cell) => cell === null)).toBe(true);
    expect(cleared[height - 1]!.every((cell) => cell === null)).toBe(true);
  });
});
