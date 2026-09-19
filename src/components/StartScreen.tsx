import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCareerProgressCopy } from '../career/careerLabels';
import { useCareer } from '../career/CareerProvider';
import { getSessionProgressLabel, type GameSessionSnapshot } from '../game/gameStorage';
import { useLeaderboard } from '../leaderboard/LeaderboardProvider';
import { useScore } from '../score/ScoreProvider';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';
import { PlayerAvatar } from './PlayerAvatar';

type StartScreenProps = {
  savedSession?: GameSessionSnapshot | null;
  onContinue: () => void;
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
};

function StartScreenComponent({
  savedSession = null,
  onContinue,
  onStart,
  onOpenSettings,
  onOpenLeaderboard,
}: StartScreenProps) {
  const { settings, translate } = useSettings();
  const { careerState, loaded: careerLoaded } = useCareer();
  const { scoreRecord, loaded: scoreLoaded } = useScore();
  const { leaderboard, loaded: leaderboardLoaded } = useLeaderboard();

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

  const leaderboardBadge =
    leaderboardLoaded && leaderboard.entries.length > 0
      ? translate('home.leaderboardBadge', {
          count: leaderboard.entries.length,
        })
      : null;

  const sessionProgress = savedSession ? getSessionProgressLabel(savedSession) : null;
  const continueHint = sessionProgress
    ? translate('home.continueHint', {
        ...sessionProgress,
        score: sessionProgress.score.toLocaleString(),
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
          {settings.playerAvatarVisible ? (
            <PlayerAvatar avatarId={settings.playerAvatarId} size="xl" />
          ) : null}
          <Text style={styles.title}>{translate('app.title')}</Text>
          {careerBadge ? <Text style={styles.careerBadge}>{careerBadge}</Text> : null}
          {highScoreBadge ? <Text style={styles.highScoreBadge}>{highScoreBadge}</Text> : null}
          {leaderboardBadge ? (
            <Pressable
              onPress={onOpenLeaderboard}
              accessibilityRole="button"
              accessibilityLabel={translate('leaderboard.title')}
            >
              <Text style={styles.leaderboardBadge}>{leaderboardBadge}</Text>
            </Pressable>
          ) : null}
        </View>

        {savedSession ? (
          <View style={styles.actionGroup}>
            {continueHint ? (
              <Text style={styles.continueHint}>{continueHint}</Text>
            ) : null}
            <Pressable
              style={styles.startButton}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel={translate('home.continueGame')}
            >
              <Text style={styles.startLabel}>{translate('home.continueGame')}</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={onStart}
              accessibilityRole="button"
              accessibilityLabel={translate('home.newGame')}
            >
              <Text style={styles.secondaryLabel}>{translate('home.newGame')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.startButton}
            onPress={onStart}
            accessibilityRole="button"
            accessibilityLabel={translate('home.startGame')}
          >
            <Text style={styles.startLabel}>{translate('home.startGame')}</Text>
          </Pressable>
        )}
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
  leaderboardBadge: {
    color: '#f0c000',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textDecorationLine: 'underline',
  },
  actionGroup: {
    gap: 12,
  },
  continueHint: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
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
  secondaryButton: {
    alignSelf: 'stretch',
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startLabel: {
    color: theme.accent,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  secondaryLabel: {
    color: theme.textMuted,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
