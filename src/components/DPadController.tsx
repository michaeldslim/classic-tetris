import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameAction } from '../game/types';
import { theme } from '../theme/colors';

type DPadControllerProps = {
  onAction: (action: GameAction) => void;
};

type PadButtonProps = {
  label: string;
  onPress: () => void;
  size?: number;
};

function PadButton({ label, onPress, size = 56 }: PadButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.padButton,
        {
          width: size,
          height: size,
          backgroundColor: pressed ? '#4a4a6a' : '#2d2d44',
        },
      ]}
      hitSlop={8}
    >
      <Text style={styles.padLabel}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: pressed ? '#5a3a3a' : '#3a2a2a' },
      ]}
    >
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function DPadControllerComponent({ onAction }: DPadControllerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <ActionButton label="DROP" onPress={() => onAction('HARD_DROP')} />
      </View>

      <View style={styles.dpad}>
        <View style={styles.topRow}>
          <PadButton label="↻" onPress={() => onAction('ROTATE')} />
        </View>
        <View style={styles.middleRow}>
          <PadButton label="←" onPress={() => onAction('LEFT')} />
          <PadButton label="↓" onPress={() => onAction('SOFT_DROP')} />
          <PadButton label="→" onPress={() => onAction('RIGHT')} />
        </View>
      </View>
    </View>
  );
}

export const DPadController = memo(DPadControllerComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24,
  },
  dpad: {
    alignItems: 'center',
    gap: 4,
  },
  topRow: {
    alignItems: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    gap: 4,
  },
  padButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  padLabel: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
  },
  actions: {
    gap: 10,
    flex: 1,
    maxWidth: 120,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  actionLabel: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
