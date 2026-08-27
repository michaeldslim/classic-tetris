import { memo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getGravityTier } from '../game/campaign';
import type { GameStats } from '../game/types';
import type { TetrominoType } from '../theme/colors';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';
import { MiniBoard } from './MiniBoard';

type HudPanelProps = {
  stats: GameStats;
  nextPiece: TetrominoType | null;
  careerMode: boolean;
};

const SPEED_DOT_COUNT = 5;

function SpeedDots({ tier }: { tier: number }) {
  if (tier <= 0) {
    return null;
  }

  return (
    <View style={styles.speedDots}>
      {Array.from({ length: SPEED_DOT_COUNT }, (_, index) => (
        <View
          key={`speed-dot-${index}`}
          style={[styles.speedDot, index < tier && styles.speedDotFilled]}
        />
      ))}
    </View>
  );
}

function StatBlock({
  label,
  value,
  footer,
}: {
  label: string;
  value: string | number;
  footer?: ReactNode;
}) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {footer}
    </View>
  );
}

function HudPanelComponent({
  stats,
  nextPiece,
  careerMode,
}: HudPanelProps) {
  const { translate } = useSettings();
  const gravityTier = getGravityTier(stats.stage);

  return (
    <View style={styles.container}>
      <View style={styles.statsColumn}>
        {careerMode ? (
          <StatBlock label={translate('hud.score')} value={stats.score} />
        ) : (
          <StatBlock
            label={translate('hud.stage')}
            value={stats.stage}
            footer={<SpeedDots tier={gravityTier} />}
          />
        )}
        {!careerMode ? (
          <StatBlock label={translate('hud.level')} value={stats.level} />
        ) : null}
        <StatBlock
          label={translate('hud.line')}
          value={`${stats.lines}/${stats.lineTarget}`}
          footer={careerMode ? <SpeedDots tier={gravityTier} /> : null}
        />
      </View>

      <View style={styles.miniBoards}>
        <MiniBoard label={translate('hud.next')} piece={nextPiece} cellSize={12} />
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
    alignItems: 'center',
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
  speedDots: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
  },
  speedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.panelBorder,
  },
  speedDotFilled: {
    backgroundColor: theme.accent,
  },
  miniBoards: {
    gap: 12,
  },
});
