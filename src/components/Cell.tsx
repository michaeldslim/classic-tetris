import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { TetrominoType } from '../theme/colors';
import { theme, tetrominoColors } from '../theme/colors';

type CellProps = {
  type: TetrominoType | null;
  size: number;
  ghost?: boolean;
  flashing?: boolean;
  flashBright?: boolean;
  showGrid?: boolean;
  checkerLight?: boolean;
};

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

  let backgroundColor = checkerLight
    ? theme.boardCheckerLight
    : theme.boardCheckerDark;
  let borderColor = theme.cellBorder;

  if (colors) {
    if (flashing) {
      backgroundColor = flashBright ? '#ffffff' : colors.fill;
      borderColor = flashBright ? theme.accent : colors.border;
    } else if (ghost) {
      backgroundColor = theme.ghost;
      borderColor = colors.border;
    } else {
      backgroundColor = colors.fill;
      borderColor = colors.border;
    }
  }

  return (
    <View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor,
          borderColor,
          borderWidth: showGrid || type ? 1 : 0,
        },
      ]}
    />
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
  cell: {},
});
