export type LineClearTier = 1 | 2 | 3 | 4;

export function getLineClearTier(lineCount: number): LineClearTier {
  return Math.min(4, Math.max(1, lineCount)) as LineClearTier;
}

export function getLineClearDuration(lineCount: number): number {
  switch (getLineClearTier(lineCount)) {
    case 1:
      return 360;
    case 2:
      return 440;
    case 3:
      return 540;
    case 4:
      return 680;
    default:
      return 360;
  }
}

export function getLineClearFlashCycleMs(lineCount: number): number {
  switch (getLineClearTier(lineCount)) {
    case 1:
      return 80;
    case 2:
      return 70;
    case 3:
      return 55;
    case 4:
      return 45;
    default:
      return 80;
  }
}

export function isLineClearFlashBright(
  elapsed: number,
  lineCount: number,
): boolean {
  const cycle = getLineClearFlashCycleMs(lineCount);
  return Math.floor(elapsed / cycle) % 2 === 0;
}

export function getLineClearSfxRate(lineCount: number): number {
  switch (getLineClearTier(lineCount)) {
    case 1:
      return 1;
    case 2:
      return 1.06;
    case 3:
      return 1.14;
    case 4:
      return 1.28;
    default:
      return 1;
  }
}

export function getLineClearSfxVolumeScale(lineCount: number): number {
  switch (getLineClearTier(lineCount)) {
    case 1:
      return 0.82;
    case 2:
      return 0.92;
    case 3:
      return 1;
    case 4:
      return 1;
    default:
      return 0.82;
  }
}
