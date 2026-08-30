import {
  DEFAULT_PLAYER_AVATAR_ID,
  resolveAvatarId,
} from '../constants/avatars';
import type { LeaderboardEntry, LeaderboardState } from './types';

export const MAX_LEADERBOARD_ENTRIES = 20;
export const INITIALS_LENGTH = 3;

export function normalizeInitials(value: string): string {
  return value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, INITIALS_LENGTH);
}

export function isValidInitials(value: string): boolean {
  return new RegExp(`^[A-Z]{${INITIALS_LENGTH}}$`).test(value);
}

export function addLeaderboardEntry(
  entries: LeaderboardEntry[],
  input: { initials: string; score: number; avatarId: LeaderboardEntry['avatarId'] },
): LeaderboardEntry[] {
  const entry: LeaderboardEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    initials: input.initials,
    avatarId: input.avatarId,
    rank: 'chairman',
    score: Math.max(0, Math.floor(input.score)),
    clearedAt: new Date().toISOString(),
  };

  return [...entries, entry]
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.clearedAt.localeCompare(right.clearedAt);
    })
    .slice(0, MAX_LEADERBOARD_ENTRIES);
}

export function sortLeaderboardEntries(
  entries: LeaderboardEntry[],
): LeaderboardEntry[] {
  return [...entries].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return left.clearedAt.localeCompare(right.clearedAt);
  });
}

export function parseLeaderboardState(raw: string | null): LeaderboardState {
  if (!raw) {
    return { entries: [] };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LeaderboardState>;
    if (!Array.isArray(parsed.entries)) {
      return { entries: [] };
    }

    const entries = parsed.entries
      .filter((entry): entry is LeaderboardEntry => {
        return (
          typeof entry === 'object' &&
          entry !== null &&
          typeof entry.id === 'string' &&
          typeof entry.initials === 'string' &&
          entry.rank === 'chairman' &&
          typeof entry.score === 'number' &&
          entry.score >= 0 &&
          typeof entry.clearedAt === 'string'
        );
      })
      .map((entry) => ({
        ...entry,
        initials: normalizeInitials(entry.initials).padEnd(INITIALS_LENGTH, 'A').slice(0, INITIALS_LENGTH),
        avatarId: resolveAvatarId(entry.avatarId, DEFAULT_PLAYER_AVATAR_ID),
        score: Math.floor(entry.score),
      }));

    return { entries: sortLeaderboardEntries(entries) };
  } catch {
    return { entries: [] };
  }
}
