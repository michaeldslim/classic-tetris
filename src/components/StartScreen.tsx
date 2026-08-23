import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCareerProgressCopy } from '../career/careerLabels';
import { useCareer } from '../career/CareerProvider';
import { useScore } from '../score/ScoreProvider';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';
import { PlayerAvatar } from './PlayerAvatar';

type StartScreenProps = {
  onStart: () => void;
  onOpenSettings: () => void;
};

function StartScreenComponent({ onStart, onOpenSettings }: StartScreenProps) {
  const { settings, translate } = useSettings();
  const { careerState, loaded: careerLoaded } = useCareer();
  const { scoreRecord, loaded: scoreLoaded } = useScore();

  const careerBadge =
    settings.careerModeEnabled && careerLoaded
      ? getCareerProgressCopy(translate, careerState).primary
      : null;

  const highScoreBadge =
    !settings.careerModeEnabled && scoreLoaded && scoreRecord.highScore > 0
      ? translate('home.highScore', {
          score: scoreRecord.highScore.toLocaleString(),
        })
      : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Pressable
          style={styles.settingsButton}
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel={translate('accessibility.settings')}
        >
          <Text style={styles.settingsLabel}>⚙</Text>
        </Pressable>

        <View style={styles.hero}>
          <PlayerAvatar avatarId={settings.playerAvatarId} size="xl" />
          <Text style={styles.title}>{translate('app.title')}</Text>
          {careerBadge ? <Text style={styles.careerBadge}>{careerBadge}</Text> : null}
          {highScoreBadge ? <Text style={styles.highScoreBadge}>{highScoreBadge}</Text> : null}
        </View>

        <Pressable
          style={styles.startButton}
          onPress={onStart}
          accessibilityRole="button"
          accessibilityLabel={translate('home.startGame')}
        >
          <Text style={styles.startLabel}>{translate('home.startGame')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export const StartScreen = memo(StartScreenComponent);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  settingsButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
  },
  settingsLabel: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: theme.accent,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
  },
  careerBadge: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  highScoreBadge: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  startButton: {
    alignSelf: 'stretch',
    backgroundColor: theme.panel,
    borderColor: theme.accent,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: theme.accent,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  startLabel: {
    color: theme.accent,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
