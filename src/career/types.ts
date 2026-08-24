export type CareerRank =
  | 'intern'
  | 'staff'
  | 'assistant'
  | 'manager'
  | 'deputy'
  | 'director'
  | 'executive'
  | 'ceo';

export interface CareerState {
  rank: CareerRank;
  promotionWins: number;
  highestRankAchieved: CareerRank;
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
