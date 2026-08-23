import { findNewlyUnlocked } from './achievements';
import type { ScoreRecord, ScoreUpdateResult } from './types';

export function applyScoreUpdate(
  record: ScoreRecord,
  score: number,
): { nextRecord: ScoreRecord; result: ScoreUpdateResult } {
  const normalizedScore = Math.max(0, Math.floor(score));
  const isNewHighScore = normalizedScore > record.highScore;
  const newlyUnlocked = findNewlyUnlocked(
    normalizedScore,
    record.unlockedAchievements,
  );

  const nextRecord: ScoreRecord = {
    highScore: isNewHighScore ? normalizedScore : record.highScore,
    unlockedAchievements:
      newlyUnlocked.length > 0
        ? [...record.unlockedAchievements, ...newlyUnlocked]
        : record.unlockedAchievements,
  };

  return {
    nextRecord,
    result: {
      highScore: nextRecord.highScore,
      isNewHighScore,
      newlyUnlocked,
    },
  };
}
