import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CAREER_STATE } from './careerProgress';
import { CAREER_RANK_ORDER } from './careerRules';
import type { CareerPhase, CareerRank, CareerState } from './types';

const STORAGE_KEY = '@classic-tetris/career';

function isCareerRank(value: unknown): value is CareerRank {
  return typeof value === 'string' && CAREER_RANK_ORDER.includes(value as CareerRank);
}

function isCareerPhase(value: unknown): value is CareerPhase {
  return value === 'promotion' || value === 'hidden' || value === 'complete';
}

function resolveNonNegativeInt(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

function migrateLegacyCeoState(state: CareerState): CareerState {
  if (state.rank === 'ceo' && state.phase === 'promotion') {
    return {
      ...state,
      phase: 'hidden',
      hiddenWins: 0,
    };
  }

  return state;
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
    const phase = isCareerPhase(parsed.phase) ? parsed.phase : 'promotion';
    const hiddenWins = resolveNonNegativeInt(parsed.hiddenWins);

    return migrateLegacyCeoState({
      rank,
      promotionWins: resolveNonNegativeInt(parsed.promotionWins),
      highestRankAchieved,
      phase,
      hiddenWins,
    });
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
