import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CAREER_STATE } from './careerProgress';
import { CAREER_RANK_ORDER } from './careerRules';
import type { CareerRank, CareerState } from './types';

const STORAGE_KEY = '@classic-tetris/career';

function isCareerRank(value: unknown): value is CareerRank {
  return typeof value === 'string' && CAREER_RANK_ORDER.includes(value as CareerRank);
}

function resolvePromotionWins(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

export function parseCareerState(raw: string | null): CareerState {
  if (!raw) {
    return DEFAULT_CAREER_STATE;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CareerState>;
    const rank = isCareerRank(parsed.rank) ? parsed.rank : DEFAULT_CAREER_STATE.rank;
    const highestRankAchieved = isCareerRank(parsed.highestRankAchieved)
      ? parsed.highestRankAchieved
      : rank;

    return {
      rank,
      promotionWins: resolvePromotionWins(parsed.promotionWins),
      highestRankAchieved,
    };
  } catch {
    return DEFAULT_CAREER_STATE;
  }
}

export async function loadCareerState(): Promise<CareerState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseCareerState(raw);
}

export async function saveCareerState(state: CareerState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearCareerState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
