import { memo, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { getRotatedShape } from '../game/board';
import { tetrominoTypes, type TetrominoType } from '../game/tetrominoes';
import { theme, tetrominoColors } from '../theme/colors';

type LandscapeSideArtProps = {
  side: 'left' | 'right';
  /** Tablet landscape: skip framed card so it does not float above the play stack. */
  variant?: 'full' | 'minimal';
};

type BlockSpec = {
  type: TetrominoType;
  /** Local grid origin (0–3) for a 4-wide mini grid */
  cells: readonly { col: number; row: number }[];
  originTop: number;
  originLeft: number;
  opacity?: number;
};

const CELL = 14;
const GRID_GAP = 2;
const MINIMAL_DECOR_COUNT = 6;

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shapeToCells(type: TetrominoType, rotation: number) {
  const shape = getRotatedShape(type, rotation);
  const cells: { col: number; row: number }[] = [];

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row]!.length; col++) {
      if (shape[row]![col]) {
        cells.push({ col, row });
      }
    }
  }

  return cells;
}

function pieceFootprint(cells: { col: number; row: number }[]) {
  let maxCol = 0;
  let maxRow = 0;
  for (const cell of cells) {
    maxCol = Math.max(maxCol, cell.col);
    maxRow = Math.max(maxRow, cell.row);
  }
  return {
    width: (maxCol + 1) * (CELL + GRID_GAP),
    height: (maxRow + 1) * (CELL + GRID_GAP),
  };
}

function createRandomSideDecor(
  side: 'left' | 'right',
  panelWidth: number,
  panelHeight: number,
): BlockSpec[] {
  const rand = mulberry32(side === 'left' ? 0x7f4a7c15 : 0x6a5a8f3d);
  const pieces: BlockSpec[] = [];
  const marginX = 10;
  const marginTop = 48;
  const marginBottom = 56;
  const usableW = Math.max(panelWidth - marginX * 2, 40);
  const usableH = Math.max(panelHeight - marginTop - marginBottom, 80);

  const bandHeight = usableH / MINIMAL_DECOR_COUNT;

  for (let i = 0; i < MINIMAL_DECOR_COUNT; i++) {
    const type = tetrominoTypes[Math.floor(rand() * tetrominoTypes.length)]!;
    const rotation = Math.floor(rand() * 4);
    const cells = shapeToCells(type, rotation);
    const { width, height } = pieceFootprint(cells);
    const maxLeft = Math.max(0, usableW - width);
    const bandTop = marginTop + i * bandHeight;
    const jitterTop = Math.max(0, bandHeight - height);
    const originTop = bandTop + Math.floor(rand() * jitterTop);

    pieces.push({
      type,
      cells,
      originLeft: marginX + Math.floor(rand() * maxLeft),
      originTop,
      opacity: 0.45 + rand() * 0.4,
    });
  }

  return pieces;
}

function MiniPiece({
  pieceKey,
  type,
  cells,
  originTop,
  originLeft,
  opacity = 0.85,
}: BlockSpec & { pieceKey: string }) {
  const { fill, border } = tetrominoColors[type];

  return (
    <>
      {cells.map((cell) => (
        <View
          key={`${pieceKey}-${cell.col}-${cell.row}`}
          style={[
            styles.cell,
            {
              top: originTop + cell.row * (CELL + GRID_GAP),
              left: originLeft + cell.col * (CELL + GRID_GAP),
              backgroundColor: fill,
              borderColor: border,
              opacity,
            },
          ]}
        />
      ))}
    </>
  );
}

const LEFT_PIECES: BlockSpec[] = [
  {
    type: 'I',
    cells: [
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
      { col: 3, row: 0 },
    ],
    originTop: 72,
    originLeft: 28,
    opacity: 0.55,
  },
  {
    type: 'T',
    cells: [
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
      { col: 2, row: 1 },
    ],
    originTop: 200,
    originLeft: 36,
    opacity: 0.9,
  },
  {
    type: 'O',
    cells: [
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ],
    originTop: 340,
    originLeft: 44,
    opacity: 0.45,
  },
  {
    type: 'L',
    cells: [
      { col: 0, row: 0 },
      { col: 0, row: 1 },
      { col: 0, row: 2 },
      { col: 1, row: 2 },
    ],
    originTop: 460,
    originLeft: 32,
    opacity: 0.65,
  },
];

