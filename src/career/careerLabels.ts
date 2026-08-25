import type { CareerRank, CareerState } from './types';
import {
  CAREER_RANK_ORDER,
  getPromotionStagePath,
  getPromotionStagePosition,
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
  const next = getPromotionStagePosition(state.rank, state.promotionWins);
  if (!next) {
    return null;
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

export function getStageClearCareerHint(
  t: TranslateFn,
  state: CareerState,
  promotedRank: CareerRank | null,
): string | null {
  const next = getPromotionStagePosition(state.rank, state.promotionWins);
  if (!next) {
    return null;
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

export function getCareerLadderDetailCopy(
  t: TranslateFn,
  state: CareerState,
  rank: CareerRank,
  status: CareerLadderStatus,
): string {
  if (status === 'current') {
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

  return getPromotionRequirementCopy(t, rank) ?? '';
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
