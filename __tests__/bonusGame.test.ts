import { createInitialState, reduce, tick } from '../src/game/engine';
import { getLineClearDuration } from '../src/game/lineClearFx';
import {
  BONUS_DURATION_MS,
  BONUS_LINE_TARGET,
  BONUS_SCORE_MULTIPLIER,
  computeBonusLineClearScore,
  enterBonus,
  exitBonus,
  shouldTriggerBonus,
  tickBonusTimer,
} from '../src/game/bonusGame';
import { applyStageResult, DEFAULT_CAREER_STATE } from '../src/career/careerProgress';

describe('bonusGame', () => {
  it('triggers on every Nth stage clear when configured', () => {
    expect(
      shouldTriggerBonus({ stagesClearedTotal: 4, random: () => 0.99 }),
    ).toBe(true);
    expect(
      shouldTriggerBonus({ stagesClearedTotal: 3, random: () => 0.99 }),
    ).toBe(false);
  });

  it('triggers probabilistically between periodic clears', () => {
    expect(
      shouldTriggerBonus({ stagesClearedTotal: 1, random: () => 0.1 }),
    ).toBe(true);
    expect(
      shouldTriggerBonus({ stagesClearedTotal: 1, random: () => 0.9 }),
    ).toBe(false);
  });

  it('applies the bonus score multiplier', () => {
    expect(computeBonusLineClearScore(2, 3)).toBe(
      300 * 3 * BONUS_SCORE_MULTIPLIER,
    );
  });

  it('enters bonus from a cleared stage without changing campaign score', () => {
    let state = createInitialState();
    state = {
      ...state,
      score: 1200,
      level: 2,
      stage: 3,
      lines: 8,
      stageCleared: true,
      active: null,
    };

    const bonusState = enterBonus(state);

    expect(bonusState.mode).toBe('bonus');
    expect(bonusState.score).toBe(1200);
    expect(bonusState.stageCleared).toBe(false);
    expect(bonusState.lines).toBe(0);
    expect(bonusState.bonus?.timeRemainingMs).toBe(BONUS_DURATION_MS);
    expect(bonusState.campaignSnapshot).toMatchObject({
      level: 2,
      stage: 3,
      score: 1200,
      lines: 8,
    });
  });

  it('exits bonus by restoring campaign progress and adding earned score', () => {
    let state = createInitialState();
    state = {
      ...state,
      mode: 'bonus',
      level: 2,
      stage: 3,
      lines: 5,
      score: 1200,
      stageCleared: false,
      campaignSnapshot: {
        level: 2,
        stage: 3,
        score: 1200,
        lines: 8,
      },
      bonus: {
        timeRemainingMs: 1000,
        lines: 5,
        earnedScore: 600,
        ended: true,
        success: false,
      },
      active: null,
    };

    const restored = exitBonus(state);

    expect(restored.mode).toBe('campaign');
    expect(restored.stageCleared).toBe(true);
    expect(restored.level).toBe(2);
    expect(restored.stage).toBe(3);
    expect(restored.lines).toBe(8);
    expect(restored.score).toBe(1800);
    expect(restored.bonus).toBeUndefined();
  });

  it('ends bonus when the timer expires without setting game over', () => {
    let state = createInitialState();
    state = {
      ...state,
      mode: 'bonus',
      bonus: {
        timeRemainingMs: 50,
        lines: 3,
        earnedScore: 400,
        ended: false,
        success: false,
      },
      active: { type: 'I', x: 2, y: 0, rotation: 0 },
    };

    state = tickBonusTimer(state, 60);

    expect(state.bonus?.ended).toBe(true);
    expect(state.bonus?.success).toBe(false);
    expect(state.gameOver).toBe(false);
    expect(state.active).toBeNull();
  });

  it('completes bonus when line target is reached via engine tick flow', () => {
    let state = createInitialState();
    const board = Array.from({ length: 16 }, () => Array(8).fill(null));
    board[15] = Array(8).fill('I');

    state = {
      ...state,
      mode: 'bonus',
      level: 2,
      lines: BONUS_LINE_TARGET - 1,
      stageLineTargetOverride: BONUS_LINE_TARGET,
      bonus: {
        timeRemainingMs: BONUS_DURATION_MS,
        lines: BONUS_LINE_TARGET - 1,
        earnedScore: 0,
        ended: false,
        success: false,
      },
      active: null,
      lineClear: { rows: [15], elapsed: 0 },
      board,
    };

    state = tick(state, getLineClearDuration(1));

    expect(state.bonus?.ended).toBe(true);
    expect(state.bonus?.success).toBe(true);
    expect(state.bonus?.lines).toBe(BONUS_LINE_TARGET);
    expect(state.gameOver).toBe(false);
  });

  it('does not mutate career progress when a stage is cleared', () => {
    const before = DEFAULT_CAREER_STATE;
    const after = applyStageResult(before, {
      cleared: true,
      campaignLevel: 1,
      campaignStage: 1,
    });

    expect(after.nextState.promotionWins).toBe(before.promotionWins + 1);
    expect(after.nextState.hiddenWins).toBe(before.hiddenWins);
  });

  it('supports ENTER_BONUS and EXIT_BONUS engine actions', () => {
    let state = createInitialState();
    state = {
      ...state,
      score: 900,
      stageCleared: true,
      active: null,
    };

    state = reduce(state, { type: 'ENTER_BONUS' });
    expect(state.mode).toBe('bonus');

    state = {
      ...state,
      bonus: {
        timeRemainingMs: 0,
        lines: 4,
        earnedScore: 250,
        ended: true,
        success: false,
      },
    };

    state = reduce(state, { type: 'EXIT_BONUS' });
    expect(state.mode).toBe('campaign');
    expect(state.score).toBe(1150);
    expect(state.stageCleared).toBe(true);
  });
});