const RIGHT_PIECES: BlockSpec[] = [
  {
    type: 'Z',
    cells: [
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 1, row: 1 },
      { col: 2, row: 1 },
    ],
    originTop: 88,
    originLeft: 24,
    opacity: 0.7,
  },
  {
    type: 'S',
    cells: [
      { col: 1, row: 0 },
      { col: 2, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ],
    originTop: 220,
    originLeft: 20,
    opacity: 0.5,
  },
  {
    type: 'J',
    cells: [
      { col: 1, row: 0 },
      { col: 1, row: 1 },
      { col: 1, row: 2 },
      { col: 0, row: 2 },
    ],
    originTop: 360,
    originLeft: 36,
    opacity: 0.85,
  },
  {
    type: 'I',
    cells: [
      { col: 0, row: 0 },
      { col: 0, row: 1 },
      { col: 0, row: 2 },
      { col: 0, row: 3 },
    ],
    originTop: 480,
    originLeft: 48,
    opacity: 0.4,
  },
];

function LandscapeSideArtComponent({
  side,
  variant = 'full',
}: LandscapeSideArtProps) {
  const pieces = side === 'left' ? LEFT_PIECES : RIGHT_PIECES;
  const minimal = variant === 'minimal';
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 });

  const minimalDecor = useMemo(() => {
    if (!minimal || panelSize.height < 1 || panelSize.width < 1) {
      return [];
    }
    return createRandomSideDecor(side, panelSize.width, panelSize.height);
  }, [minimal, panelSize.height, panelSize.width, side]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPanelSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  return (
    <View
      style={styles.root}
      onLayout={handleLayout}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.woodBase} />
      {minimal ? (
        <>
          <View style={[styles.verticalGlow, side === 'left' ? styles.glowLeft : styles.glowRight]} />
          <View style={styles.pieceLayer}>
            {minimalDecor.map((piece, index) => (
              <MiniPiece
                key={`${side}-decor-${index}`}
                pieceKey={`${side}-${index}`}
                {...piece}
              />
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={[styles.frame, side === 'right' && styles.frameRight]} />
          <View style={styles.gridFade} />

          {Array.from({ length: 8 }).map((_, index) => (
            <View
              key={`h-${index}`}
              style={[styles.gridLineH, { top: `${8 + index * 11}%` }]}
            />
          ))}

          <View style={styles.accentTop} />
          <View style={styles.accentBottom} />
          <View style={[styles.verticalGlow, side === 'left' ? styles.glowLeft : styles.glowRight]} />

          <View style={styles.pieceLayer}>
            {pieces.map((piece, index) => (
              <MiniPiece
                key={`${side}-${index}`}
                pieceKey={`${side}-full-${index}`}
                {...piece}
              />
            ))}
          </View>

          <View style={[styles.innerBorder, side === 'right' && styles.innerBorderRight]} />
        </>
      )}
    </View>
  );
}

export const LandscapeSideArt = memo(LandscapeSideArtComponent);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: theme.background,
  },
  woodBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#12121f',
  },
  frame: {
    position: 'absolute',
    top: '6%',
    bottom: '6%',
    left: 12,
    right: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.panelBorder,
    backgroundColor: 'rgba(26, 26, 46, 0.55)',
  },
  frameRight: {
    left: 4,
    right: 12,
  },
  gridFade: {
    position: 'absolute',
    top: '10%',
    bottom: '10%',
    left: 20,
    right: 12,
    backgroundColor: theme.boardBackground,
    opacity: 0.35,
    borderRadius: 4,
  },
  gridLineH: {
    position: 'absolute',
    left: 18,
    right: 10,
    height: 1,
    backgroundColor: theme.cellGridSubtle,
  },
  accentTop: {
    position: 'absolute',
    top: 48,
    left: 24,
    right: 16,
    height: 2,
    backgroundColor: theme.accent,
    opacity: 0.35,
  },
  accentBottom: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 16,
    height: 2,
    backgroundColor: theme.accent,
    opacity: 0.35,
  },
  verticalGlow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 48,
    opacity: 0.12,
    backgroundColor: theme.avatarBlue,
  },
  glowLeft: {
    right: 0,
  },
  glowRight: {
    left: 0,
  },
  pieceLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  cell: {
    position: 'absolute',
    width: CELL,
    height: CELL,
    borderWidth: 1,
    borderRadius: 2,
  },
  innerBorder: {
    position: 'absolute',
    top: '18%',
    bottom: '18%',
    left: 28,
    width: 1,
    backgroundColor: theme.boardBezelHighlight,
    opacity: 0.5,
  },
  innerBorderRight: {
    left: undefined,
    right: 28,
  },
});
