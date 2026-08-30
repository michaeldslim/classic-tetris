import {
  getHiddenStageGlobalIndex,
  getHiddenStagePath,
  getHiddenStagePosition,
  getHiddenStageStatus,
  HIDDEN_STAGE_COUNTS,
  HIDDEN_STAGE_PATH,
  TOTAL_HIDDEN_STAGES,
} from '../src/career/hiddenStages';

describe('hidden stages', () => {
  it('defines 13 hidden stages across ranks', () => {
    expect(TOTAL_HIDDEN_STAGES).toBe(13);
    expect(HIDDEN_STAGE_PATH).toHaveLength(13);
    expect(HIDDEN_STAGE_COUNTS.staff).toBe(1);
    expect(HIDDEN_STAGE_COUNTS.manager).toBe(2);
    expect(HIDDEN_STAGE_COUNTS.executive).toBe(3);
    expect(HIDDEN_STAGE_COUNTS.ceo).toBe(2);
  });

  it('returns sequential hidden stage positions', () => {
    expect(getHiddenStagePosition(0)).toMatchObject({
      level: 1,
      stage: 4,
      isHidden: true,
      hiddenRank: 'staff',
      hiddenIndex: 1,
      lineTarget: 8,
    });
    expect(getHiddenStagePosition(12)).toMatchObject({
      level: 5,
      stage: 5,
      isHidden: true,
      hiddenRank: 'ceo',
      hiddenIndex: 2,
      lineTarget: 18,
      gravityTier: 5,
    });
    expect(getHiddenStagePosition(13)).toBeNull();
  });

  it('tracks hidden stage status during hidden phase', () => {
    expect(getHiddenStageStatus(0, 'promotion', 0)).toBe('locked');
    expect(getHiddenStageStatus(0, 'hidden', 0)).toBe('current');
    expect(getHiddenStageStatus(1, 'hidden', 0)).toBe('achieved');
    expect(getHiddenStageStatus(1, 'hidden', 1)).toBe('current');
    expect(getHiddenStageStatus(13, 'complete', 12)).toBe('achieved');
  });

  it('maps rank-local indices to global path indices', () => {
    expect(getHiddenStageGlobalIndex('staff', 1)).toBe(0);
    expect(getHiddenStageGlobalIndex('manager', 2)).toBe(3);
    expect(getHiddenStageGlobalIndex('ceo', 2)).toBe(12);
  });

  it('orders hidden path staff → ceo', () => {
    const ranks = getHiddenStagePath().map((stage) => stage.rank);
    expect(ranks[0]).toBe('staff');
    expect(ranks.at(-1)).toBe('ceo');
  });
});
