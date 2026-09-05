import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { careerRankKey } from '../career/careerLabels';
import type { AvatarId } from '../constants/avatars';
import {
  INITIALS_LENGTH,
  normalizeInitials,
  isValidInitials,
} from '../leaderboard/leaderboardProgress';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';
import { PlayerAvatar } from './PlayerAvatar';

type ChairmanSaveOverlayProps = {
  visible: boolean;
  score: number;
  playerAvatarId: AvatarId;
  onSave: (initials: string) => void;
  onCancel?: () => void;
  cancelLabel?: string;
  presentation?: 'overlay' | 'modal';
};

export function ChairmanSaveOverlay({
  visible,
  score,
  playerAvatarId,
  onSave,
  onCancel,
  cancelLabel,
  presentation = 'overlay',
}: ChairmanSaveOverlayProps) {
  const { translate } = useSettings();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [initials, setInitials] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const normalized = normalizeInitials(initials);
  const canSave = isValidInitials(normalized);

  useEffect(() => {
    if (!visible) {
      setInitials('');
      setKeyboardVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleChange = useCallback((value: string) => {
    setInitials(normalizeInitials(value));
  }, []);

  const handleSave = useCallback(() => {
    if (!canSave) {
      return;
    }
    Keyboard.dismiss();
    onSave(normalized);
    setInitials('');
  }, [canSave, normalized, onSave]);

  const handleCancel = useCallback(() => {
    Keyboard.dismiss();
    setInitials('');
    onCancel?.();
  }, [onCancel]);

  const handleInputFocus = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  if (!visible) {
    return null;
  }

  const isModal = presentation === 'modal';

  return (
    <View style={isModal ? styles.modalRoot : styles.overlayRoot}>
      {!isModal ? <View style={styles.backdrop} /> : null}
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardVisible && styles.scrollContentKeyboard,
          ]}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>{translate('leaderboard.save.title')}</Text>
            <Text style={styles.subtitle}>{translate('leaderboard.save.subtitle')}</Text>

            {!keyboardVisible ? (
              <>
                <View style={styles.avatarWrap}>
                  <PlayerAvatar avatarId={playerAvatarId} size="lg" />
                </View>

                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>
                    {translate('leaderboard.save.score')}
                  </Text>
                  <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
                </View>

                <Text style={styles.rankLabel}>
                  {translate('leaderboard.save.rank', {
                    rank: translate(careerRankKey('chairman')),
                  })}
                </Text>
              </>
            ) : null}

            <TextInput
              style={styles.input}
              value={initials}
              onChangeText={handleChange}
              onFocus={handleInputFocus}
              maxLength={INITIALS_LENGTH}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              placeholder={translate('leaderboard.save.initialsPlaceholder')}
              placeholderTextColor={theme.textMuted}
              accessibilityLabel={translate('leaderboard.save.initialsLabel')}
            />
            <Text style={styles.inputHint}>
              {translate('leaderboard.save.initialsHint')}
            </Text>

            <Pressable
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}
              accessibilityRole="button"
              accessibilityLabel={translate('leaderboard.save.button')}
            >
              <Text
                style={[
                  styles.saveButtonLabel,
                  !canSave && styles.saveButtonLabelDisabled,
                ]}
              >
                {translate('leaderboard.save.button')}
              </Text>
            </Pressable>

            {onCancel ? (
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancel}
                accessibilityRole="button"
                accessibilityLabel={cancelLabel ?? translate('leaderboard.save.devCancel')}
              >
                <Text style={styles.cancelButtonLabel}>
                  {cancelLabel ?? translate('leaderboard.save.devCancel')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 120,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  keyboardAvoider: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  scrollContentKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: 48,
    paddingBottom: 32,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(15, 15, 26, 0.98)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f0c000',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
  },
  title: {
    color: '#f0c000',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.panelBorder,
  },
  scoreLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  scoreValue: {
    color: theme.accent,
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  rankLabel: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    marginTop: 4,
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 10,
    color: theme.accent,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inputHint: {
    color: theme.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 4,
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonLabel: {
    color: theme.background,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  saveButtonLabelDisabled: {
    color: theme.background,
  },
  cancelButton: {
    marginTop: 2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.panelBorder,
  },
  cancelButtonLabel: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
