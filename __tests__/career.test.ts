import { applyStageResult, DEFAULT_CAREER_STATE } from '../src/career/careerProgress';
import { getPromotionStagePosition } from '../src/career/careerRules';

describe('career progress', () => {
  it('counts sequential stage clears toward promotion', () => {
    let state = DEFAULT_CAREER_STATE;

    for (let stage = 1; stage <= 2; stage += 1) {
      const result = applyStageResult(state, {
        cleared: true,
        campaignLevel: 1,
        campaignStage: stage,
      });
      expect(result.promoted).toBeNull();
      expect(result.nextState.promotionWins).toBe(stage);
      state = result.nextState;
    }

    const promoted = applyStageResult(state, {
      cleared: true,
      campaignLevel: 1,
      campaignStage: 3,
    });
    expect(promoted.promoted).toBe('staff');
    expect(promoted.nextState.rank).toBe('staff');
    expect(promoted.nextState.promotionWins).toBe(0);
  });

  it('ignores clears that skip ahead in the sequence', () => {
    const result = applyStageResult(DEFAULT_CAREER_STATE, {
      cleared: true,
      campaignLevel: 1,
      campaignStage: 2,
    });

    expect(result.unchanged).toBe(true);
    expect(result.nextState.promotionWins).toBe(0);
  });

  it('keeps progress on game over without requiring consecutive clears', () => {
    const state = { ...DEFAULT_CAREER_STATE, promotionWins: 2 };
    const result = applyStageResult(state, {
      cleared: false,
      campaignLevel: 1,
      campaignStage: 3,
    });

    expect(result.lost).toBe(true);
    expect(result.nextState.promotionWins).toBe(2);
    expect(result.nextState.rank).toBe('intern');
  });

  it('starts each rank at its chapter level, stage 1', () => {
    expect(getPromotionStagePosition('intern', 0)).toEqual({ level: 1, stage: 1 });
    expect(getPromotionStagePosition('staff', 0)).toEqual({ level: 2, stage: 1 });
    expect(getPromotionStagePosition('deputy', 0)).toEqual({ level: 3, stage: 1 });
    expect(getPromotionStagePosition('executive', 0)).toEqual({ level: 5, stage: 1 });
  });

  it('wraps long promotion tracks across campaign levels', () => {
    expect(getPromotionStagePosition('assistant', 4)).toEqual({ level: 2, stage: 5 });
    expect(getPromotionStagePosition('assistant', 5)).toEqual({ level: 3, stage: 1 });
  });
});
