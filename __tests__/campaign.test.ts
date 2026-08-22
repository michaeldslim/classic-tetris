import {
  getNextStage,
  getStageLineTarget,
  isStageComplete,
  MAX_CAMPAIGN_LEVEL,
  STAGES_PER_LEVEL,
} from '../src/game/campaign';

describe('campaign', () => {
  it('defines line targets for five stages', () => {
    expect(getStageLineTarget(1)).toBe(3);
    expect(getStageLineTarget(2)).toBe(5);
    expect(getStageLineTarget(3)).toBe(10);
    expect(getStageLineTarget(4)).toBe(10);
    expect(getStageLineTarget(5)).toBe(12);
  });

  it('detects stage completion by target lines', () => {
    expect(isStageComplete(2, 1)).toBe(false);
    expect(isStageComplete(3, 1)).toBe(true);
    expect(isStageComplete(12, 5)).toBe(true);
  });

  it('advances stage within a level', () => {
    expect(getNextStage(1, 1)).toEqual({ level: 1, stage: 2 });
    expect(getNextStage(2, 4)).toEqual({ level: 2, stage: 5 });
  });

  it('advances to next level after stage five', () => {
    expect(getNextStage(1, 5)).toEqual({ level: 2, stage: 1 });
    expect(getNextStage(4, 5)).toEqual({ level: 5, stage: 1 });
  });

  it('returns null after final stage', () => {
    expect(getNextStage(MAX_CAMPAIGN_LEVEL, STAGES_PER_LEVEL)).toBeNull();
  });
});
