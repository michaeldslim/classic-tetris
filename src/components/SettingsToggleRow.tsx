import { StyleSheet, Switch, Text, View } from 'react-native';
import { theme } from '../theme/colors';

type SettingsToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function SettingsToggleRow({
  label,
  description,
  value,
  onValueChange,
}: SettingsToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,0.2)', true: theme.accent }}
        thumbColor={theme.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: theme.boardBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  text: {
    flex: 1,
    gap: 2,
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
  },
});
