import { STAGES_PER_LEVEL } from '../game/campaign';
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
  Record<CareerRank, { requiredWins: number; startCampaignLevel: number }>
> = {
  intern: { requiredWins: 3, startCampaignLevel: 1 },
  staff: { requiredWins: 5, startCampaignLevel: 2 },
  assistant: { requiredWins: 7, startCampaignLevel: 2 },
  manager: { requiredWins: 10, startCampaignLevel: 2 },
  deputy: { requiredWins: 5, startCampaignLevel: 3 },
  director: { requiredWins: 7, startCampaignLevel: 4 },
  executive: { requiredWins: 5, startCampaignLevel: 5 },
};

export function getNextRank(rank: CareerRank): CareerRank | null {
  const index = CAREER_RANK_ORDER.indexOf(rank);
  if (index < 0 || index >= CAREER_RANK_ORDER.length - 1) {
    return null;
  }
  return CAREER_RANK_ORDER[index + 1];
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
    startCampaignLevel: rule.startCampaignLevel,
  };
}

/** Next required campaign level/stage for this rank (0-based completed wins). */
export function getPromotionStagePosition(
  rank: CareerRank,
  completedWins: number,
): { level: number; stage: number } | null {
  const target = getPromotionTarget(rank);
  if (!target || completedWins >= target.requiredWins) {
    return null;
  }

  const level =
    target.startCampaignLevel +
    Math.floor(completedWins / STAGES_PER_LEVEL);
  const stage = (completedWins % STAGES_PER_LEVEL) + 1;

  return { level, stage };
}

/** All campaign positions in order for a rank's promotion track. */
export function getPromotionStagePath(
  rank: CareerRank,
): { level: number; stage: number }[] {
  const target = getPromotionTarget(rank);
  if (!target) {
    return [];
  }

  const path: { level: number; stage: number }[] = [];
  for (let index = 0; index < target.requiredWins; index += 1) {
    const position = getPromotionStagePosition(rank, index);
    if (position) {
      path.push(position);
    }
  }
  return path;
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
