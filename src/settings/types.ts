import type { AvatarId } from '../constants/avatars';
import { DEFAULT_PLAYER_AVATAR_ID } from '../constants/avatars';
import type { AppLanguage } from '../i18n';

export type BgmTrack = 'BGM1' | 'BGM2' | 'BGM3' | 'BGM4';

export const BGM_TRACKS: BgmTrack[] = ['BGM1', 'BGM2', 'BGM3', 'BGM4'];

export function isBgmTrack(value: unknown): value is BgmTrack {
  return typeof value === 'string' && BGM_TRACKS.includes(value as BgmTrack);
}

export type AppSettings = {
  language: AppLanguage;
  bgmTrack: BgmTrack;
  /** 1–10, mapped to player volume 0.1–1.0 */
  bgmVolume: number;
  /** 1–10, mapped to player volume 0.1–1.0 */
  sfxVolume: number;
  playerAvatarId: AvatarId;
  careerModeEnabled: boolean;
};

export { DEFAULT_PLAYER_AVATAR_ID };

export const VOLUME_MIN = 1;
export const VOLUME_MAX = 10;

export function levelToVolume(level: number): number {
  const clamped = Math.min(VOLUME_MAX, Math.max(VOLUME_MIN, level));
  return clamped / VOLUME_MAX;
}
