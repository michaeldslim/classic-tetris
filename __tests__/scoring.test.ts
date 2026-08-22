import { computeLineClearScore } from '../src/game/scoring';

describe('score', () => {
  it('returns zero for no lines cleared', () => {
    expect(computeLineClearScore(0, 5)).toBe(0);
  });

  it('applies NES-style multipliers at level 1', () => {
    expect(computeLineClearScore(1, 1)).toBe(100);
    expect(computeLineClearScore(2, 1)).toBe(300);
    expect(computeLineClearScore(3, 1)).toBe(500);
    expect(computeLineClearScore(4, 1)).toBe(800);
  });

  it('scales with level', () => {
    expect(computeLineClearScore(4, 3)).toBe(2400);
    expect(computeLineClearScore(1, 9)).toBe(900);
  });

  it('caps tetris bonus at four lines', () => {
    expect(computeLineClearScore(5, 2)).toBe(1600);
  });
});
