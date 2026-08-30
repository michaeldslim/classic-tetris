import {
  getCareerStageTarget,
  getPromotionStagePosition,
  getPromotionTarget,
  isHigherRank,
} from './careerRules';
import {
  getHiddenStagePosition,
  HIDDEN_STAGE_PATH,
  matchesHiddenStagePosition,
  TOTAL_HIDDEN_STAGES,
} from './hiddenStages';
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
  phase: 'promotion',
  hiddenWins: 0,
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

function applyPromotionPhaseResult(
  state: CareerState,
  input: StageResultInput,
): PromotionResult {
  const target = getPromotionTarget(state.rank);
  if (!target) {
    return unchangedResult(state);
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
  const nextState = withHighestRank(
    {
      ...state,
      promotionWins: 0,
    },
    promotedRank,
  );

  if (promotedRank === 'ceo') {
    return {
      nextState: {
        ...nextState,
        phase: 'hidden',
        hiddenWins: 0,
      },
      promoted: promotedRank,
      lost: false,
      noProgressLevel: false,
      unchanged: false,
    };
  }

  return {
    nextState,
    promoted: promotedRank,
    lost: false,
    noProgressLevel: false,
    unchanged: false,
  };
}

function applyHiddenPhaseResult(
  state: CareerState,
  input: StageResultInput,
): PromotionResult {
  const expected = getHiddenStagePosition(state.hiddenWins);
  const def = HIDDEN_STAGE_PATH[state.hiddenWins];

  if (
    !expected ||
    !def ||
    !matchesHiddenStagePosition(def, input.campaignLevel, input.campaignStage)
  ) {
    return unchangedResult(state);
  }

  const nextHiddenWins = state.hiddenWins + 1;

  if (nextHiddenWins < TOTAL_HIDDEN_STAGES) {
    return {
      nextState: {
        ...state,
        hiddenWins: nextHiddenWins,
      },
      promoted: null,
      lost: false,
      noProgressLevel: false,
      unchanged: false,
    };
  }

  return {
    nextState: withHighestRank(
      {
        ...state,
        hiddenWins: nextHiddenWins,
        phase: 'complete',
      },
      'chairman',
    ),
    promoted: 'chairman',
    lost: false,
    noProgressLevel: false,
    unchanged: false,
  };
}

export function getResetStateAfterChairman(state: CareerState): CareerState {
  return {
    rank: 'intern',
    promotionWins: 0,
    phase: 'promotion',
    hiddenWins: 0,
    highestRankAchieved: state.highestRankAchieved,
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

  if (state.phase === 'complete') {
    return unchangedResult(state);
  }

  if (state.phase === 'hidden') {
    return applyHiddenPhaseResult(state, input);
  }

  return applyPromotionPhaseResult(state, input);
}

export { getCareerStageTarget };
