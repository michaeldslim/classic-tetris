import type { AvatarId } from '../constants/avatars';

export type LeaderboardRank = 'chairman';

export type LeaderboardEntry = {
  id: string;
  initials: string;
  avatarId: AvatarId;
  rank: LeaderboardRank;
  score: number;
  clearedAt: string;
};

export type LeaderboardState = {
  entries: LeaderboardEntry[];
};

export type SaveLeaderboardInput = {
  initials: string;
  score: number;
  avatarId: AvatarId;
};
