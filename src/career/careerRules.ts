import type { CareerRank, PromotionTarget } from './types';

export const CAREER_RANK_ORDER: CareerRank[] = [
  'intern',
  'staff',
  'assistant',
  'manager',
  'deputy',
  'director',
  'executive',
  'ceo',
];

const PROMOTION_RULES: Partial<
  Record<CareerRank, { requiredWins: number; minCampaignLevel?: number }>
> = {
  intern: { requiredWins: 3 },
  staff: { requiredWins: 5 },
  assistant: { requiredWins: 7 },
  manager: { requiredWins: 10 },
  deputy: { requiredWins: 5, minCampaignLevel: 3 },
  director: { requiredWins: 7, minCampaignLevel: 4 },
  executive: { requiredWins: 5, minCampaignLevel: 5 },
};

export function getNextRank(rank: CareerRank): CareerRank | null {
  const index = CAREER_RANK_ORDER.indexOf(rank);
  if (index < 0 || index >= CAREER_RANK_ORDER.length - 1) {
    return null;
  }
  return CAREER_RANK_ORDER[index + 1];
}

export function meetsCampaignLevel(
  currentLevel: number,
  minimumLevel: number,
): boolean {
  return currentLevel >= minimumLevel;
}

export function getPromotionTarget(rank: CareerRank): PromotionTarget | null {
  const nextRank = getNextRank(rank);
  if (!nextRank) {
    return null;
  }

  const rule = PROMOTION_RULES[rank];
  if (!rule) {
    return null;
  }

  return {
    nextRank,
    requiredWins: rule.requiredWins,
    minCampaignLevel: rule.minCampaignLevel,
  };
}

export function rankIndex(rank: CareerRank): number {
  return CAREER_RANK_ORDER.indexOf(rank);
}

export function getRequirementToReachRank(rank: CareerRank): PromotionTarget | null {
  const index = CAREER_RANK_ORDER.indexOf(rank);
  if (index <= 0) {
    return null;
  }

  return getPromotionTarget(CAREER_RANK_ORDER[index - 1]!);
}

export function isHigherRank(left: CareerRank, right: CareerRank): boolean {
  return rankIndex(left) > rankIndex(right);
}
