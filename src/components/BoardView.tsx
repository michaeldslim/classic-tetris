import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { getPieceCells } from '../game/board';
import { getLineClearTier, isLineClearFlashBright } from '../game/lineClearFx';
import type { ActivePiece, LineClearEffect } from '../game/types';
import { BOARD_HEIGHT, BOARD_WIDTH, type BoardCell } from '../game/types';
import { theme } from '../theme/colors';
import { Cell } from './Cell';

type BoardViewProps = {
  board: BoardCell[][];
  cellSize: number;
  active?: ActivePiece | null;
  ghost?: ActivePiece | null;
  lineClear?: LineClearEffect | null;
  stageCleared?: boolean;
  lockPulseKey?: number;
};

function BoardViewComponent({
  board,
  cellSize,
  active = null,
  ghost = null,
  lineClear = null,
  stageCleared = false,
  lockPulseKey = 0,
}: BoardViewProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const prevStageCleared = useRef(false);

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

  const lineClearTier = lineClear
    ? getLineClearTier(lineClear.rows.length)
    : null;
  const flashBright =
    lineClear !== null && lineClearTier !== null
      ? isLineClearFlashBright(lineClear.elapsed, lineClear.rows.length)
      : false;

  const activeType = active?.type ?? null;
  const ghostType = ghost?.type ?? null;

  useEffect(() => {
    if (lockPulseKey <= 0) {
      return;
    }

    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.985,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [lockPulseKey, scaleAnim]);

  useEffect(() => {
    if (stageCleared && !prevStageCleared.current) {
      glowAnim.setValue(0);
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 520,
          useNativeDriver: false,
        }),
      ]).start();
    }
    prevStageCleared.current = stageCleared;
  }, [stageCleared, glowAnim]);

  const bezelBorderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.boardBezelBorder, theme.accent],
  });

  const bezelShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Animated.View
        style={[
          styles.outerBezel,
          {
            borderColor: bezelBorderColor,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.stageGlow,
            {
              opacity: bezelShadowOpacity,
            },
          ]}
        />
        <View style={styles.innerWell}>
          {Array.from({ length: BOARD_HEIGHT }, (_, y) => (
            <View key={`row-${y}`} style={styles.row}>
              {Array.from({ length: BOARD_WIDTH }, (_, x) => {
                const key = `${x},${y}`;
                const locked = board[y]?.[x] ?? null;
                const isActive = activeCells.has(key);
                const isGhost =
                  ghostCells.has(key) && !isActive && locked === null;
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
                    lineClearTier={isFlashing ? lineClearTier : null}
                    showGrid={false}
                    checkerLight={(x + y) % 2 === 0}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export const BoardView = memo(BoardViewComponent);

const styles = StyleSheet.create({
  outerBezel: {
    borderWidth: 3,
    borderRadius: 6,
    padding: 2,
    backgroundColor: theme.boardBezel,
  },
  stageGlow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 6,
    backgroundColor: theme.accent,
  },
  innerWell: {
    borderWidth: 2,
    borderTopColor: '#050a18',
    borderLeftColor: '#050a18',
    borderBottomColor: theme.boardBezelHighlight,
    borderRightColor: theme.boardBezelHighlight,
    backgroundColor: theme.boardBackground,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});
