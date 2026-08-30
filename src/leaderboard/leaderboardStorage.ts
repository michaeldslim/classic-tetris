import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseLeaderboardState } from './leaderboardProgress';
import type { LeaderboardState } from './types';

const STORAGE_KEY = '@classic-tetris/leaderboard';

export async function loadLeaderboardState(): Promise<LeaderboardState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parseLeaderboardState(raw);
  } catch {
    return { entries: [] };
  }
}

export async function saveLeaderboardState(state: LeaderboardState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearLeaderboard(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export type { LeaderboardEntry, LeaderboardState } from './types';
