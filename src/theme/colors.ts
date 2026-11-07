import type { TetrominoColorPair, TetrominoType } from './palettes';
import {
  DEFAULT_TETROMINO_PALETTE_ID,
  getTetrominoPalette,
} from './palettes';

export type { TetrominoType } from './palettes';

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

const defaultPalette = getTetrominoPalette(DEFAULT_TETROMINO_PALETTE_ID);

/** Default Guideline palette (tests / static imports). */
export const tetrominoColors = defaultPalette.tetrominoColors;

/** Default Guideline line-clear flash (tests / static imports). */
export const lineClearFlashColors = defaultPalette.lineClearFlashColors;

const GHOST_FILL_ALPHA = 0.25;
const GHOST_BORDER_ALPHA = 0.55;

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getGhostColors(piece: TetrominoColorPair): {
  fill: string;
  border: string;
} {
  return {
    fill: hexToRgba(piece.fill, GHOST_FILL_ALPHA),
    border: hexToRgba(piece.border, GHOST_BORDER_ALPHA),
  };
}

export function getGhostColorsForType(
  type: TetrominoType,
  paletteId = DEFAULT_TETROMINO_PALETTE_ID,
): { fill: string; border: string } {
  const { tetrominoColors: colors } = getTetrominoPalette(paletteId);
  return getGhostColors(colors[type]);
}
