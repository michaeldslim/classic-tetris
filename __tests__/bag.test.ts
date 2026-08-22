import { createShuffledBag, drawFromBag } from '../src/game/bag';
import { tetrominoTypes } from '../src/game/tetrominoes';

describe('7-bag randomizer', () => {
  it('creates a bag with all seven tetromino types', () => {
    const bag = createShuffledBag();
    expect(bag).toHaveLength(7);
    expect([...bag].sort()).toEqual([...tetrominoTypes].sort());
  });

  it('draws each piece once before refilling', () => {
    let queue = [...tetrominoTypes];
    const drawn = [];

    for (let i = 0; i < 7; i++) {
      const result = drawFromBag(queue);
      drawn.push(result.piece);
      queue = result.bag;
    }

    expect(drawn.sort()).toEqual([...tetrominoTypes].sort());
    expect(queue).toHaveLength(0);
  });

  it('refills automatically when the bag is empty', () => {
    const first = drawFromBag([]);
    expect(tetrominoTypes.includes(first.piece)).toBe(true);
    expect(first.bag.length).toBe(6);
  });
});
