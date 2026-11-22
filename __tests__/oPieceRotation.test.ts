import { createInitialState, reduce } from '../src/game/engine';
import {
  createEmptyBoard,
  getPieceCells,
  isValidPosition,
} from '../src/game/board';

describe('O piece rotation footprint', () => {
  it('ignores ROTATE input (O does not spin)', () => {
    const state = {
      ...createInitialState(),
      active: { type: 'O' as const, x: 3, y: 4, rotation: 0 as const },
    };

    const next = reduce(state, 'ROTATE');

    expect(next.active).toEqual(state.active);
  });
  it('keeps the same board cells for every rotation at spawn', () => {
    const board = createEmptyBoard('standard');
    const atSpawn = getPieceCells('O', 0, 3, 0);

    for (let rot = 0; rot < 4; rot++) {
      const cells = getPieceCells('O', rot, 3, 0);
      expect(cells).toEqual(atSpawn);
      expect(isValidPosition(board, 'O', rot, 3, 0)).toBe(true);
    }
  });

  it('keeps the same board cells for every rotation at the right wall', () => {
    const board = createEmptyBoard('standard');
    const atWall = getPieceCells('O', 0, 7, 10);

    for (let rot = 0; rot < 4; rot++) {
      const cells = getPieceCells('O', rot, 7, 10);
      expect(cells).toEqual(atWall);
      expect(isValidPosition(board, 'O', rot, 7, 10)).toBe(true);
    }
  });

});