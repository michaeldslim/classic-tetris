import { getPromotionTarget, isHigherRank, meetsCampaignLevel } from './careerRules';
import type {
  CareerRank,
  CareerState,
  PromotionResult,
  StageResultInput,
} from './types';

export const DEFAULT_CAREER_STATE: CareerState = {
  rank: 'intern',
  promotionWins: 0,
  highestRankAchieved: 'intern',
};

function withHighestRank(state: CareerState, rank: CareerRank): CareerState {
  return {
    ...state,
    rank,
    highestRankAchieved: isHigherRank(rank, state.highestRankAchieved)
      ? rank
      : state.highestRankAchieved,
  };
}

export function applyStageResult(
  state: CareerState,
  input: StageResultInput,
): PromotionResult {
  if (!input.cleared) {
    return {
      nextState: state,
      promoted: null,
      lost: true,
      noProgressLevel: false,
      unchanged: false,
    };
  }

  const target = getPromotionTarget(state.rank);
  if (!target) {
    return {
      nextState: state,
      promoted: null,
      lost: false,
      noProgressLevel: false,
      unchanged: false,
    };
  }

  if (
    target.minCampaignLevel &&
    !meetsCampaignLevel(input.campaignLevel, target.minCampaignLevel)
  ) {
    return {
      nextState: state,
      promoted: null,
      lost: false,
      noProgressLevel: true,
      unchanged: false,
    };
  }

  const nextWins = state.promotionWins + 1;

  if (nextWins < target.requiredWins) {
    return {
      nextState: {
        ...state,
        promotionWins: nextWins,
      },
      promoted: null,
      lost: false,
      noProgressLevel: false,
      unchanged: false,
    };
  }

  const promotedRank = target.nextRank;
  return {
    nextState: withHighestRank(
      {
        ...state,
        promotionWins: 0,
      },
      promotedRank,
    ),
    promoted: promotedRank,
    lost: false,
    noProgressLevel: false,
    unchanged: false,
  };
}
