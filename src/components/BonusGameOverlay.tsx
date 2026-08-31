import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BONUS_DURATION_MS,
  BONUS_LINE_TARGET,
  BONUS_SCORE_MULTIPLIER,
} from '../game/bonusGame';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';

type BonusGameOverlayProps = {
  visible: boolean;
  phase: 'intro' | 'result';
  earnedScore?: number;
  success?: boolean;
  onPrimary: () => void;
};

function BonusGameOverlayComponent({
  visible,
  phase,
  earnedScore = 0,
  success = false,
  onPrimary,
}: BonusGameOverlayProps) {
  const { translate } = useSettings();

  if (!visible) {
    return null;
  }

  const isIntro = phase === 'intro';
  const title = isIntro
    ? translate('bonus.title')
    : success
      ? translate('bonus.cleared')
      : translate('bonus.ended');
  const primaryLabel = isIntro
    ? translate('bonus.start')
    : translate('bonus.continue');
  const durationSec = Math.round(BONUS_DURATION_MS / 1000);

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>{title}</Text>
      {isIntro ? (
        <>
          <Text style={styles.subtitle}>
            {translate('bonus.scoreMultiplier', {
              multiplier: String(BONUS_SCORE_MULTIPLIER),
            })}
          </Text>
          <Text style={styles.hint}>
            {translate('bonus.rules', {
              lines: String(BONUS_LINE_TARGET),
              seconds: String(durationSec),
            })}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            {translate('bonus.earnedScore', { score: String(earnedScore) })}
          </Text>
          <Text style={styles.hint}>
            {success
              ? translate('bonus.successHint')
              : translate('bonus.failHint')}
          </Text>
        </>
      )}

      <Pressable
        style={styles.primaryButton}
        onPress={onPrimary}
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
      >
        <Text style={styles.primaryLabel}>{primaryLabel}</Text>
      </Pressable>
    </View>
  );
}

export const BonusGameOverlay = memo(BonusGameOverlayComponent);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 15, 26, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    zIndex: 90,
  },
  title: {
    color: theme.accent,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  primaryLabel: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
