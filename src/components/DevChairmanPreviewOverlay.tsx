import { useCallback } from 'react';
import { useLeaderboard } from '../leaderboard/LeaderboardProvider';
import { useSettings } from '../settings/SettingsContext';
import { ChairmanSaveModal } from './ChairmanSaveModal';

const PREVIEW_SCORE = 999_999;

type DevChairmanPreviewOverlayProps = {
  visible: boolean;
  onClose: () => void;
};

export function DevChairmanPreviewOverlay({
  visible,
  onClose,
}: DevChairmanPreviewOverlayProps) {
  const { settings, translate } = useSettings();
  const { saveChairmanEntry } = useLeaderboard();

  const handleSave = useCallback(
    (initials: string) => {
      void saveChairmanEntry({
        initials,
        score: PREVIEW_SCORE,
        avatarId: settings.playerAvatarId,
      }).finally(onClose);
    },
    [onClose, saveChairmanEntry, settings.playerAvatarId],
  );

  return (
    <ChairmanSaveModal
      visible={visible}
      score={PREVIEW_SCORE}
      playerAvatarId={settings.playerAvatarId}
      onSave={handleSave}
      onCancel={onClose}
      cancelLabel={translate('leaderboard.save.devCancel')}
    />
  );
}
