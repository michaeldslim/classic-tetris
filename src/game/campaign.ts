export const MAX_CAMPAIGN_LEVEL = 5;
export const STAGES_PER_LEVEL = 5;

/** Lines required to clear each stage (same for every campaign level). */
export const STAGE_LINE_TARGETS = [3, 5, 10, 10, 12] as const;

export function getStageLineTarget(stage: number, override?: number): number {
  if (override !== undefined) {
    return override;
  }

  const index = Math.min(Math.max(stage - 1, 0), STAGE_LINE_TARGETS.length - 1);
  return STAGE_LINE_TARGETS[index]!;
}

export function isStageComplete(
  stageLines: number,
  stage: number,
  lineTargetOverride?: number,
): boolean {
  return stageLines >= getStageLineTarget(stage, lineTargetOverride);
}

export function getNextStage(
  level: number,
  stage: number,
): { level: number; stage: number } | null {
  if (stage < STAGES_PER_LEVEL) {
    return { level, stage: stage + 1 };
  }
  if (level < MAX_CAMPAIGN_LEVEL) {
    return { level: level + 1, stage: 1 };
  }
  return null;
}

/** Faster gravity from stage 4 onward. */
export function getGravityTier(stage: number): number {
  if (stage >= 5) {
    return 5;
  }
  if (stage >= 4) {
    return 3;
  }
  return 0;
}
