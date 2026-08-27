import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { TetrominoType } from '../theme/colors';
import {
  getGhostColors,
  hexToRgba,
  theme,
  tetrominoColors,
} from '../theme/colors';

type CellProps = {
  type: TetrominoType | null;
  size: number;
  ghost?: boolean;
  flashing?: boolean;
  flashBright?: boolean;
  showGrid?: boolean;
  checkerLight?: boolean;
};

function bevelInset(size: number): number {
  return Math.max(1, Math.round(size * 0.14));
}

function CellComponent({
  type,
  size,
  ghost = false,
  flashing = false,
  flashBright = false,
  showGrid = true,
  checkerLight = false,
}: CellProps) {
  const colors = type ? tetrominoColors[type] : null;
  const inset = bevelInset(size);
  const ghostColors = type && ghost ? getGhostColors(type) : null;

  const bevelColors = useMemo(() => {
    if (!colors || ghost || flashing) {
      return null;
    }
    return {
      highlight: hexToRgba('#ffffff', 0.42),
      shadow: hexToRgba(colors.border, 0.9),
    };
  }, [colors, ghost, flashing]);

  if (!colors) {
    return (
      <View
        style={[
          styles.emptyCell,
          {
            width: size,
            height: size,
            backgroundColor: checkerLight
              ? theme.boardCheckerLight
              : theme.boardCheckerDark,
            borderColor: showGrid ? theme.cellBorder : theme.cellGridSubtle,
            borderWidth: showGrid ? 1 : 0.5,
          },
        ]}
      />
    );
  }

  if (flashing) {
    return (
      <View
        style={[
          styles.blockShell,
          {
            width: size,
            height: size,
            backgroundColor: flashBright ? '#ffffff' : colors.fill,
            borderColor: flashBright ? theme.accent : colors.border,
          },
        ]}
      />
    );
  }

  if (ghost && ghostColors) {
    return (
      <View
        style={[
          styles.ghostCell,
          {
            width: size,
            height: size,
            backgroundColor: ghostColors.fill,
            borderColor: ghostColors.border,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.blockShell,
        {
          width: size,
          height: size,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.blockFace, { backgroundColor: colors.fill }]}>
        {bevelColors ? (
          <>
            <View
              style={[
                styles.bevelHighlightTop,
                { height: inset, backgroundColor: bevelColors.highlight },
              ]}
            />
            <View
              style={[
                styles.bevelHighlightLeft,
                { width: inset, backgroundColor: bevelColors.highlight },
              ]}
            />
            <View
              style={[
                styles.bevelShadowBottom,
                { height: inset, backgroundColor: bevelColors.shadow },
              ]}
            />
            <View
              style={[
                styles.bevelShadowRight,
                { width: inset, backgroundColor: bevelColors.shadow },
              ]}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

export const Cell = memo(CellComponent, (prev, next) =>
  prev.type === next.type &&
  prev.size === next.size &&
  prev.ghost === next.ghost &&
  prev.flashing === next.flashing &&
  prev.flashBright === next.flashBright &&
  prev.showGrid === next.showGrid &&
  prev.checkerLight === next.checkerLight,
);

const styles = StyleSheet.create({
  emptyCell: {},
  blockShell: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  blockFace: {
    flex: 1,
  },
  bevelHighlightTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bevelHighlightLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  bevelShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bevelShadowRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
  },
  ghostCell: {
    borderWidth: 1,
  },
});
