import { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  careerRankKey,
  getCareerLadderDetailCopy,
  getCareerLadderRows,
  getCareerLadderStatus,
  getCareerProgressCopy,
  getHiddenStageLadderLabel,
  getHiddenStageLadderStatus,
  getHiddenStagesForLadderRank,
  isMaxCareerRank,
  type CareerLadderStatus,
} from '../career/careerLabels';
import { useCareer } from '../career/CareerProvider';
import type { CareerRank, CareerState } from '../career/types';
import type { AvatarId } from '../constants/avatars';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';
import { PlayerAvatar } from './PlayerAvatar';

type CareerScreenProps = {
  onBack: () => void;
  onOpenSettings: () => void;
};

function ladderStatusLabel(
  translate: (key: string) => string,
  status: CareerLadderStatus,
): string {
  switch (status) {
    case 'achieved':
      return translate('career.ladder.achieved');
    case 'current':
      return translate('career.ladder.current');
    default:
      return translate('career.ladder.locked');
  }
}

function CareerDisabledState({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { translate } = useSettings();

  return (
    <View style={styles.disabledCard}>
      <Text style={styles.disabledTitle}>{translate('career.screen.disabledTitle')}</Text>
      <Text style={styles.disabledBody}>{translate('career.screen.disabledBody')}</Text>
      <Pressable style={styles.linkButton} onPress={onOpenSettings}>
        <Text style={styles.linkButtonText}>
          {translate('career.screen.enableInSettings')}
        </Text>
      </Pressable>
    </View>
  );
}

function CareerSummary({
  state,
  playerAvatarId,
}: {
  state: CareerState;
  playerAvatarId: AvatarId;
}) {
  const { translate } = useSettings();
  const progress = getCareerProgressCopy(translate, state);
  const highestLabel = translate(careerRankKey(state.highestRankAchieved));
  const showHighest =
    state.highestRankAchieved !== state.rank || isMaxCareerRank(state);

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <PlayerAvatar avatarId={playerAvatarId} size="lg" />
        <View style={styles.summaryText}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {translate('career.screen.currentRank')}
            </Text>
            <Text style={styles.summaryValue}>{progress.primary}</Text>
          </View>
          {progress.secondary ? (
            <Text style={styles.summaryHint}>{progress.secondary}</Text>
          ) : null}
          {progress.nextStage ? (
            <Text style={styles.summaryNextStage}>{progress.nextStage}</Text>
          ) : null}
        </View>
      </View>
      {showHighest ? (
        <View style={[styles.summaryRow, styles.summaryRowSpaced]}>
          <Text style={styles.summaryLabel}>
            {translate('career.screen.highestRank')}
          </Text>
          <Text style={styles.summaryValue}>{highestLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

function LadderRow({
  rank,
  state,
  isLast,
}: {
  rank: CareerRank;
  state: CareerState;
  isLast: boolean;
}) {
  const { translate } = useSettings();
  const status = getCareerLadderStatus(state, rank);
  const detail = getCareerLadderDetailCopy(translate, state, rank, status);
  const isHighlighted = status === 'current' || rank === state.highestRankAchieved;

  return (
    <View style={styles.ladderRow}>
      <View style={styles.ladderRail}>
        <View
          style={[
            styles.ladderDot,
            status === 'achieved' && styles.ladderDotAchieved,
            status === 'current' && styles.ladderDotCurrent,
            status === 'locked' && styles.ladderDotLocked,
          ]}
        />
        {!isLast ? <View style={styles.ladderLine} /> : null}
      </View>

      <View
        style={[
          styles.ladderCard,
          isHighlighted && styles.ladderCardHighlighted,
          status === 'locked' && styles.ladderCardLocked,
        ]}
      >
        <View style={styles.ladderHeader}>
          <Text
            style={[
              styles.ladderRank,
              status === 'current' && styles.ladderRankCurrent,
              status === 'locked' && styles.ladderRankLocked,
            ]}
          >
            {translate(careerRankKey(rank))}
          </Text>
          <Text
            style={[
              styles.ladderStatus,
              status === 'achieved' && styles.ladderStatusAchieved,
              status === 'current' && styles.ladderStatusCurrent,
            ]}
          >
            {ladderStatusLabel(translate, status)}
          </Text>
        </View>
        {detail ? <Text style={styles.ladderDetail}>{detail}</Text> : null}
        <HiddenStageList rank={rank} state={state} />
      </View>
    </View>
  );
}

function HiddenStageList({
  rank,
  state,
}: {
  rank: CareerRank;
  state: CareerState;
}) {
  const { translate } = useSettings();
  const hiddenIndices = getHiddenStagesForLadderRank(rank);

  if (hiddenIndices.length === 0) {
    return null;
  }

  return (
    <View style={styles.hiddenList}>
      {hiddenIndices.map((hiddenIndex) => {
        const status = getHiddenStageLadderStatus(state, rank, hiddenIndex);
        const label = getHiddenStageLadderLabel(translate, rank, hiddenIndex, status);

        return (
          <View
            key={`${rank}-hidden-${hiddenIndex}`}
            style={[
              styles.hiddenRow,
              status === 'current' && styles.hiddenRowCurrent,
              status === 'achieved' && styles.hiddenRowAchieved,
            ]}
          >
            <Text style={styles.hiddenIcon}>{status === 'locked' ? '🔒' : '◆'}</Text>
            <Text
              style={[
                styles.hiddenLabel,
                status === 'locked' && styles.hiddenLabelLocked,
                status === 'current' && styles.hiddenLabelCurrent,
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function CareerScreenComponent({ onBack, onOpenSettings }: CareerScreenProps) {
  const { settings, translate } = useSettings();
  const { careerState, loaded } = useCareer();
  const ladderRows = getCareerLadderRows();

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
          <Text style={styles.title}>{translate('career.screen.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!settings.careerModeEnabled ? (
            <CareerDisabledState onOpenSettings={onOpenSettings} />
          ) : !loaded ? null : (
            <>
              <CareerSummary
                state={careerState}
                playerAvatarId={settings.playerAvatarId}
              />
              <Text style={styles.rulesText}>{translate('career.rulesSnippet')}</Text>
              <View style={styles.ladderSection}>
                <Text style={styles.sectionTitle}>
                  {translate('career.screen.ladderTitle')}
                </Text>
                {ladderRows.map((rank, index) => (
                  <LadderRow
                    key={rank}
                    rank={rank}
                    state={careerState}
                    isLast={index === ladderRows.length - 1}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export const CareerScreen = memo(CareerScreenComponent);

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
    gap: 20,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: theme.panel,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  summaryText: {
    flex: 1,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  summaryRowSpaced: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.panelBorder,
  },
  summaryLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  summaryHint: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  summaryNextStage: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  rulesText: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  ladderSection: {
    gap: 0,
  },
  sectionTitle: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  ladderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ladderRail: {
    width: 18,
    alignItems: 'center',
  },
  ladderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 18,
    backgroundColor: theme.text,
    opacity: 0.35,
  },
  ladderDotAchieved: {
    backgroundColor: theme.accent,
    opacity: 1,
  },
  ladderDotCurrent: {
    backgroundColor: theme.accent,
    opacity: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 17,
  },
  ladderDotLocked: {
    backgroundColor: theme.text,
    opacity: 0.2,
  },
  ladderLine: {
    flex: 1,
    width: 2,
    backgroundColor: theme.panelBorder,
    marginVertical: 4,
  },
  ladderCard: {
    flex: 1,
    backgroundColor: theme.panel,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  ladderCardHighlighted: {
    borderColor: 'rgba(240, 240, 0, 0.45)',
    backgroundColor: 'rgba(240, 240, 0, 0.06)',
  },
  ladderCardLocked: {
    opacity: 0.72,
  },
  ladderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  ladderRank: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  ladderRankCurrent: {
    color: theme.accent,
  },
  ladderRankLocked: {
    opacity: 0.75,
  },
  ladderStatus: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  ladderStatusAchieved: {
    color: theme.accent,
    opacity: 0.9,
  },
  ladderStatusCurrent: {
    color: theme.accent,
    opacity: 1,
  },
  ladderDetail: {
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  hiddenList: {
    marginTop: 8,
    gap: 6,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.panelBorder,
  },
  hiddenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  hiddenRowCurrent: {
    opacity: 1,
  },
  hiddenRowAchieved: {
    opacity: 0.85,
  },
  hiddenIcon: {
    fontSize: 11,
    width: 16,
    textAlign: 'center',
  },
  hiddenLabel: {
    flex: 1,
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  hiddenLabelLocked: {
    opacity: 0.65,
  },
  hiddenLabelCurrent: {
    color: theme.accent,
    fontWeight: '700',
  },
  disabledCard: {
    backgroundColor: theme.panel,
    borderRadius: 12,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  disabledTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBody: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  linkButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  linkButtonText: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
