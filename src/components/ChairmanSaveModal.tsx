import { Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AvatarId } from '../constants/avatars';
import { ChairmanSaveOverlay } from './ChairmanSaveOverlay';

type ChairmanSaveModalProps = {
  visible: boolean;
  score: number;
  playerAvatarId: AvatarId;
  onSave: (initials: string) => void;
  onCancel?: () => void;
  cancelLabel?: string;
};

export function ChairmanSaveModal({
  visible,
  score,
  playerAvatarId,
  onSave,
  onCancel,
  cancelLabel,
}: ChairmanSaveModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel ?? (() => {})}
      statusBarTranslucent
      navigationBarTranslucent
    >
      {visible ? (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ChairmanSaveOverlay
            visible
            presentation="modal"
            score={score}
            playerAvatarId={playerAvatarId}
            onSave={onSave}
            onCancel={onCancel}
            cancelLabel={cancelLabel}
          />
        </SafeAreaView>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
