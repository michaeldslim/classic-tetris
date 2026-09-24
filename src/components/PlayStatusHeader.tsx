import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AvatarId } from '../constants/avatars';
import { getGravityTier } from '../game/campaign';
import type { GameStats } from '../game/types';
import type { TetrominoType } from '../theme/colors';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';
import { MiniBoard } from './MiniBoard';
import { PlayerAvatar } from './PlayerAvatar';

const SPEED_DOT_COUNT = 5;
const NEXT_CELL_SIZE = 10;

export type CareerBarInfo = {
  rankLabel: string;
  progress: number;
  progressHint: string;
  nextStageLabel?: string;
};

type PlayStatusHeaderProps = {
  avatarId: AvatarId;
  careerMode: boolean;
  difficultyLabel?: string;
  career?: CareerBarInfo;
  score: number;
  highScore?: number;
  isPersonalBest?: boolean;
  scoreLabel: string;
  highScoreLabel: string;
  newBestLabel: string;
  stats: GameStats;
  nextPiece: TetrominoType | null;
  onOpenSettings: () => void;
  onPauseToggle: () => void;
  pauseDisabled?: boolean;
  paused?: boolean;
  pauseDimmed?: boolean;
  settingsAccessibilityLabel: string;
  pauseAccessibilityLabel: string;
};

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

function StatChip({
  label,
  value,
  footer,
  emphasizeValue = false,
}: {
  label: string;
  value: string | number;
  footer?: ReactNode;
  emphasizeValue?: boolean;
}) {
  return (
    <View style={[styles.statChip, emphasizeValue && styles.statChipEmphasis]}>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.statValue, emphasizeValue && styles.statValueEmphasis]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {footer}
    </View>
  );
}

function PlayStatusHeaderComponent({
  avatarId,
  careerMode,
  difficultyLabel,
  career,
  score,
  highScore = 0,
  isPersonalBest = false,
  scoreLabel,
  highScoreLabel,
  newBestLabel,
  stats,
  nextPiece,
  onOpenSettings,
  onPauseToggle,
  pauseDisabled = false,
  paused = false,
  pauseDimmed = false,
  settingsAccessibilityLabel,
  pauseAccessibilityLabel,
}: PlayStatusHeaderProps) {
  const { translate } = useSettings();
  const gravityTier = stats.gravityTier ?? getGravityTier(stats.stage);
  const isBonus = stats.bonusMode === true;
  const progressPercent = career
    ? Math.round(Math.min(1, Math.max(0, career.progress)) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <PlayerAvatar avatarId={avatarId} size="md" />

        <View style={styles.infoColumn}>
          {careerMode && career ? (
            <>
              <View style={styles.rankRow}>
                <Text style={styles.rankLabel}>{career.rankLabel}</Text>
                {difficultyLabel ? (
                  <Text style={styles.difficultyBadge}>{difficultyLabel}</Text>
                ) : null}
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progressPercent}%` }]}
                />
              </View>
              {career.nextStageLabel ? (
                <Text style={styles.nextStageLabel}>{career.nextStageLabel}</Text>
              ) : null}
              <Text style={styles.progressHint}>{career.progressHint}</Text>
            </>
          ) : (
            <>
              <View style={styles.scoreHeaderRow}>
                <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
                {isPersonalBest ? (
                  <Text style={styles.newBestBadge}>{newBestLabel}</Text>
                ) : null}
              </View>
              <Text style={styles.scoreCaption}>{scoreLabel}</Text>
              {highScore !== undefined ? (
                <Text style={styles.highScoreHint}>
                  {highScoreLabel}: {highScore.toLocaleString()}
                </Text>
              ) : null}
            </>
          )}

          <View style={styles.chipBand}>
            <Pressable
              style={styles.controlButton}
              onPress={onOpenSettings}
              accessibilityRole="button"
              accessibilityLabel={settingsAccessibilityLabel}
            >
              <Text style={styles.controlIcon}>⚙</Text>
            </Pressable>

            <View style={styles.chipRow}>
              {isBonus ? (
                <>
                  <StatChip
                    label={translate('hud.timer')}
                    value={stats.bonusTimerSec ?? 0}
                  />
                  <StatChip
                    label={translate('hud.multiplier', {
                      multiplier: String(stats.bonusMultiplier ?? 2),
                    })}
                    value={`×${stats.bonusMultiplier ?? 2}`}
                  />
                </>
              ) : (
                <>
                  {careerMode ? (
                    <StatChip
                      label={translate('hud.score')}
                      value={stats.score}
                      emphasizeValue
                    />
                  ) : (
                    <>
                      <StatChip
                        label={translate('hud.stage')}
                        value={stats.stage}
                        footer={<SpeedDots tier={gravityTier} />}
                      />
                      <StatChip label={translate('hud.level')} value={stats.level} />
                    </>
                  )}
                  <StatChip
                    label={translate('hud.line')}
                    value={`${stats.lines}/${stats.lineTarget}`}
                    footer={
                      !isBonus && careerMode ? <SpeedDots tier={gravityTier} /> : null
                    }
                    emphasizeValue
                  />
                </>
              )}
            </View>

            <Pressable
              style={styles.controlButton}
              onPress={onPauseToggle}
              disabled={pauseDisabled}
              accessibilityRole="button"
              accessibilityLabel={pauseAccessibilityLabel}
            >
              <Text
                style={[styles.controlPause, pauseDimmed && styles.controlPauseDimmed]}
              >
                {paused ? '▶' : '❚❚'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.nextColumn}>
          <MiniBoard
            label={translate('hud.next')}
            piece={nextPiece}
            cellSize={NEXT_CELL_SIZE}
          />
        </View>
      </View>
    </View>
  );
}

export const PlayStatusHeader = memo(PlayStatusHeaderComponent);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.panelBorder,
    backgroundColor: theme.panel,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoColumn: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rankLabel: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
  difficultyBadge: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.boardBackground,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.accent,
  },
  nextStageLabel: {
    color: theme.text,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressHint: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  scoreHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreValue: {
    color: theme.accent,
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  newBestBadge: {
    color: theme.background,
    backgroundColor: theme.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreCaption: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  highScoreHint: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  chipBand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  chipRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    minWidth: 0,
  },
  controlButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
  },
  controlIcon: {
    color: theme.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  controlPause: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  controlPauseDimmed: {
    opacity: 0.35,
  },
  statChip: {
    minWidth: 52,
    backgroundColor: theme.background,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statValue: {
    color: theme.accent,
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statChipEmphasis: {
    minWidth: 58,
    paddingVertical: 5,
  },
  statValueEmphasis: {
    fontSize: 22,
    fontWeight: '800',
  },
  speedDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  speedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.panelBorder,
  },
  speedDotFilled: {
    backgroundColor: theme.accent,
  },
  nextColumn: {
    alignItems: 'center',
    paddingTop: 2,
  },
});
