import {
  getDifficultyProfile,
  resolveCareerStageModifiers,
  resolveHiddenLineTarget,
  resolvePromotionLineTarget,
  resolvePromotionStageModifiers,
} from '../src/difficulty/difficultyProfile';

describe('difficultyProfile', () => {
  it('keeps casual promotion targets aligned with base campaign', () => {
    expect(resolvePromotionLineTarget('casual', 1)).toBe(3);
    expect(resolvePromotionLineTarget('casual', 5)).toBe(12);
    expect(getDifficultyProfile('casual').gravityScale).toBe(2);
  });

  it('raises standard and pro promotion line targets', () => {
    expect(resolvePromotionLineTarget('standard', 3)).toBe(11);
    expect(resolvePromotionLineTarget('pro', 5)).toBe(15);
  });

  it('applies hidden stage line bonuses including ceo H2 pro', () => {
    expect(resolveHiddenLineTarget('standard', 18, true)).toBe(20);
    expect(resolveHiddenLineTarget('pro', 18, true)).toBe(23);
  });

  it('resolves career hidden stage modifiers', () => {
    const mods = resolveCareerStageModifiers('pro', {
      level: 5,
      stage: 5,
      lineTarget: 18,
      gravityTier: 5,
      isHidden: true,
      hiddenRank: 'ceo',
      hiddenIndex: 2,
    });

    expect(mods.lineTarget).toBe(23);
    expect(mods.gravityTier).toBeGreaterThanOrEqual(5);
  });

  it('increases gravity tier for pro on late promotion stages', () => {
    const casual = resolvePromotionStageModifiers('casual', 4);
    const pro = resolvePromotionStageModifiers('pro', 4);
    expect(pro.gravityTier).toBeGreaterThan(casual.gravityTier);
  });
});
