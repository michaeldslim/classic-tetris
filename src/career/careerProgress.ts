import {
  getPromotionStagePosition,
  getPromotionTarget,
  isHigherRank,
} from './careerRules';
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

function unchangedResult(state: CareerState): PromotionResult {
  return {
    nextState: state,
    promoted: null,
    lost: false,
    noProgressLevel: false,
    unchanged: true,
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

  const expectedStage = getPromotionStagePosition(state.rank, state.promotionWins);
  if (
    !expectedStage ||
    input.campaignLevel !== expectedStage.level ||
    input.campaignStage !== expectedStage.stage
  ) {
    return unchangedResult(state);
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
