import type { CareerRank, CareerStageTarget } from './types';

/** Ranks that have hidden stages (after ceo promotion). */
export type HiddenStageRank = Exclude<
  CareerRank,
  'intern' | 'chairman'
>;

export type HiddenStageDef = {
  rank: HiddenStageRank;
  /** 1-based index within the rank's hidden track. */
  index: number;
  level: number;
  stage: number;
  lineTarget: number;
  gravityTier: number;
};

export const HIDDEN_STAGE_COUNTS: Record<HiddenStageRank, number> = {
  staff: 1,
  assistant: 1,
  manager: 2,
  deputy: 2,
  director: 2,
  executive: 3,
  ceo: 2,
};

export const HIDDEN_STAGE_PATH: HiddenStageDef[] = [
  { rank: 'staff', index: 1, level: 1, stage: 4, lineTarget: 8, gravityTier: 0 },
  { rank: 'assistant', index: 1, level: 2, stage: 4, lineTarget: 10, gravityTier: 0 },
  { rank: 'manager', index: 1, level: 3, stage: 3, lineTarget: 12, gravityTier: 3 },
  { rank: 'manager', index: 2, level: 3, stage: 4, lineTarget: 12, gravityTier: 3 },
  { rank: 'deputy', index: 1, level: 3, stage: 5, lineTarget: 12, gravityTier: 3 },
  { rank: 'deputy', index: 2, level: 4, stage: 1, lineTarget: 10, gravityTier: 0 },
  { rank: 'director', index: 1, level: 4, stage: 3, lineTarget: 12, gravityTier: 3 },
  { rank: 'director', index: 2, level: 4, stage: 4, lineTarget: 12, gravityTier: 3 },
  { rank: 'executive', index: 1, level: 4, stage: 5, lineTarget: 12, gravityTier: 5 },
  { rank: 'executive', index: 2, level: 5, stage: 1, lineTarget: 12, gravityTier: 0 },
  { rank: 'executive', index: 3, level: 5, stage: 2, lineTarget: 12, gravityTier: 3 },
  { rank: 'ceo', index: 1, level: 5, stage: 4, lineTarget: 15, gravityTier: 5 },
  { rank: 'ceo', index: 2, level: 5, stage: 5, lineTarget: 18, gravityTier: 5 },
];

export const TOTAL_HIDDEN_STAGES = HIDDEN_STAGE_PATH.length;

const HIDDEN_STAGE_RANK_ORDER: HiddenStageRank[] = [
  'staff',
  'assistant',
  'manager',
  'deputy',
  'director',
  'executive',
  'ceo',
];

export function hasHiddenStages(rank: CareerRank): rank is HiddenStageRank {
  return rank !== 'intern' && rank !== 'chairman';
}

export function getHiddenStagesForRank(rank: HiddenStageRank): HiddenStageDef[] {
  return HIDDEN_STAGE_PATH.filter((stage) => stage.rank === rank);
}

export function getHiddenStageGlobalIndex(
  rank: HiddenStageRank,
  index: number,
): number {
  return HIDDEN_STAGE_PATH.findIndex(
    (stage) => stage.rank === rank && stage.index === index,
  );
}

export function getHiddenStagePosition(
  completedHiddenWins: number,
): CareerStageTarget | null {
  const def = HIDDEN_STAGE_PATH[completedHiddenWins];
  if (!def) {
    return null;
  }

  return toCareerStageTarget(def);
}

export function getHiddenStagePath(): HiddenStageDef[] {
  return [...HIDDEN_STAGE_PATH];
}

function toCareerStageTarget(def: HiddenStageDef): CareerStageTarget {
  return {
    level: def.level,
    stage: def.stage,
    lineTarget: def.lineTarget,
    gravityTier: def.gravityTier,
    isHidden: true,
    hiddenRank: def.rank,
    hiddenIndex: def.index,
  };
}

export function matchesHiddenStagePosition(
  def: HiddenStageDef,
  level: number,
  stage: number,
): boolean {
  return def.level === level && def.stage === stage;
}

export function formatHiddenStagePath(
  stages: ReadonlyArray<{ rank: HiddenStageRank; index: number }>,
): string {
  if (stages.length === 0) {
    return '';
  }

  const groups: { rank: HiddenStageRank; indices: number[] }[] = [];
  for (const stage of stages) {
    const last = groups[groups.length - 1];
    if (last && last.rank === stage.rank) {
      last.indices.push(stage.index);
    } else {
      groups.push({ rank: stage.rank, indices: [stage.index] });
    }
  }

  return groups
    .map(({ rank, indices }) => {
      const label = rank.toUpperCase();
      if (indices.length === 1) {
        return `${label} H${indices[0]}`;
      }
      return `${label} H${indices[0]}→H${indices[indices.length - 1]}`;
    })
    .join(' → ');
}

export function getHiddenStagePathForRank(rank: HiddenStageRank): string {
  const stages = getHiddenStagesForRank(rank);
  return formatHiddenStagePath(stages);
}

export type HiddenStageStatus = 'locked' | 'current' | 'achieved';

export function getHiddenStageStatus(
  hiddenWins: number,
  phase: 'promotion' | 'hidden' | 'complete',
  globalIndex: number,
): HiddenStageStatus {
  if (phase === 'complete') {
    return 'achieved';
  }

  if (phase !== 'hidden') {
    return 'locked';
  }

  if (globalIndex < hiddenWins) {
    return 'achieved';
  }

  if (globalIndex === hiddenWins) {
    return 'current';
  }

  return 'locked';
}

export function getHiddenStageRankOrder(): HiddenStageRank[] {
  return [...HIDDEN_STAGE_RANK_ORDER];
}
