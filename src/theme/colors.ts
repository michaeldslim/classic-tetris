export const theme = {
  background: '#0f0f1a',
  panel: '#1a1a2e',
  panelBorder: '#2d2d44',
  text: '#eaeaea',
  textMuted: '#8888aa',
  accent: '#f0f000',
  avatarBlue: '#4a6cf0',
  boardBackground: '#0d1636',
  boardCheckerLight: '#101a3f',
  boardCheckerDark: '#0a122e',
  cellBorder: '#192448',
  ghost: 'rgba(255,255,255,0.15)',
} as const;

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
