export const theme = {
  background: '#0f0f1a',
  panel: '#1a1a2e',
  panelBorder: '#2d2d44',
  text: '#eaeaea',
  textMuted: '#8888aa',
  accent: '#f0f000',
  avatarBlue: '#4a6cf0',
  boardBackground: '#0d1636',
  boardBezel: '#080f28',
  boardBezelBorder: '#1a2048',
  boardBezelHighlight: '#2a3560',
  boardCheckerLight: '#111c42',
  boardCheckerDark: '#09102a',
  cellBorder: '#192448',
  cellGridSubtle: 'rgba(25, 36, 72, 0.42)',
  ghost: 'rgba(255,255,255,0.15)',
} as const;

/** Total width/height added around the cell grid (both sides combined). */
export const BOARD_FRAME_SIZE = 14;

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export const tetrominoColors: Record<
  TetrominoType,
  { fill: string; border: string }
> = {
  I: { fill: '#00F0F0', border: '#00A0A0' },
  O: { fill: '#F0F000', border: '#A0A000' },
  T: { fill: '#A000F0', border: '#6000A0' },
  S: { fill: '#00F000', border: '#00A000' },
  Z: { fill: '#F00000', border: '#A00000' },
  J: { fill: '#0000F0', border: '#0000A0' },
  L: { fill: '#F0A000', border: '#A06000' },
};

const GHOST_FILL_ALPHA = 0.25;
const GHOST_BORDER_ALPHA = 0.55;

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getGhostColors(type: TetrominoType): {
  fill: string;
  border: string;
} {
  const { fill, border } = tetrominoColors[type];
  return {
    fill: hexToRgba(fill, GHOST_FILL_ALPHA),
    border: hexToRgba(border, GHOST_BORDER_ALPHA),
  };
}

export const lineClearFlashColors: Record<
  1 | 2 | 3 | 4,
  { bright: string; dim: string; border: string }
> = {
  1: { bright: '#ffffff', dim: '#b8c0d8', border: theme.accent },
  2: { bright: '#00F0F0', dim: '#008888', border: '#00A0A0' },
  3: { bright: '#A000F0', dim: '#600090', border: '#6000A0' },
  4: { bright: '#f0f000', dim: '#a0a000', border: '#f0f000' },
};
