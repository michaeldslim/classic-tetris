import { applyStageResult, DEFAULT_CAREER_STATE } from '../src/career/careerProgress';
import {
  formatPromotionStagePath,
  getNextStageTargetCopy,
  getPromotionStagePathCopy,
} from '../src/career/careerLabels';
import { getPromotionStagePath, getPromotionStagePosition } from '../src/career/careerRules';

const t = (key: string, params?: Record<string, string | number>) => {
  if (key === 'career.nextStage' && params) {
    return `Next: Level ${params.level} · Stage ${params.stage}`;
  }
  if (key === 'career.ladder.stagePath' && params) {
    return `Path: ${params.path}`;
  }
  return key;
};

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

  it('formats promotion stage paths for ladder copy', () => {
    expect(formatPromotionStagePath(getPromotionStagePath('intern'))).toBe('L1 S1→S3');
    expect(formatPromotionStagePath(getPromotionStagePath('staff'))).toBe('L2 S1→S5');
    expect(formatPromotionStagePath(getPromotionStagePath('assistant'))).toBe(
      'L2 S1→S5 → L3 S1→S2',
    );
  });

  it('builds next stage target copy from career state', () => {
    expect(
      getNextStageTargetCopy(t, { ...DEFAULT_CAREER_STATE, promotionWins: 2 }),
    ).toBe('Next: Level 1 · Stage 3');
    expect(getPromotionStagePathCopy(t, 'intern')).toBe('Path: L1 S1→S3');
  });
});
