import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScoreAchievementId, ScoreRecord } from './types';

const SCORE_KEY = '@classic-tetris/score';

export const DEFAULT_SCORE_RECORD: ScoreRecord = {
  highScore: 0,
  unlockedAchievements: [],
};

const VALID_ACHIEVEMENT_IDS = new Set<ScoreAchievementId>([
  'score-1k',
  'score-5k',
  'score-10k',
  'score-25k',
  'score-50k',
]);

function isScoreAchievementId(value: unknown): value is ScoreAchievementId {
  return typeof value === 'string' && VALID_ACHIEVEMENT_IDS.has(value as ScoreAchievementId);
}

export async function loadScoreRecord(): Promise<ScoreRecord> {
  try {
    const raw = await AsyncStorage.getItem(SCORE_KEY);
    if (!raw) {
      return DEFAULT_SCORE_RECORD;
    }

    const parsed = JSON.parse(raw) as Partial<ScoreRecord>;
    const unlockedAchievements = Array.isArray(parsed.unlockedAchievements)
      ? parsed.unlockedAchievements.filter(isScoreAchievementId)
      : [];

    return {
      highScore:
        typeof parsed.highScore === 'number' && parsed.highScore >= 0
          ? Math.floor(parsed.highScore)
          : 0,
      unlockedAchievements,
    };
  } catch {
    return DEFAULT_SCORE_RECORD;
  }
}

export async function saveScoreRecord(record: ScoreRecord): Promise<void> {
  await AsyncStorage.setItem(SCORE_KEY, JSON.stringify(record));
}
