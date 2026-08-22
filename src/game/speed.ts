import { getGravityTier } from './campaign';

/** NES Tetris gravity — frames per cell at 60 fps */
const NES_GRAVITY_FRAMES = [
  48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 2, 1,
] as const;

const FRAME_MS = 1000 / 60;

/** Casual mobile pace — pieces fall slowly; swipe down for a fast drop */
const GRAVITY_SCALE = 2;

export function getGravityInterval(_campaignLevel: number, stage: number): number {
  const tier = getGravityTier(stage);
  const index = Math.min(tier, NES_GRAVITY_FRAMES.length - 1);
  return NES_GRAVITY_FRAMES[index]! * FRAME_MS * GRAVITY_SCALE;
}

export const DAS_DELAY_MS = 220;
export const ARR_INTERVAL_MS = 95;

export const LINE_CLEAR_DURATION_MS = 480;
export const LINE_CLEAR_FLASH_CYCLE_MS = 80;

export function isLineClearFlashBright(elapsed: number): boolean {
  return Math.floor(elapsed / LINE_CLEAR_FLASH_CYCLE_MS) % 2 === 0;
}
