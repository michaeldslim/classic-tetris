import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { careerRankKey } from '../career/careerLabels';
import type { AvatarId } from '../constants/avatars';
import { INITIALS_LENGTH, normalizeInitials, isValidInitials } from '../leaderboard/leaderboardProgress';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';
import { PlayerAvatar } from './PlayerAvatar';

type ChairmanSaveOverlayProps = {
  visible: boolean;
  score: number;
  playerAvatarId: AvatarId;
  onSave: (initials: string) => void;
};

export function ChairmanSaveOverlay({
  visible,
  score,
  playerAvatarId,
  onSave,
}: ChairmanSaveOverlayProps) {
  const { translate } = useSettings();
  const [initials, setInitials] = useState('');
  const normalized = normalizeInitials(initials);
  const canSave = isValidInitials(normalized);

  const handleChange = useCallback((value: string) => {
    setInitials(normalizeInitials(value));
  }, []);

  const handleSave = useCallback(() => {
    if (!canSave) {
      return;
    }
    onSave(normalized);
    setInitials('');
  }, [canSave, normalized, onSave]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.backdrop} />
      <View style={styles.card}>
        <Text style={styles.title}>{translate('leaderboard.save.title')}</Text>
        <Text style={styles.subtitle}>{translate('leaderboard.save.subtitle')}</Text>

        <View style={styles.avatarWrap}>
          <PlayerAvatar avatarId={playerAvatarId} size="lg" />
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>{translate('leaderboard.save.score')}</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>

        <Text style={styles.rankLabel}>
          {translate('leaderboard.save.rank', {
            rank: translate(careerRankKey('chairman')),
          })}
        </Text>

        <TextInput
          style={styles.input}
          value={initials}
          onChangeText={handleChange}
          maxLength={INITIALS_LENGTH}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          placeholder={translate('leaderboard.save.initialsPlaceholder')}
          placeholderTextColor={theme.textMuted}
          accessibilityLabel={translate('leaderboard.save.initialsLabel')}
        />
        <Text style={styles.inputHint}>{translate('leaderboard.save.initialsHint')}</Text>

        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityLabel={translate('leaderboard.save.button')}
        >
          <Text style={[styles.saveButtonLabel, !canSave && styles.saveButtonLabelDisabled]}>
            {translate('leaderboard.save.button')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 110,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  card: {
    width: '88%',
    maxWidth: 320,
    backgroundColor: 'rgba(15, 15, 26, 0.98)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f0c000',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
  },
  title: {
    color: '#f0c000',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.panelBorder,
  },
  scoreLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  scoreValue: {
    color: theme.accent,
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  rankLabel: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    marginTop: 4,
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 10,
    color: theme.accent,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inputHint: {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 4,
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonLabel: {
    color: theme.background,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  saveButtonLabelDisabled: {
    color: theme.background,
  },
});
