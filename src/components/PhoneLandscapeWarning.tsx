import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';

/** Full-screen replacement when phone is in landscape (portrait-only on mobile). */
export function PhoneLandscapeWarning() {
  const { translate } = useSettings();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']} accessibilityRole="alert">
      <View style={styles.content}>
        <Text style={styles.icon}>📱</Text>
        <Text style={styles.title}>{translate('common.rotateToPortraitTitle')}</Text>
        <View style={styles.bodyBlock}>
          <Text style={styles.body}>{translate('common.rotateToPortraitBodyLine1')}</Text>
          <Text style={styles.body}>{translate('common.rotateToPortraitBodyLine2')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  icon: {
    fontSize: 48,
    marginBottom: 4,
  },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  bodyBlock: {
    alignItems: 'center',
    gap: 4,
  },
  body: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
