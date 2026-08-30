export type CareerRank =
  | 'intern'
  | 'staff'
  | 'assistant'
  | 'manager'
  | 'deputy'
  | 'director'
  | 'executive'
  | 'ceo'
  | 'chairman';

export type CareerPhase = 'promotion' | 'hidden' | 'complete';

export interface CareerState {
  rank: CareerRank;
  promotionWins: number;
  highestRankAchieved: CareerRank;
  phase: CareerPhase;
  /** Cleared hidden stages (0–13). Only meaningful when phase is hidden or after ceo. */
  hiddenWins: number;
}

export interface StageResultInput {
  cleared: boolean;
  campaignLevel: number;
  campaignStage: number;
}

export interface PromotionResult {
  nextState: CareerState;
  promoted: CareerRank | null;
  lost: boolean;
  noProgressLevel: boolean;
  unchanged: boolean;
}

export interface PromotionTarget {
  requiredWins: number;
  startCampaignLevel: number;
  nextRank: CareerRank;
}

export type CareerStageTarget = {
  level: number;
  stage: number;
  lineTarget?: number;
  gravityTier?: number;
  isHidden?: boolean;
  hiddenRank?: CareerRank;
  hiddenIndex?: number;
};
