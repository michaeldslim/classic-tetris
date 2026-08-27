import {
  getLineClearDuration,
  getLineClearTier,
  isLineClearFlashBright,
} from '../src/game/lineClearFx';

describe('lineClearFx', () => {
  it('maps line counts to tiers and escalating durations', () => {
    expect(getLineClearTier(1)).toBe(1);
    expect(getLineClearTier(4)).toBe(4);
    expect(getLineClearDuration(1)).toBeLessThan(getLineClearDuration(4));
  });

  it('uses faster flash cycles for bigger clears', () => {
    expect(getLineClearDuration(1)).toBe(360);
    expect(getLineClearDuration(4)).toBe(680);
    expect(isLineClearFlashBright(45, 4)).toBe(false);
    expect(isLineClearFlashBright(45, 1)).toBe(true);
  });
});
