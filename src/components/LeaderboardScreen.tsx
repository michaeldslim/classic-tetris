import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { careerRankKey } from '../career/careerLabels';
import { useLeaderboard } from '../leaderboard/LeaderboardProvider';
import type { LeaderboardEntry } from '../leaderboard/types';
import { useSettings } from '../settings/SettingsContext';
import type { GameDifficulty } from '../settings/types';
import { theme } from '../theme/colors';
import { PlayerAvatar } from './PlayerAvatar';
import { ChipSelector } from './ChipSelector';

type LeaderboardScreenProps = {
  onBack: () => void;
};

type LeaderboardFilter = 'all' | 'pro';

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

function difficultyLabelKey(
  difficulty: GameDifficulty,
): 'leaderboard.difficultyCasual' | 'leaderboard.difficultyStandard' | 'leaderboard.difficultyPro' {
  if (difficulty === 'standard') {
    return 'leaderboard.difficultyStandard';
  }
  if (difficulty === 'pro') {
    return 'leaderboard.difficultyPro';
  }
  return 'leaderboard.difficultyCasual';
}

function LeaderboardEntryRow({
  entry,
  index,
  chairmanLabel,
  difficultyLabel,
  language,
}: {
  entry: LeaderboardEntry;
  index: number;
  chairmanLabel: string;
  difficultyLabel: string;
  language: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rankIndex}>{index + 1}</Text>
      <PlayerAvatar avatarId={entry.avatarId} size="sm" />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.initials}>{entry.initials}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.difficultyBadge}>{difficultyLabel}</Text>
            <Text style={styles.rankBadge}>{chairmanLabel}</Text>
          </View>
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
  const [filter, setFilter] = useState<LeaderboardFilter>('all');
  const chairmanLabel = translate(careerRankKey('chairman'));

  const filterOptions = useMemo(
    () => [
      { value: 'all' as const, label: translate('leaderboard.filterAll') },
      { value: 'pro' as const, label: translate('leaderboard.filterPro') },
    ],
    [translate],
  );

  const visibleEntries = useMemo(() => {
    if (filter === 'pro') {
      return leaderboard.entries.filter((entry) => entry.difficulty === 'pro');
    }
    return leaderboard.entries;
  }, [filter, leaderboard.entries]);

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
          {loaded && leaderboard.entries.length > 0 ? (
            <View style={styles.filterSection}>
              <ChipSelector
                options={filterOptions}
                value={filter}
                onChange={setFilter}
                accessibilityLabel={translate('leaderboard.title')}
              />
            </View>
          ) : null}

          {loaded && visibleEntries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {leaderboard.entries.length === 0
                  ? translate('leaderboard.empty.title')
                  : translate('leaderboard.filterPro')}
              </Text>
              <Text style={styles.emptyBody}>
                {leaderboard.entries.length === 0
                  ? translate('leaderboard.empty.body')
                  : translate('leaderboard.empty.body')}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {visibleEntries.map((entry, index) => (
                <LeaderboardEntryRow
                  key={entry.id}
                  entry={entry}
                  index={index}
                  chairmanLabel={chairmanLabel}
                  difficultyLabel={translate(
                    difficultyLabelKey(entry.difficulty ?? 'casual'),
                  )}
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
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: {
    color: theme.accent,
    fontSize: 22,
    fontWeight: '600',
  },
  title: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 12,
  },
  filterSection: {
    marginBottom: 4,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: theme.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  rankIndex: {
    width: 24,
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
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
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  difficultyBadge: {
    color: theme.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  rankBadge: {
    color: theme.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  score: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  date: {
    color: theme.textMuted,
    fontSize: 11,
  },
  emptyCard: {
    padding: 20,
    backgroundColor: theme.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.panelBorder,
    gap: 8,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBody: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
