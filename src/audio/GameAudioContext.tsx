import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { getBgmSource, SOUND_ASSETS, type SfxId } from './sounds';
import {
  getLineClearSfxRate,
  getLineClearSfxVolumeScale,
} from '../game/lineClearFx';
import { levelToVolume } from '../settings/types';
import { useSettings } from '../settings/SettingsContext';

type GameAudioContextValue = {
  playSfx: (id: SfxId) => void;
  playLineClearSfx: (lineCount: number) => void;
  setBgmPaused: (paused: boolean) => void;
};

const GameAudioContext = createContext<GameAudioContextValue | null>(null);

const NEEDS_FIRST_LOCK_RETRY =
  Platform.OS === 'android' &&
  Platform.constants.Manufacturer.toLowerCase() === 'samsung';

const SFX_PLAYER_OPTIONS = {
  keepAudioSessionActive: true,
  preferredForwardBufferDuration: 0.25,
  updateInterval: 100,
} as const;

function createSfxPlayer(source: (typeof SOUND_ASSETS)[SfxId]) {
  const player = createAudioPlayer(source, SFX_PLAYER_OPTIONS);
  player.loop = false;
  return player;
}

export function GameAudioProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const bgmPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const droppedPlayerRef = useRef(
    createSfxPlayer(SOUND_ASSETS.dropped),
  );
  const lineMatchedPlayerRef = useRef(
    createSfxPlayer(SOUND_ASSETS.lineMatched),
  );
  const gameOverPlayerRef = useRef(
    createSfxPlayer(SOUND_ASSETS.gameOver),
  );
  const bgmPausedRef = useRef(false);
  const firstLockRetryRef = useRef(NEEDS_FIRST_LOCK_RETRY);
  const firstLockRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
  }, []);

  useEffect(() => {
    if (!bgmPlayerRef.current) {
      bgmPlayerRef.current = createAudioPlayer(getBgmSource(settings.bgmTrack));
    }

    return () => {
      bgmPlayerRef.current?.release();
      bgmPlayerRef.current = null;
    };
  }, [settings.bgmTrack]);

  useEffect(() => {
    const dropped = droppedPlayerRef.current;
    const lineMatched = lineMatchedPlayerRef.current;
    const gameOver = gameOverPlayerRef.current;

    return () => {
      if (firstLockRetryTimerRef.current) {
        clearTimeout(firstLockRetryTimerRef.current);
      }
      dropped.release();
      lineMatched.release();
      gameOver.release();
    };
  }, []);

  useEffect(() => {
    const player = bgmPlayerRef.current;
    if (!player) {
      return;
    }

    player.replace(getBgmSource(settings.bgmTrack));
    player.loop = true;
    player.volume = levelToVolume(settings.bgmVolume);

    if (settings.bgmVolume <= 0 || bgmPausedRef.current) {
      player.pause();
      return;
    }

    player.play();
  }, [settings.bgmTrack, settings.bgmVolume]);

  const playSfx = useCallback(
    (id: SfxId) => {
      if (settings.sfxVolume <= 0) {
        return;
      }

      const volume = levelToVolume(settings.sfxVolume);

      if (id === 'gameOver') {
        const player = gameOverPlayerRef.current;
        if (!player) {
          return;
        }

        bgmPausedRef.current = true;
        bgmPlayerRef.current?.pause();
        player.volume = volume;
        void player.seekTo(0).then(() => {
          player.play();
        });
        return;
      }

      const player =
        id === 'dropped'
          ? droppedPlayerRef.current
          : lineMatchedPlayerRef.current;
      if (!player) {
        return;
      }

      player.volume = volume;
      player.pause();
      void player.seekTo(0);
      player.play();

      if (id === 'dropped' && firstLockRetryRef.current) {
        firstLockRetryRef.current = false;
        firstLockRetryTimerRef.current = setTimeout(() => {
          player.pause();
          void player.seekTo(0).then(() => player.play());
          firstLockRetryTimerRef.current = null;
        }, 80);
      }
    },
    [settings.sfxVolume],
  );

  const setBgmPaused = useCallback(
    (paused: boolean) => {
      bgmPausedRef.current = paused;
      const player = bgmPlayerRef.current;
      if (!player) {
        return;
      }

      if (paused || settings.bgmVolume <= 0) {
        player.pause();
        return;
      }

      player.play();
    },
    [settings.bgmVolume],
  );

  const playLineClearSfx = useCallback(
    (lineCount: number) => {
      if (settings.sfxVolume <= 0) {
        return;
      }

      const player = lineMatchedPlayerRef.current;
      if (!player) {
        return;
      }

      const volume =
        levelToVolume(settings.sfxVolume) *
        getLineClearSfxVolumeScale(lineCount);
      player.volume = volume;
      player.setPlaybackRate(getLineClearSfxRate(lineCount));
      player.pause();
      void player.seekTo(0);
      player.play();
    },
    [settings.sfxVolume],
  );

  const value = useMemo(
    () => ({
      playSfx,
      playLineClearSfx,
      setBgmPaused,
    }),
    [playSfx, playLineClearSfx, setBgmPaused],
  );

  return (
    <GameAudioContext.Provider value={value}>
      {children}
    </GameAudioContext.Provider>
  );
}

export function useGameAudio() {
  const context = useContext(GameAudioContext);
  if (!context) {
    throw new Error('useGameAudio must be used within GameAudioProvider');
  }
  return context;
}
