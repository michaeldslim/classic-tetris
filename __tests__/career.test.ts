import { applyStageResult, DEFAULT_CAREER_STATE, getResetStateAfterChairman } from '../src/career/careerProgress';
import {
  formatPromotionStagePath,
  getNextStageTargetCopy,
  getPromotionStagePathCopy,
} from '../src/career/careerLabels';
import { getCareerStageTarget, getPromotionStagePath, getPromotionStagePosition } from '../src/career/careerRules';
import { getHiddenStagePosition, HIDDEN_STAGE_PATH, TOTAL_HIDDEN_STAGES } from '../src/career/hiddenStages';
import { parseCareerState } from '../src/career/careerStorage';

const t = (key: string, params?: Record<string, string | number>) => {
  if (key === 'career.nextStage' && params) {
    return `Next: Level ${params.level} · Stage ${params.stage}`;
  }
  if (key === 'career.ladder.stagePath' && params) {
    return `Path: ${params.path}`;
  }
  if (key === 'career.nextHiddenStage' && params) {
    return `Next hidden: ${params.rank} H${params.index}`;
  }
  if (key === 'career.hiddenBadge' && params) {
    return `${params.rank} · Hidden ${params.current}/${params.required}`;
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

  it('enters hidden phase when promoting to ceo', () => {
    let state = {
      ...DEFAULT_CAREER_STATE,
      rank: 'executive' as const,
      promotionWins: 4,
      highestRankAchieved: 'executive' as const,
    };

    const promoted = applyStageResult(state, {
      cleared: true,
      campaignLevel: 5,
      campaignStage: 5,
    });

    expect(promoted.promoted).toBe('ceo');
    expect(promoted.nextState.rank).toBe('ceo');
    expect(promoted.nextState.phase).toBe('hidden');
    expect(promoted.nextState.hiddenWins).toBe(0);
    expect(promoted.nextState.promotionWins).toBe(0);
  });

  it('counts hidden stage clears toward chairman', () => {
    let state = {
      ...DEFAULT_CAREER_STATE,
      rank: 'ceo' as const,
      phase: 'hidden' as const,
      hiddenWins: 0,
      highestRankAchieved: 'ceo' as const,
    };

    for (let index = 0; index < TOTAL_HIDDEN_STAGES - 1; index += 1) {
      const hidden = HIDDEN_STAGE_PATH[index]!;
      const result = applyStageResult(state, {
        cleared: true,
        campaignLevel: hidden.level,
        campaignStage: hidden.stage,
      });

      expect(result.promoted).toBeNull();
      expect(result.nextState.hiddenWins).toBe(index + 1);
      expect(result.nextState.rank).toBe('ceo');
      state = result.nextState;
    }

    const finalHidden = HIDDEN_STAGE_PATH[TOTAL_HIDDEN_STAGES - 1]!;
    const chairman = applyStageResult(state, {
      cleared: true,
      campaignLevel: finalHidden.level,
      campaignStage: finalHidden.stage,
    });

    expect(chairman.promoted).toBe('chairman');
    expect(chairman.nextState.rank).toBe('chairman');
    expect(chairman.nextState.phase).toBe('complete');
    expect(chairman.nextState.hiddenWins).toBe(TOTAL_HIDDEN_STAGES);
  });

  it('ignores hidden clears before ceo hidden phase', () => {
    const firstHidden = getHiddenStagePosition(0)!;
    const result = applyStageResult(DEFAULT_CAREER_STATE, {
      cleared: true,
      campaignLevel: firstHidden.level,
      campaignStage: firstHidden.stage,
    });

    expect(result.unchanged).toBe(true);
    expect(result.nextState.hiddenWins).toBe(0);
  });

  it('ignores out-of-order hidden clears', () => {
    const state = {
      ...DEFAULT_CAREER_STATE,
      rank: 'ceo' as const,
      phase: 'hidden' as const,
      hiddenWins: 0,
      highestRankAchieved: 'ceo' as const,
    };
    const secondHidden = HIDDEN_STAGE_PATH[1]!;
    const result = applyStageResult(state, {
      cleared: true,
      campaignLevel: secondHidden.level,
      campaignStage: secondHidden.stage,
    });

    expect(result.unchanged).toBe(true);
  });

  it('resets promotion track after chairman while keeping highest rank', () => {
    const reset = getResetStateAfterChairman({
      ...DEFAULT_CAREER_STATE,
      rank: 'chairman',
      phase: 'complete',
      hiddenWins: TOTAL_HIDDEN_STAGES,
      highestRankAchieved: 'chairman',
    });

    expect(reset.rank).toBe('intern');
    expect(reset.phase).toBe('promotion');
    expect(reset.promotionWins).toBe(0);
    expect(reset.hiddenWins).toBe(0);
    expect(reset.highestRankAchieved).toBe('chairman');
  });

  it('resolves hidden stage target from career state', () => {
    const hiddenState = {
      ...DEFAULT_CAREER_STATE,
      rank: 'ceo' as const,
      phase: 'hidden' as const,
      hiddenWins: 2,
      highestRankAchieved: 'ceo' as const,
    };

    expect(getCareerStageTarget(hiddenState)).toMatchObject({
      level: 3,
      stage: 3,
      isHidden: true,
      hiddenRank: 'manager',
    });
  });

  it('migrates legacy ceo saves into hidden phase', () => {
    const migrated = parseCareerState(
      JSON.stringify({
        rank: 'ceo',
        promotionWins: 0,
        highestRankAchieved: 'ceo',
      }),
    );

    expect(migrated.phase).toBe('hidden');
    expect(migrated.hiddenWins).toBe(0);
  });
});
