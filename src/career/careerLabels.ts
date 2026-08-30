import type { CareerRank, CareerState } from './types';
import {
  CAREER_RANK_ORDER,
  getCareerStageTarget,
  getPromotionStagePath,
  getPromotionStagePosition,
  getPromotionTarget,
  getRequirementToReachRank,
  rankIndex,
} from './careerRules';
import {
  getHiddenStageGlobalIndex,
  getHiddenStagePathForRank,
  getHiddenStageStatus,
  getHiddenStagesForRank,
  hasHiddenStages,
  HIDDEN_STAGE_COUNTS,
  TOTAL_HIDDEN_STAGES,
  type HiddenStageStatus,
} from './hiddenStages';

export const CAREER_RANK_KEYS: Record<CareerRank, string> = {
  intern: 'career.rank.intern',
  staff: 'career.rank.staff',
  assistant: 'career.rank.assistant',
  manager: 'career.rank.manager',
  deputy: 'career.rank.deputy',
  director: 'career.rank.director',
  executive: 'career.rank.executive',
  ceo: 'career.rank.ceo',
  chairman: 'career.rank.chairman',
};

export function careerRankKey(rank: CareerRank): string {
  return CAREER_RANK_KEYS[rank];
}

export function isMaxCareerRank(state: CareerState): boolean {
  return state.rank === 'chairman' || state.phase === 'complete';
}

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function formatStageRange(stages: number[]): string {
  if (stages.length === 0) {
    return '';
  }
  if (stages.length === 1) {
    return `S${stages[0]}`;
  }

  const isConsecutiveFromOne =
    stages[0] === 1 && stages.every((stage, index) => stage === index + 1);

  if (isConsecutiveFromOne) {
    return `S1→S${stages[stages.length - 1]}`;
  }

  return stages.map((stage) => `S${stage}`).join('→');
}

/** Compact path label, e.g. L1 S1→S3 or L2 S1→S5 → L3 S1→S2 */
export function formatPromotionStagePath(
  positions: ReadonlyArray<{ level: number; stage: number }>,
): string {
  if (positions.length === 0) {
    return '';
  }

  const groups: { level: number; stages: number[] }[] = [];
  for (const position of positions) {
    const last = groups[groups.length - 1];
    if (last && last.level === position.level) {
      last.stages.push(position.stage);
    } else {
      groups.push({ level: position.level, stages: [position.stage] });
    }
  }

  return groups
    .map(({ level, stages }) => `L${level} ${formatStageRange(stages)}`)
    .join(' → ');
}

export function getNextStageTargetCopy(
  t: TranslateFn,
  state: CareerState,
): string | null {
  const next = getCareerStageTarget(state);
  if (!next) {
    return null;
  }

  if (next.isHidden && next.hiddenRank && next.hiddenIndex) {
    return t('career.nextHiddenStage', {
      rank: t(careerRankKey(next.hiddenRank)),
      index: next.hiddenIndex,
      level: next.level,
      stage: next.stage,
    });
  }

  return t('career.nextStage', {
    level: next.level,
    stage: next.stage,
  });
}

export function getPromotionStagePathCopy(
  t: TranslateFn,
  rank: CareerRank,
): string | null {
  const path = formatPromotionStagePath(getPromotionStagePath(rank));
  if (!path) {
    return null;
  }

  return t('career.ladder.stagePath', { path });
}

export function getHiddenStagePathCopy(
  t: TranslateFn,
  rank: CareerRank,
): string | null {
  if (!hasHiddenStages(rank)) {
    return null;
  }

  const path = getHiddenStagePathForRank(rank);
  return t('career.ladder.hiddenPath', { path });
}

export function getStageClearCareerHint(
  t: TranslateFn,
  state: CareerState,
  promotedRank: CareerRank | null,
): string | null {
  const next = getCareerStageTarget(state);
  if (!next) {
    return null;
  }

  if (promotedRank === 'chairman') {
    return t('career.chairmanReached.subtitle');
  }

  if (promotedRank === 'ceo') {
    const firstHidden = getCareerStageTarget({
      ...state,
      phase: 'hidden',
      hiddenWins: 0,
    });
    if (firstHidden?.isHidden && firstHidden.hiddenRank && firstHidden.hiddenIndex) {
      return t('career.ceoHiddenHint', {
        rank: t(careerRankKey(firstHidden.hiddenRank)),
        index: firstHidden.hiddenIndex,
        level: firstHidden.level,
        stage: firstHidden.stage,
      });
    }
  }

  if (next.isHidden && next.hiddenRank && next.hiddenIndex) {
    return t('career.nextHiddenStage', {
      rank: t(careerRankKey(next.hiddenRank)),
      index: next.hiddenIndex,
      level: next.level,
      stage: next.stage,
    });
  }

  if (promotedRank) {
    return t('overlay.careerNextChapter', {
      rank: t(careerRankKey(state.rank)),
      level: next.level,
      stage: next.stage,
    });
  }

  return t('career.nextStage', {
    level: next.level,
    stage: next.stage,
  });
}

