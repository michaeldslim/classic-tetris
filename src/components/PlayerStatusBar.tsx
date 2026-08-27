import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AvatarId } from '../constants/avatars';
import { theme } from '../theme/colors';
import { PlayerAvatar } from './PlayerAvatar';

export type CareerBarInfo = {
  rankLabel: string;
  progress: number;
  progressHint: string;
  nextStageLabel?: string;
};

type PlayerStatusBarProps = {
  avatarId: AvatarId;
  careerMode: boolean;
  career?: CareerBarInfo;
  score?: number;
  highScore?: number;
  isPersonalBest?: boolean;
  scoreLabel: string;
  highScoreLabel: string;
  newBestLabel: string;
};

function PlayerStatusBarComponent({
  avatarId,
  careerMode,
  career,
  score = 0,
  highScore = 0,
  isPersonalBest = false,
  scoreLabel,
  highScoreLabel,
  newBestLabel,
}: PlayerStatusBarProps) {
  const progressPercent = career
    ? Math.round(Math.min(1, Math.max(0, career.progress)) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <PlayerAvatar avatarId={avatarId} size="md" />

      {careerMode && career ? (
        <View style={styles.info}>
          <View style={styles.rankRow}>
            <Text style={styles.rankLabel}>{career.rankLabel}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>

          {career.nextStageLabel ? (
            <Text style={styles.nextStageLabel}>{career.nextStageLabel}</Text>
          ) : null}

          <Text style={styles.progressHint}>{career.progressHint}</Text>
        </View>
      ) : (
        <View style={styles.info}>
          <View style={styles.scoreHeaderRow}>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
            {isPersonalBest ? (
              <Text style={styles.newBestBadge}>{newBestLabel}</Text>
            ) : null}
          </View>
          <Text style={styles.scoreCaption}>{scoreLabel}</Text>
          <Text style={styles.highScoreHint}>
            {highScoreLabel}: {highScore.toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
}

export const PlayerStatusBar = memo(PlayerStatusBarComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  info: {
    flex: 1,
    gap: 2,
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
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  scoreCaption: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  newBestBadge: {
    color: theme.background,
    backgroundColor: theme.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  highScoreHint: {
    color: theme.text,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
