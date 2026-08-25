import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';

type GameOverlayProps = {
  variant: 'pause' | 'gameOver' | 'stageClear' | 'campaignComplete';
  score?: number;
  highScore?: number;
  isNewHighScore?: boolean;
  level?: number;
  stage?: number;
  careerHint?: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  onSecondary?: () => void;
};

function GameOverlayComponent({
  variant,
  score,
  highScore,
  isNewHighScore = false,
  level,
  stage,
  careerHint,
  primaryDisabled = false,
  onPrimary,
  onSecondary,
}: GameOverlayProps) {
  const { translate } = useSettings();
  const isPause = variant === 'pause';
  const isStageClear = variant === 'stageClear';
  const isCampaignComplete = variant === 'campaignComplete';

  let title = translate('overlay.gameOver');
  let primaryLabel = translate('overlay.restart');

  if (isPause) {
    title = translate('overlay.paused');
    primaryLabel = translate('overlay.resume');
  } else if (isStageClear) {
    title = translate('overlay.stageClear');
    primaryLabel = translate('overlay.next');
  } else if (isCampaignComplete) {
    title = translate('overlay.youWin');
    primaryLabel = translate('overlay.playAgain');
  }

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>{title}</Text>
      {isStageClear && level !== undefined && stage !== undefined ? (
        <Text style={styles.subtitle}>
          {translate('overlay.stageInfo', {
            level: String(level),
            stage: String(stage),
          })}
        </Text>
      ) : null}
      {isStageClear && careerHint ? (
        <Text style={styles.careerHint}>{careerHint}</Text>
      ) : null}
      {!isPause && !isStageClear && score !== undefined ? (
        <Text style={styles.score}>
          {translate('overlay.score', { score: String(score) })}
        </Text>
      ) : null}
      {!isPause && !isStageClear && highScore !== undefined ? (
        <Text style={[styles.highScore, isNewHighScore && styles.newHighScore]}>
          {isNewHighScore
            ? translate('overlay.newHighScore')
            : translate('overlay.highScore', { score: String(highScore) })}
        </Text>
      ) : null}
      {isPause ? (
        <Text style={styles.hint}>{translate('overlay.pauseHint')}</Text>
      ) : null}

      <Pressable
        style={[styles.primaryButton, primaryDisabled && styles.primaryButtonDisabled]}
        onPress={onPrimary}
        disabled={primaryDisabled}
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        accessibilityState={{ disabled: primaryDisabled }}
      >
        <Text style={[styles.primaryLabel, primaryDisabled && styles.primaryLabelDisabled]}>
          {primaryLabel}
        </Text>
      </Pressable>

      {isPause && onSecondary ? (
        <Pressable
          style={styles.secondaryButton}
          onPress={onSecondary}
          accessibilityRole="button"
          accessibilityLabel={translate('overlay.restart')}
        >
          <Text style={styles.secondaryLabel}>{translate('overlay.restart')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const GameOverlay = memo(GameOverlayComponent);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 15, 26, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  title: {
    color: theme.accent,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  careerHint: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  score: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  highScore: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  newHighScore: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hint: {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryLabel: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  primaryLabelDisabled: {
    color: theme.textMuted,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryLabel: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
