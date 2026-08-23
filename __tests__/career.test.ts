import { applyStageResult, DEFAULT_CAREER_STATE } from '../src/career/careerProgress';

describe('career progress', () => {
  it('counts stage clears toward promotion', () => {
    let state = DEFAULT_CAREER_STATE;

    for (let index = 0; index < 2; index += 1) {
      const result = applyStageResult(state, { cleared: true, campaignLevel: 1 });
      expect(result.promoted).toBeNull();
      expect(result.nextState.promotionWins).toBe(index + 1);
      state = result.nextState;
    }

    const promoted = applyStageResult(state, { cleared: true, campaignLevel: 1 });
    expect(promoted.promoted).toBe('staff');
    expect(promoted.nextState.rank).toBe('staff');
    expect(promoted.nextState.promotionWins).toBe(0);
  });

  it('keeps progress on game over', () => {
    const state = { ...DEFAULT_CAREER_STATE, promotionWins: 2 };
    const result = applyStageResult(state, { cleared: false, campaignLevel: 1 });

    expect(result.lost).toBe(true);
    expect(result.nextState.promotionWins).toBe(2);
    expect(result.nextState.rank).toBe('intern');
  });

  it('requires minimum campaign level from deputy onward', () => {
    const state = { ...DEFAULT_CAREER_STATE, rank: 'deputy' as const, promotionWins: 0 };
    const tooLow = applyStageResult(state, { cleared: true, campaignLevel: 2 });

    expect(tooLow.noProgressLevel).toBe(true);
    expect(tooLow.nextState.promotionWins).toBe(0);

    const valid = applyStageResult(state, { cleared: true, campaignLevel: 3 });
    expect(valid.noProgressLevel).toBe(false);
    expect(valid.nextState.promotionWins).toBe(1);
  });
});
