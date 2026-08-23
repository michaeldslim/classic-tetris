import type { ScoreAchievementId } from './types';

export type ScoreAchievementDef = {
  id: ScoreAchievementId;
  threshold: number;
};

export const SCORE_ACHIEVEMENTS: ScoreAchievementDef[] = [
  { id: 'score-1k', threshold: 1_000 },
  { id: 'score-5k', threshold: 5_000 },
  { id: 'score-10k', threshold: 10_000 },
  { id: 'score-25k', threshold: 25_000 },
  { id: 'score-50k', threshold: 50_000 },
];

export function achievementKey(id: ScoreAchievementId): string {
  return `score.achievement.${id}`;
}

export function findNewlyUnlocked(
  score: number,
  unlocked: ScoreAchievementId[],
): ScoreAchievementId[] {
  const unlockedSet = new Set(unlocked);
  return SCORE_ACHIEVEMENTS.filter(
    (achievement) =>
      score >= achievement.threshold && !unlockedSet.has(achievement.id),
  ).map((achievement) => achievement.id);
}
