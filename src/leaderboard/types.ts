import type { AvatarId } from '../constants/avatars';
import type { GameDifficulty } from '../settings/types';

export type LeaderboardRank = 'chairman';

export type LeaderboardEntry = {
  id: string;
  initials: string;
  avatarId: AvatarId;
  rank: LeaderboardRank;
  score: number;
  clearedAt: string;
  difficulty?: GameDifficulty;
};

export type LeaderboardState = {
  entries: LeaderboardEntry[];
};

export type SaveLeaderboardInput = {
  initials: string;
  score: number;
  avatarId: AvatarId;
  difficulty: GameDifficulty;
};
