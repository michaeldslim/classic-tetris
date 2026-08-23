import { findNewlyUnlocked } from '../src/score/achievements';
import { applyScoreUpdate } from '../src/score/scoreProgress';
import { DEFAULT_SCORE_RECORD } from '../src/score/scoreStorage';

describe('score progress', () => {
  it('updates high score when beaten', () => {
    const { nextRecord, result } = applyScoreUpdate(
      { highScore: 1200, unlockedAchievements: ['score-1k'] },
      2500,
    );

    expect(result.isNewHighScore).toBe(true);
    expect(nextRecord.highScore).toBe(2500);
  });

  it('does not lower high score', () => {
    const { nextRecord, result } = applyScoreUpdate(
      { highScore: 5000, unlockedAchievements: ['score-1k', 'score-5k'] },
      800,
    );

    expect(result.isNewHighScore).toBe(false);
    expect(nextRecord.highScore).toBe(5000);
  });

  it('unlocks multiple achievements at once', () => {
    const { result } = applyScoreUpdate(DEFAULT_SCORE_RECORD, 12_000);

    expect(result.newlyUnlocked).toEqual(['score-1k', 'score-5k', 'score-10k']);
  });

  it('does not re-unlock achievements', () => {
    const { result } = applyScoreUpdate(
      {
        highScore: 10_000,
        unlockedAchievements: ['score-1k', 'score-5k', 'score-10k'],
      },
      11_000,
    );

    expect(result.newlyUnlocked).toEqual([]);
  });
});

describe('findNewlyUnlocked', () => {
  it('returns empty when below every threshold', () => {
    expect(findNewlyUnlocked(500, [])).toEqual([]);
  });
});
