export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type TetrominoColorPair = { fill: string; border: string };

export type TetrominoColorMap = Record<TetrominoType, TetrominoColorPair>;

export type LineClearFlashTier = 1 | 2 | 3 | 4;

export type LineClearFlashColors = Record<
  LineClearFlashTier,
  { bright: string; dim: string; border: string }
>;

export type TetrominoPaletteId =
  | 'guideline'
  | 'nes'
  | 'gameboy'
  | 'pastel'
  | 'gray';

export const TETROMINO_PALETTE_IDS: TetrominoPaletteId[] = [
  'guideline',
  'nes',
  'gameboy',
  'pastel',
  'gray',
];

export const DEFAULT_TETROMINO_PALETTE_ID: TetrominoPaletteId = 'guideline';

export function isTetrominoPaletteId(
  value: unknown,
): value is TetrominoPaletteId {
  return (
    typeof value === 'string' &&
    TETROMINO_PALETTE_IDS.includes(value as TetrominoPaletteId)
  );
}

export type TetrominoPalette = {
  id: TetrominoPaletteId;
  tetrominoColors: TetrominoColorMap;
  lineClearFlashColors: LineClearFlashColors;
};

/** Default in-app colors before multi-palette (incl. dark-ui J blue). */
const GUIDELINE_PIECES: TetrominoColorMap = {
  I: { fill: '#00F0F0', border: '#00A0A0' },
  O: { fill: '#F0F000', border: '#A0A000' },
  T: { fill: '#A000F0', border: '#6000A0' },
  S: { fill: '#00F000', border: '#00A000' },
  Z: { fill: '#F00000', border: '#A00000' },
  J: { fill: '#5088FF', border: '#2A58C8' },
  L: { fill: '#F0A000', border: '#A06000' },
};

/** NES: olive gold, magenta-T, forest green — not Guideline-neon on a dimmer scale. */
const NES_PIECES: TetrominoColorMap = {
  I: { fill: '#5CB8B0', border: '#2A6860' },
  O: { fill: '#B0B028', border: '#686818' },
  T: { fill: '#B850A8', border: '#702868' },
  S: { fill: '#48A048', border: '#286028' },
  Z: { fill: '#C03838', border: '#802020' },
  J: { fill: '#3048B0', border: '#182860' },
  L: { fill: '#C07828', border: '#804818' },
};

const GAMEBOY_PIECES: TetrominoColorMap = {
  I: { fill: '#9BBC0F', border: '#6B8C0B' },
  O: { fill: '#8BAC0F', border: '#5C7A0A' },
  T: { fill: '#306230', border: '#1A3818' },
  S: { fill: '#6B9C2E', border: '#4A6A1E' },
  Z: { fill: '#0F380F', border: '#081F08' },
  J: { fill: '#4A7028', border: '#2E4818' },
  L: { fill: '#8BAC0F', border: '#5C7420' },
};

const PASTEL_PIECES: TetrominoColorMap = {
  I: { fill: '#7EE8E8', border: '#4AA8A8' },
  O: { fill: '#E8E878', border: '#A8A848' },
  T: { fill: '#C888E8', border: '#9868B0' },
  S: { fill: '#88E888', border: '#58B058' },
  Z: { fill: '#E87878', border: '#B04848' },
  J: { fill: '#8888F0', border: '#5858C0' },
  L: { fill: '#E8B868', border: '#A88040' },
};

/** Seven neutral grays (light → dark) — distinct on dark board, no hue overlap with Guideline. */
const GRAY_PIECES: TetrominoColorMap = {
  I: { fill: '#E8E8F0', border: '#9898A8' },
  O: { fill: '#D4D4DE', border: '#888898' },
  T: { fill: '#B8B8C6', border: '#747484' },
  S: { fill: '#A0A0B0', border: '#606070' },
  Z: { fill: '#888898', border: '#505058' },
  J: { fill: '#707080', border: '#404048' },
  L: { fill: '#5A5A68', border: '#34343C' },
};

export const TETROMINO_PALETTES: Record<TetrominoPaletteId, TetrominoPalette> =
  {
    guideline: {
      id: 'guideline',
      tetrominoColors: GUIDELINE_PIECES,
      lineClearFlashColors: {
        1: { bright: '#ffffff', dim: '#b8c0d8', border: '#f0f000' },
        2: { bright: '#00F0F0', dim: '#008888', border: '#00A0A0' },
        3: { bright: '#A000F0', dim: '#600090', border: '#6000A0' },
        4: { bright: '#f0f000', dim: '#a0a000', border: '#f0f000' },
      },
    },
    nes: {
      id: 'nes',
      tetrominoColors: NES_PIECES,
      lineClearFlashColors: {
        1: { bright: '#D8D0B0', dim: '#908868', border: '#B0B028' },
        2: { bright: '#5CB8B0', dim: '#2A6860', border: '#3A7870' },
        3: { bright: '#B850A8', dim: '#702868', border: '#883878' },
        4: { bright: '#D8C848', dim: '#908020', border: '#B0A030' },
      },
    },
    gameboy: {
      id: 'gameboy',
      tetrominoColors: GAMEBOY_PIECES,
      lineClearFlashColors: {
        1: { bright: '#9BBC0F', dim: '#6B8C0B', border: '#8BAC0F' },
        2: { bright: '#8BAC0F', dim: '#4A6A1E', border: '#5C7A0A' },
        3: { bright: '#6B9C2E', dim: '#306230', border: '#4A6A1E' },
        4: { bright: '#9BBC0F', dim: '#0F380F', border: '#6B8C0B' },
      },
    },
    pastel: {
      id: 'pastel',
      tetrominoColors: PASTEL_PIECES,
      lineClearFlashColors: {
        1: { bright: '#f0f0f8', dim: '#c8c8d8', border: '#E8E878' },
        2: { bright: '#7EE8E8', dim: '#4AA8A8', border: '#58B0B0' },
        3: { bright: '#C888E8', dim: '#9868B0', border: '#A878C0' },
        4: { bright: '#E8E878', dim: '#A8A848', border: '#E8B868' },
      },
    },
    gray: {
      id: 'gray',
      tetrominoColors: GRAY_PIECES,
      lineClearFlashColors: {
        1: { bright: '#F4F4F8', dim: '#B0B0BC', border: '#D8D8E4' },
        2: { bright: '#D0D0DC', dim: '#888898', border: '#A8A8B8' },
        3: { bright: '#A8A8B8', dim: '#606070', border: '#808090' },
        4: { bright: '#FFFFFF', dim: '#C8C8D4', border: '#E8E8F0' },
      },
    },
  };

export function getTetrominoPalette(id: TetrominoPaletteId): TetrominoPalette {
  return TETROMINO_PALETTES[id];
}
