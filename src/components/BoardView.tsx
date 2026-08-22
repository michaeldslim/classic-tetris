import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { getPieceCells } from '../game/board';
import type { ActivePiece, LineClearEffect } from '../game/types';
import { BOARD_HEIGHT, BOARD_WIDTH, type BoardCell } from '../game/types';
import { isLineClearFlashBright } from '../game/speed';
import { theme } from '../theme/colors';
import { Cell } from './Cell';

type BoardViewProps = {
  board: BoardCell[][];
  cellSize: number;
  active?: ActivePiece | null;
  ghost?: ActivePiece | null;
  lineClear?: LineClearEffect | null;
};

function BoardViewComponent({
  board,
  cellSize,
  active = null,
  ghost = null,
  lineClear = null,
}: BoardViewProps) {
  const activeCells = useMemo(() => {
    if (!active) {
      return new Set<string>();
    }
    return new Set(
      getPieceCells(active.type, active.rotation, active.x, active.y).map(
        ({ x, y }) => `${x},${y}`,
      ),
    );
  }, [active]);

  const ghostCells = useMemo(() => {
    if (!ghost) {
      return new Set<string>();
    }
    return new Set(
      getPieceCells(ghost.type, ghost.rotation, ghost.x, ghost.y).map(
        ({ x, y }) => `${x},${y}`,
      ),
    );
  }, [ghost]);

  const flashingRows = useMemo(
    () => new Set(lineClear?.rows ?? []),
    [lineClear?.rows],
  );
  const flashBright = lineClear
    ? isLineClearFlashBright(lineClear.elapsed)
    : false;

  const activeType = active?.type ?? null;
  const ghostType = ghost?.type ?? null;

  return (
    <View style={[styles.board, { borderColor: theme.panelBorder }]}>
      {Array.from({ length: BOARD_HEIGHT }, (_, y) => (
        <View key={`row-${y}`} style={styles.row}>
          {Array.from({ length: BOARD_WIDTH }, (_, x) => {
            const key = `${x},${y}`;
            const locked = board[y]?.[x] ?? null;
            const isActive = activeCells.has(key);
            const isGhost = ghostCells.has(key) && !isActive && locked === null;
            const isFlashing = flashingRows.has(y) && locked !== null;

            let type: BoardCell = locked;
            let ghostFlag = false;

            if (isActive && activeType) {
              type = activeType;
            } else if (isGhost && ghostType) {
              type = ghostType;
              ghostFlag = true;
            }

            return (
              <Cell
                key={key}
                type={type}
                size={cellSize}
                ghost={ghostFlag}
                flashing={isFlashing}
                flashBright={isFlashing && flashBright}
                showGrid={false}
                checkerLight={(x + y) % 2 === 0}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export const BoardView = memo(BoardViewComponent);

const styles = StyleSheet.create({
  board: {
    borderWidth: 2,
    backgroundColor: theme.boardBackground,
  },
  row: {
    flexDirection: 'row',
  },
});
