import { getGravityTier, getStageLineTarget } from '../game/campaign';
import type { CareerStageTarget } from '../career/types';
import type { GameDifficulty } from '../settings/types';

export const GAME_DIFFICULTIES: GameDifficulty[] = ['casual', 'standard', 'pro'];

/** NES gravity table length in `speed.ts` minus one. */
export const MAX_GRAVITY_TIER = 29;

export type DifficultyProfile = {
  gravityScale: number;
  dasDelayMs: number;
  arrIntervalMs: number;
  bonusLineTarget: number;
};

const PROFILES: Record<GameDifficulty, DifficultyProfile> = {
  casual: {
    gravityScale: 2,
    dasDelayMs: 220,
    arrIntervalMs: 95,
    bonusLineTarget: 10,
  },
  standard: {
    gravityScale: 1.5,
    dasDelayMs: 200,
    arrIntervalMs: 90,
    bonusLineTarget: 12,
  },
  pro: {
    gravityScale: 1,
    dasDelayMs: 170,
    arrIntervalMs: 80,
    bonusLineTarget: 15,
  },
};

export function isGameDifficulty(value: unknown): value is GameDifficulty {
  return value === 'casual' || value === 'standard' || value === 'pro';
}

export function getDifficultyProfile(difficulty: GameDifficulty): DifficultyProfile {
  return PROFILES[difficulty];
}

export function capGravityTier(tier: number): number {
  return Math.min(Math.max(0, Math.floor(tier)), MAX_GRAVITY_TIER);
}

function promotionLineBonus(difficulty: GameDifficulty, stage: number): number {
  if (difficulty === 'casual') {
    return 0;
  }
  if (difficulty === 'standard') {
    return 1;
  }
  return stage === 5 ? 3 : 2;
}

export function resolvePromotionLineTarget(
  difficulty: GameDifficulty,
  stage: number,
): number {
  return getStageLineTarget(stage) + promotionLineBonus(difficulty, stage);
}

export function resolvePromotionGravityTier(
  difficulty: GameDifficulty,
  stage: number,
): number {
  const base = getGravityTier(stage);

  if (difficulty === 'casual') {
    return base;
  }

  if (difficulty === 'standard') {
    return stage >= 3 ? capGravityTier(base + 1) : base;
  }

  let tier = base;
  if (stage >= 2) {
    tier += 1;
  }
  if (stage >= 4) {
    tier += 1;
  }
  return capGravityTier(tier);
}

export function resolveHiddenLineTarget(
  difficulty: GameDifficulty,
  baseLineTarget: number,
  isCeoHiddenStage2: boolean,
): number {
  if (difficulty === 'casual') {
    return baseLineTarget;
  }
  if (difficulty === 'standard') {
    return baseLineTarget + 2;
  }
  return baseLineTarget + (isCeoHiddenStage2 ? 5 : 4);
}

export function resolveHiddenGravityTier(
  difficulty: GameDifficulty,
  baseTier: number,
): number {
  if (difficulty === 'casual') {
    return baseTier;
  }
  if (difficulty === 'standard') {
    return capGravityTier(baseTier + 1);
  }
  return capGravityTier(baseTier + 2);
}

export type ResolvedStageModifiers = {
  lineTarget: number;
  gravityTier: number;
};

export function resolvePromotionStageModifiers(
  difficulty: GameDifficulty,
  stage: number,
): ResolvedStageModifiers {
  return {
    lineTarget: resolvePromotionLineTarget(difficulty, stage),
    gravityTier: resolvePromotionGravityTier(difficulty, stage),
  };
}

export function resolveCareerStageModifiers(
  difficulty: GameDifficulty,
  target: CareerStageTarget,
): ResolvedStageModifiers {
  if (target.isHidden && target.lineTarget !== undefined) {
    const isCeoH2 =
      target.hiddenRank === 'ceo' && target.hiddenIndex === 2;
    return {
      lineTarget: resolveHiddenLineTarget(
        difficulty,
        target.lineTarget,
        isCeoH2,
      ),
      gravityTier: resolveHiddenGravityTier(
        difficulty,
        target.gravityTier ?? getGravityTier(target.stage),
      ),
    };
  }

  return resolvePromotionStageModifiers(difficulty, target.stage);
}

export function resolveDisplayLineTarget(
  difficulty: GameDifficulty,
  stage: number,
  override?: number,
  hiddenMeta?: Pick<CareerStageTarget, 'isHidden' | 'hiddenRank' | 'hiddenIndex'>,
): number {
  if (override !== undefined && hiddenMeta?.isHidden) {
    const isCeoH2 =
      hiddenMeta.hiddenRank === 'ceo' && hiddenMeta.hiddenIndex === 2;
    return resolveHiddenLineTarget(difficulty, override, isCeoH2);
  }

  if (override !== undefined) {
    return override;
  }

  return resolvePromotionLineTarget(difficulty, stage);
}

export function resolveDisplayGravityTier(
  difficulty: GameDifficulty,
  stage: number,
  override?: number,
  hiddenMeta?: Pick<CareerStageTarget, 'isHidden'>,
): number {
  if (override !== undefined && hiddenMeta?.isHidden) {
    return resolveHiddenGravityTier(difficulty, override);
  }

  if (override !== undefined) {
    return override;
  }

  return resolvePromotionGravityTier(difficulty, stage);
}

export function getBonusLineTarget(difficulty: GameDifficulty): number {
  return getDifficultyProfile(difficulty).bonusLineTarget;
}
