import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveAvatarId } from '../constants/avatars';
import { detectDeviceLanguage } from '../i18n';
import type { AppSettings } from './types';
import { DEFAULT_PLAYER_AVATAR_ID, isBgmTrack } from './types';

const SETTINGS_KEY = '@classic-tetris/settings';

export const DEFAULT_SETTINGS: AppSettings = {
  language: detectDeviceLanguage(),
  bgmTrack: 'BGM1',
  bgmVolume: 3,
  sfxVolume: 5,
  playerAvatarId: DEFAULT_PLAYER_AVATAR_ID,
  careerModeEnabled: true,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      playerAvatarId: resolveAvatarId(
        parsed.playerAvatarId,
        DEFAULT_PLAYER_AVATAR_ID,
      ),
      bgmTrack: isBgmTrack(parsed.bgmTrack)
        ? parsed.bgmTrack
        : DEFAULT_SETTINGS.bgmTrack,
      careerModeEnabled:
        typeof parsed.careerModeEnabled === 'boolean'
          ? parsed.careerModeEnabled
          : DEFAULT_SETTINGS.careerModeEnabled,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
