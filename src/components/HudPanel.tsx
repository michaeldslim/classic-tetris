import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { GameStats } from '../game/types';
import type { TetrominoType } from '../theme/colors';
import { theme } from '../theme/colors';
import { MiniBoard } from './MiniBoard';

type HudPanelProps = {
  stats: GameStats;
  nextPiece: TetrominoType | null;
};

function StatBlock({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function HudPanelComponent({
  stats,
  nextPiece,
}: HudPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statsColumn}>
        <StatBlock label="SCORE" value={stats.score} />
        <StatBlock label="LVL" value={stats.level} />
        <StatBlock label="STG" value={stats.stage} />
        <StatBlock
          label="LINE"
          value={`${stats.lines}/${stats.lineTarget}`}
        />
      </View>

      <View style={styles.miniBoards}>
        <MiniBoard label="NEXT" piece={nextPiece} cellSize={12} />
      </View>
    </View>
  );
}

export const HudPanel = memo(HudPanelComponent);

const styles = StyleSheet.create({
  container: {
    width: 72,
    alignItems: 'center',
    gap: 14,
  },
  statsColumn: {
    alignItems: 'center',
    gap: 6,
  },
  statBlock: {
    width: 52,
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  statValue: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  miniBoards: {
    gap: 12,
  },
});
