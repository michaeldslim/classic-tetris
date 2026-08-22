import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PlayerProfile } from '../game/profile';
import { theme } from '../theme/colors';

type PlayerStatusBarProps = {
  profile: PlayerProfile;
};

function PlayerStatusBarComponent({ profile }: PlayerStatusBarProps) {
  const { promotion } = profile;
  const progressPercent = Math.round(promotion.progress * 100);

  return (
    <View style={styles.container}>
      <View
        style={[styles.avatar, { backgroundColor: profile.avatarColor }]}
      >
        <Text style={styles.avatarLabel}>{profile.avatarLabel}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.rankRow}>
          <Text style={styles.displayName}>{profile.displayName}</Text>
          <Text style={styles.tierBadge}>
            {promotion.tierName} Lv.{promotion.tierLevel}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>

        <Text style={styles.progressHint}>
          {promotion.nextTierName
            ? `${progressPercent}% → ${promotion.nextTierName}`
            : `${progressPercent}%`}
        </Text>
      </View>
    </View>
  );
}

export const PlayerStatusBar = memo(PlayerStatusBarComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  displayName: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  tierBadge: {
    color: theme.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.boardBackground,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.accent,
  },
  progressHint: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
});
