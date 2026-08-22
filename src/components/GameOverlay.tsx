import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/colors';

type GameOverlayProps = {
  variant: 'pause' | 'gameOver' | 'stageClear' | 'campaignComplete';
  score?: number;
  level?: number;
  stage?: number;
  onPrimary: () => void;
  onSecondary?: () => void;
};

function GameOverlayComponent({
  variant,
  score,
  level,
  stage,
  onPrimary,
  onSecondary,
}: GameOverlayProps) {
  const isPause = variant === 'pause';
  const isStageClear = variant === 'stageClear';
  const isCampaignComplete = variant === 'campaignComplete';

  let title = 'GAME OVER';
  let primaryLabel = 'RESTART';

  if (isPause) {
    title = 'PAUSED';
    primaryLabel = 'RESUME';
  } else if (isStageClear) {
    title = 'STAGE CLEAR';
    primaryLabel = 'NEXT';
  } else if (isCampaignComplete) {
    title = 'YOU WIN';
    primaryLabel = 'PLAY AGAIN';
  }

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>{title}</Text>
      {isStageClear && level !== undefined && stage !== undefined ? (
        <Text style={styles.subtitle}>
          Level {level} · Stage {stage}
        </Text>
      ) : null}
      {!isPause && !isStageClear && score !== undefined ? (
        <Text style={styles.score}>Score: {score}</Text>
      ) : null}
      {isPause ? (
        <Text style={styles.hint}>Tap RESUME or press P / Esc</Text>
      ) : null}

      <Pressable
        style={styles.primaryButton}
        onPress={onPrimary}
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
      >
        <Text style={styles.primaryLabel}>{primaryLabel}</Text>
      </Pressable>

      {isPause && onSecondary ? (
        <Pressable
          style={styles.secondaryButton}
          onPress={onSecondary}
          accessibilityRole="button"
          accessibilityLabel="Restart game"
        >
          <Text style={styles.secondaryLabel}>RESTART</Text>
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
  score: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
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
  primaryLabel: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
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
