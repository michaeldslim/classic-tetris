import type { BgmTrack } from '../settings/types';

export const SOUND_ASSETS = {
  BGM1: require('../../assets/sounds/BGM1.mp3'),
  BGM2: require('../../assets/sounds/BGM2.mp3'),
  BGM3: require('../../assets/sounds/BGM3.mp3'),
  BGM4: require('../../assets/sounds/BGM4.mp3'),
  gameOver: require('../../assets/sounds/game_over.mp3'),
  lineMatched: require('../../assets/sounds/line_matched.mp3'),
  dropped: require('../../assets/sounds/dropped.mp3'),
} as const;

export type SfxId = 'gameOver' | 'lineMatched' | 'dropped';

export function getBgmSource(track: BgmTrack) {
  return SOUND_ASSETS[track];
}
