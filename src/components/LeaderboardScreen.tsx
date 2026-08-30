import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { careerRankKey } from '../career/careerLabels';
import { useLeaderboard } from '../leaderboard/LeaderboardProvider';
import type { LeaderboardEntry } from '../leaderboard/types';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';
import { PlayerAvatar } from './PlayerAvatar';

type LeaderboardScreenProps = {
  onBack: () => void;
};

function formatClearedDate(iso: string, language: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function LeaderboardEntryRow({
  entry,
  index,
  chairmanLabel,
  language,
}: {
  entry: LeaderboardEntry;
  index: number;
  chairmanLabel: string;
  language: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rankIndex}>{index + 1}</Text>
      <PlayerAvatar avatarId={entry.avatarId} size="sm" />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.initials}>{entry.initials}</Text>
          <Text style={styles.rankBadge}>{chairmanLabel}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.score}>{entry.score.toLocaleString()}</Text>
          <Text style={styles.date}>{formatClearedDate(entry.clearedAt, language)}</Text>
        </View>
      </View>
    </View>
  );
}

function LeaderboardScreenComponent({ onBack }: LeaderboardScreenProps) {
  const { settings, translate } = useSettings();
  const { leaderboard, loaded } = useLeaderboard();
  const chairmanLabel = translate(careerRankKey('chairman'));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={translate('settings.back')}
          >
            <Text style={styles.backLabel}>←</Text>
          </Pressable>
          <Text style={styles.title}>{translate('leaderboard.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loaded && leaderboard.entries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{translate('leaderboard.empty.title')}</Text>
              <Text style={styles.emptyBody}>{translate('leaderboard.empty.body')}</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {leaderboard.entries.map((entry, index) => (
                <LeaderboardEntryRow
                  key={entry.id}
                  entry={entry}
                  index={index}
                  chairmanLabel={chairmanLabel}
                  language={settings.language}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export const LeaderboardScreen = memo(LeaderboardScreenComponent);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
  },
  backLabel: {
    color: theme.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    color: theme.accent,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyCard: {
    backgroundColor: theme.panel,
    borderRadius: 12,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBody: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.panel,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  rankIndex: {
    width: 24,
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  initials: {
    color: theme.accent,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
  },
  rankBadge: {
    color: '#f0c000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  score: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  date: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
