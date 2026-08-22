import { theme } from '../theme/colors';

export type PromotionInfo = {
  tierName: string;
  tierLevel: number;
  /** 0–1 progress toward next tier */
  progress: number;
  nextTierName?: string;
};

export type PlayerProfile = {
  displayName: string;
  avatarLabel: string;
  avatarColor: string;
  promotion: PromotionInfo;
};

/** Placeholder until avatar & promotion systems are wired up */
export const placeholderProfile: PlayerProfile = {
  displayName: 'Player',
  avatarLabel: 'T',
  avatarColor: theme.avatarBlue,
  promotion: {
    tierName: 'Bronze',
    tierLevel: 1,
    progress: 0.35,
    nextTierName: 'Silver',
  },
};