export function getCareerProgressCopy(
  t: TranslateFn,
  state: CareerState,
): {
  primary: string;
  secondary?: string;
  nextStage?: string;
  progress: number;
} {
  const rankLabel = t(careerRankKey(state.rank));

  if (state.phase === 'complete' || state.rank === 'chairman') {
    return {
      primary: t('career.maxRank', { rank: t(careerRankKey('chairman')) }),
      progress: 1,
    };
  }

  if (state.phase === 'hidden') {
    const progress =
      TOTAL_HIDDEN_STAGES > 0 ? state.hiddenWins / TOTAL_HIDDEN_STAGES : 0;

    return {
      primary: t('career.hiddenBadge', {
        rank: rankLabel,
        current: state.hiddenWins,
        required: TOTAL_HIDDEN_STAGES,
      }),
      secondary: t('career.hiddenProgressNext', {
        nextRank: t(careerRankKey('chairman')),
        required: TOTAL_HIDDEN_STAGES,
      }),
      nextStage: getNextStageTargetCopy(t, state) ?? undefined,
      progress,
    };
  }

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
    nextStage: getNextStageTargetCopy(t, state) ?? undefined,
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

  const previousRank = CAREER_RANK_ORDER[CAREER_RANK_ORDER.indexOf(rank) - 1];
  const pathCopy =
    previousRank !== undefined
      ? getPromotionStagePathCopy(t, previousRank)
      : null;

  const winsCopy = t('career.ladder.requirementLevel', {
    wins: requirement.requiredWins,
    minLevel: requirement.startCampaignLevel,
  });

  return pathCopy ? `${winsCopy} · ${pathCopy}` : winsCopy;
}

export function getHiddenStageRequirementCopy(
  t: TranslateFn,
  rank: CareerRank,
): string | null {
  if (!hasHiddenStages(rank)) {
    return null;
  }

  const count = HIDDEN_STAGE_COUNTS[rank];
  const pathCopy = getHiddenStagePathCopy(t, rank);

  const requirement = t('career.ladder.hiddenRequirement', { count });
  return pathCopy ? `${requirement} · ${pathCopy}` : requirement;
}

export function getCareerLadderDetailCopy(
  t: TranslateFn,
  state: CareerState,
  rank: CareerRank,
  status: CareerLadderStatus,
): string {
  if (rank === 'chairman') {
    if (status === 'achieved') {
      return t('career.ladder.chairmanAchieved');
    }
    return t('career.ladder.chairmanRequirement');
  }

  if (status === 'current') {
    if (state.phase === 'hidden') {
      const progress = t('career.ladder.hiddenProgressToChairman', {
        current: state.hiddenWins,
        required: TOTAL_HIDDEN_STAGES,
        nextRank: t(careerRankKey('chairman')),
      });
      const nextStage = getNextStageTargetCopy(t, state);
      return nextStage ? `${progress} · ${nextStage}` : progress;
    }

    const target = getPromotionTarget(state.rank);
    if (!target) {
      return t('career.maxRank', { rank: t(careerRankKey(rank)) });
    }

    const progress = t('career.ladder.progressToNext', {
      current: state.promotionWins,
      required: target.requiredWins,
      nextRank: t(careerRankKey(target.nextRank)),
    });
    const nextStage = getNextStageTargetCopy(t, state);
    return nextStage ? `${progress} · ${nextStage}` : progress;
  }

  if (rank === 'intern') {
    return t('career.ladder.startingRank');
  }

  const promotionCopy = getPromotionRequirementCopy(t, rank);
  const hiddenCopy = getHiddenStageRequirementCopy(t, rank);

  if (promotionCopy && hiddenCopy) {
    return `${promotionCopy}\n${hiddenCopy}`;
  }

  return promotionCopy ?? hiddenCopy ?? '';
}

export type CareerLadderStatus = 'achieved' | 'current' | 'locked';

export function getCareerLadderStatus(
  state: CareerState,
  rank: CareerRank,
): CareerLadderStatus {
  if (rank === 'chairman') {
    if (state.rank === 'chairman' || state.phase === 'complete') {
      return 'achieved';
    }
    return 'locked';
  }

  const currentIndex = rankIndex(state.rank);
  const rowIndex = rankIndex(rank);

  if (state.phase === 'hidden') {
    if (rowIndex < currentIndex) {
      return 'achieved';
    }
    if (rowIndex === currentIndex) {
      return 'current';
    }
    return 'locked';
  }

  if (state.phase === 'complete') {
    return rowIndex <= rankIndex('chairman') ? 'achieved' : 'locked';
  }

  if (rowIndex < currentIndex) {
    return 'achieved';
  }

  if (rowIndex === currentIndex) {
    return 'current';
  }

  return 'locked';
}

export function getHiddenStageLadderStatus(
  state: CareerState,
  rank: CareerRank,
  hiddenIndex: number,
): HiddenStageStatus {
  if (!hasHiddenStages(rank)) {
    return 'locked';
  }

  const globalIndex = getHiddenStageGlobalIndex(rank, hiddenIndex);
  if (globalIndex < 0) {
    return 'locked';
  }

  return getHiddenStageStatus(state.hiddenWins, state.phase, globalIndex);
}

export function getHiddenStageLadderLabel(
  t: TranslateFn,
  rank: CareerRank,
  hiddenIndex: number,
  status: HiddenStageStatus,
): string {
  const rankLabel = t(careerRankKey(rank));
  const stageLabel = t('career.ladder.hiddenStageLabel', {
    rank: rankLabel,
    index: hiddenIndex,
  });

  if (status === 'achieved') {
    return `${stageLabel} · ${t('career.ladder.achieved')}`;
  }
  if (status === 'current') {
    return `${stageLabel} · ${t('career.ladder.current')}`;
  }
  return `${stageLabel} · ${t('career.ladder.hiddenLocked')}`;
}

export function getCareerLadderRows(): CareerRank[] {
  return [...CAREER_RANK_ORDER].reverse();
}

export function getHiddenStagesForLadderRank(rank: CareerRank): number[] {
  if (!hasHiddenStages(rank)) {
    return [];
  }

  return getHiddenStagesForRank(rank).map((stage) => stage.index);
}

export { getPromotionStagePosition };
