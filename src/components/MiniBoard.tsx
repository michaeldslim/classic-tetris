import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { TetrominoType } from '../theme/colors';
import { theme } from '../theme/colors';
import { tetrominoShapes } from '../game/tetrominoes';
import { MINI_BOARD_SIZE, type BoardCell } from '../game/types';
import { Cell } from './Cell';

type MiniBoardProps = {
  label: string;
  piece: TetrominoType | null;
  cellSize?: number;
};

function buildCenteredGrid(
  piece: TetrominoType | null,
  boardSize: number,
): BoardCell[][] {
  const grid: BoardCell[][] = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => null),
  );

  if (!piece) return grid;

  const shape = tetrominoShapes[piece];
  let minX = boardSize;
  let minY = boardSize;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  const pieceWidth = maxX - minX + 1;
  const pieceHeight = maxY - minY + 1;
  const offsetX = Math.floor((boardSize - pieceWidth) / 2) - minX;
  const offsetY = Math.floor((boardSize - pieceHeight) / 2) - minY;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const targetX = x + offsetX;
      const targetY = y + offsetY;
      if (
        targetX >= 0 &&
        targetX < boardSize &&
        targetY >= 0 &&
        targetY < boardSize
      ) {
        grid[targetY][targetX] = piece;
      }
    }
  }

  return grid;
}

function MiniBoardComponent({
  label,
  piece,
  cellSize = 14,
}: MiniBoardProps) {
  const grid = useMemo(
    () => buildCenteredGrid(piece, MINI_BOARD_SIZE),
    [piece],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.board, { borderColor: theme.panelBorder }]}>
        {grid.map((row, y) => (
          <View key={`mini-row-${y}`} style={styles.row}>
            {row.map((cell, x) => (
              <Cell key={`mini-${x}-${y}`} type={cell} size={cellSize} showGrid={false} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export const MiniBoard = memo(MiniBoardComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  board: {
    borderWidth: 1,
    backgroundColor: theme.boardBackground,
  },
  row: {
    flexDirection: 'row',
  },
});
