import { memo, useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCareerProgressCopy } from '../career/careerLabels';
import { useCareer } from '../career/CareerProvider';
import { SCORE_ACHIEVEMENTS, achievementKey } from '../score/achievements';
import { useScore } from '../score/ScoreProvider';
import { useSettings } from '../settings/SettingsContext';
import { BGM_TRACKS } from '../settings/types';
import type { AppLanguage } from '../i18n';
import { theme } from '../theme/colors';
import { AvatarPicker } from './AvatarPicker';
import { ChipSelector, VolumeChipRow } from './ChipSelector';
import { SettingsToggleRow } from './SettingsToggleRow';

type SettingsScreenProps = {
  onBack: () => void;
  onOpenCareer: () => void;
  onCareerReset: () => void;
};

function SettingsScreenComponent({
  onBack,
  onOpenCareer,
  onCareerReset,
}: SettingsScreenProps) {
  const {
    settings,
    setLanguage,
    setBgmTrack,
    setBgmVolume,
    setSfxVolume,
    setPlayerAvatarId,
    setCareerModeEnabled,
    translate,
  } = useSettings();
  const { careerState, loaded: careerLoaded, resetCareerProgress } = useCareer();
  const { scoreRecord, loaded: scoreLoaded } = useScore();

  const careerProgressLabel =
    settings.careerModeEnabled && careerLoaded
      ? getCareerProgressCopy(translate, careerState).primary
      : null;

  const handleResetCareer = useCallback(() => {
    Alert.alert(
      translate('career.reset.confirmTitle'),
      translate('career.reset.confirmMessage'),
      [
        { text: translate('career.reset.cancel'), style: 'cancel' },
        {
          text: translate('career.reset.confirm'),
          style: 'destructive',
          onPress: () => {
            void resetCareerProgress().then(onCareerReset);
          },
        },
      ],
    );
  }, [onCareerReset, resetCareerProgress, translate]);

  const languageOptions = [
    { value: 'ko' as AppLanguage, label: translate('language.ko') },
    { value: 'en' as AppLanguage, label: translate('language.en') },
  ];

  const bgmOptions = BGM_TRACKS.map((track) => ({
    value: track,
    label: translate(`bgm.${track.toLowerCase()}`),
  }));

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
          <Text style={styles.title}>{translate('settings.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{translate('settings.language')}</Text>
            <ChipSelector
              options={languageOptions}
              value={settings.language}
              onChange={setLanguage}
              accessibilityLabel={translate('settings.language')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{translate('settings.avatars')}</Text>
            <AvatarPicker
              label={translate('settings.playerAvatar')}
              description={translate('settings.playerAvatarDescription')}
              value={settings.playerAvatarId}
              onChange={setPlayerAvatarId}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{translate('settings.sound')}</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{translate('settings.bgmTrack')}</Text>
              <ChipSelector
                options={bgmOptions}
                value={settings.bgmTrack}
                onChange={setBgmTrack}
                accessibilityLabel={translate('settings.bgmTrack')}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{translate('settings.bgmVolume')}</Text>
              <VolumeChipRow
                value={settings.bgmVolume}
                onChange={setBgmVolume}
                accessibilityLabel={translate('settings.bgmVolume')}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{translate('settings.sfxVolume')}</Text>
              <VolumeChipRow
                value={settings.sfxVolume}
                onChange={setSfxVolume}
                accessibilityLabel={translate('settings.sfxVolume')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{translate('settings.score')}</Text>
            <View style={styles.scoreSummaryRow}>
              <Text style={styles.fieldLabel}>{translate('score.highScore')}</Text>
              <Text style={styles.scoreSummaryValue}>
                {scoreLoaded ? scoreRecord.highScore.toLocaleString() : '—'}
              </Text>
            </View>
            <Text style={styles.fieldLabel}>{translate('score.achievementsTitle')}</Text>
            <View style={styles.achievementList}>
              {SCORE_ACHIEVEMENTS.map((achievement) => {
                const unlocked = scoreRecord.unlockedAchievements.includes(
                  achievement.id,
                );
                const key = achievementKey(achievement.id);
                return (
                  <View
                    key={achievement.id}
                    style={[
                      styles.achievementRow,
                      unlocked && styles.achievementRowUnlocked,
                    ]}
                  >
                    <Text
                      style={[
                        styles.achievementTitle,
                        !unlocked && styles.achievementTitleLocked,
                      ]}
                    >
                      {translate(`${key}.title`)}
                    </Text>
                    <Text style={styles.achievementDescription}>
                      {translate(`${key}.description`)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{translate('settings.career')}</Text>
            <SettingsToggleRow
              label={translate('career.modeLabel')}
              description={translate('career.modeDesc')}
              value={settings.careerModeEnabled}
              onValueChange={setCareerModeEnabled}
            />
            {settings.careerModeEnabled ? (
              <Text style={styles.careerRules}>{translate('career.rulesSnippet')}</Text>
            ) : null}
            {settings.careerModeEnabled ? (
              <Pressable accessibilityRole="link" onPress={onOpenCareer}>
                <Text style={styles.careerLink}>{translate('career.screen.title')}</Text>
              </Pressable>
            ) : null}
            {settings.careerModeEnabled && careerLoaded ? (
              <View style={styles.careerResetBlock}>
                <View style={styles.careerProgressRow}>
                  <Text style={styles.careerResetLabel}>
                    {translate('career.reset.currentProgress')}
                  </Text>
                  <Text style={styles.careerProgressValue}>{careerProgressLabel}</Text>
                </View>
                <Text style={styles.careerResetDescription}>
                  {translate('career.reset.description')}
                </Text>
                <Pressable
                  style={styles.careerResetButton}
                  onPress={handleResetCareer}
                  accessibilityRole="button"
                  accessibilityLabel={translate('career.reset.button')}
                >
                  <Text style={styles.careerResetButtonLabel}>
                    {translate('career.reset.button')}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export const SettingsScreen = memo(SettingsScreenComponent);

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
  section: {
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  scoreSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  scoreSummaryValue: {
    color: theme.accent,
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  achievementList: {
    gap: 8,
  },
  achievementRow: {
    borderWidth: 1,
    borderColor: theme.panelBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.boardBackground,
    gap: 2,
  },
  achievementRowUnlocked: {
    borderColor: theme.accent,
  },
  achievementTitle: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  achievementTitleLocked: {
    color: theme.textMuted,
  },
  achievementDescription: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  careerRules: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  careerLink: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  careerResetBlock: {
    gap: 8,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.panelBorder,
  },
  careerProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  careerResetLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  careerProgressValue: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  careerResetDescription: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  careerResetButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.panelBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.boardBackground,
  },
  careerResetButtonLabel: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
