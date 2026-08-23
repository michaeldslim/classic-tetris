export type ScoreAchievementId =
  | 'score-1k'
  | 'score-5k'
  | 'score-10k'
  | 'score-25k'
  | 'score-50k';

export type ScoreRecord = {
  highScore: number;
  unlockedAchievements: ScoreAchievementId[];
};

export type ScoreUpdateResult = {
  highScore: number;
  isNewHighScore: boolean;
  newlyUnlocked: ScoreAchievementId[];
};
