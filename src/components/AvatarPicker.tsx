import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AVATAR_IDS, type AvatarId } from '../constants/avatars';
import { theme } from '../theme/colors';
import { PlayerAvatar } from './PlayerAvatar';

type AvatarPickerProps = {
  label: string;
  description?: string;
  value: AvatarId;
  onChange: (value: AvatarId) => void;
  /** When false, only the selected avatar is shown (grid collapsed). */
  gridExpanded: boolean;
  collapsedHint?: string;
};

export function AvatarPicker({
  label,
  description,
  value,
  onChange,
  gridExpanded,
  collapsedHint,
}: AvatarPickerProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}

      {!gridExpanded ? (
        <View style={styles.collapsedRow}>
          <PlayerAvatar avatarId={value} size="lg" selected />
          {collapsedHint ? (
            <Text style={styles.collapsedHint}>{collapsedHint}</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.grid}>
          {AVATAR_IDS.map((avatarId) => {
            const selected = avatarId === value;
            return (
              <Pressable
                key={avatarId}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChange(avatarId)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <PlayerAvatar avatarId={avatarId} size="lg" selected={selected} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  label: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: -4,
  },
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  collapsedHint: {
    flex: 1,
    color: theme.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  option: {
    padding: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: 'rgba(240, 240, 0, 0.45)',
    backgroundColor: 'rgba(240, 240, 0, 0.08)',
  },
});
