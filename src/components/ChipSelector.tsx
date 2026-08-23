import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/colors';

export type ChipOption<T extends string> = {
  value: T;
  label: string;
};

type ChipSelectorProps<T extends string> = {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

function ChipSelectorComponent<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: ChipSelectorProps<T>) {
  return (
    <View
      style={styles.row}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
          >
            <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const ChipSelector = memo(ChipSelectorComponent) as typeof ChipSelectorComponent;

type VolumeChipRowProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  accessibilityLabel?: string;
};

function VolumeChipRowComponent({
  value,
  min = 1,
  max = 10,
  onChange,
  accessibilityLabel,
}: VolumeChipRowProps) {
  const levels = Array.from({ length: max - min + 1 }, (_, index) => min + index);

  return (
    <View
      style={styles.volumeRow}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
    >
      {levels.map((level) => {
        const selected = level === value;
        return (
          <Pressable
            key={level}
            style={[styles.volumeChip, selected && styles.chipSelected]}
            onPress={() => onChange(level)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${level}`}
          >
            <Text
              style={[
                styles.volumeLabel,
                selected && styles.chipLabelSelected,
              ]}
            >
              {level}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const VolumeChipRow = memo(VolumeChipRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.panelBorder,
    backgroundColor: theme.boardBackground,
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: theme.accent,
    backgroundColor: 'rgba(240, 240, 0, 0.12)',
    shadowColor: theme.accent,
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  chipLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  chipLabelSelected: {
    color: theme.accent,
  },
  volumeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  volumeChip: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.panelBorder,
    backgroundColor: theme.boardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
