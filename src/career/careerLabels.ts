import type { CareerRank, CareerState } from './types';
import {
  CAREER_RANK_ORDER,
  getPromotionTarget,
  getRequirementToReachRank,
  rankIndex,
} from './careerRules';

export const CAREER_RANK_KEYS: Record<CareerRank, string> = {
  intern: 'career.rank.intern',
  staff: 'career.rank.staff',
  assistant: 'career.rank.assistant',
  manager: 'career.rank.manager',
  deputy: 'career.rank.deputy',
  director: 'career.rank.director',
  executive: 'career.rank.executive',
  ceo: 'career.rank.ceo',
};

export function careerRankKey(rank: CareerRank): string {
  return CAREER_RANK_KEYS[rank];
}

export function isMaxCareerRank(state: CareerState): boolean {
  return getPromotionTarget(state.rank) === null;
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function getCareerProgressCopy(
  t: TranslateFn,
  state: CareerState,
): { primary: string; secondary?: string; progress: number } {
  const rankLabel = t(careerRankKey(state.rank));
  const target = getPromotionTarget(state.rank);

  if (!target) {
    return { primary: t('career.maxRank', { rank: rankLabel }), progress: 1 };
  }

  const progress = target.requiredWins > 0
    ? state.promotionWins / target.requiredWins
    : 0;

  return {
    primary: t('career.homeBadge', {
      rank: rankLabel,
      current: state.promotionWins,
      required: target.requiredWins,
    }),
    secondary: t('career.progressNext', {
      nextRank: t(careerRankKey(target.nextRank)),
      required: target.requiredWins,
    }),
    progress,
  };
}

export function getPromotionRequirementCopy(
  t: TranslateFn,
  rank: CareerRank,
): string | null {
  const requirement = getRequirementToReachRank(rank);
  if (!requirement) {
    return null;
  }

  return t('career.ladder.requirementLevel', {
    wins: requirement.requiredWins,
    minLevel: requirement.startCampaignLevel,
  });
}

export type CareerLadderStatus = 'achieved' | 'current' | 'locked';

export function getCareerLadderStatus(
  state: CareerState,
  rank: CareerRank,
): CareerLadderStatus {
  const currentIndex = rankIndex(state.rank);
  const rowIndex = rankIndex(rank);

  if (rowIndex < currentIndex) {
    return 'achieved';
  }

  if (rowIndex === currentIndex) {
    return 'current';
  }

  return 'locked';
}

export function getCareerLadderRows(): CareerRank[] {
  return [...CAREER_RANK_ORDER].reverse();
}
