import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { createAudioPlayer, preload, setAudioModeAsync } from 'expo-audio';
import { registerLockSoundPlayer } from './lockSound';
import { getBgmSource, SOUND_ASSETS, type SfxId } from './sounds';
import { levelToVolume } from '../settings/types';
import { useSettings } from '../settings/SettingsContext';

type GameAudioContextValue = {
  playSfx: (id: SfxId) => void;
  setBgmPaused: (paused: boolean) => void;
};

const GameAudioContext = createContext<GameAudioContextValue | null>(null);

void preload(SOUND_ASSETS.gameOver);
void preload(SOUND_ASSETS.lineMatched);
void preload(SOUND_ASSETS.dropped);

function createSfxPlayer(source: (typeof SOUND_ASSETS)[SfxId]) {
  const player = createAudioPlayer(source);
  player.loop = false;
  return player;
}

export function GameAudioProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
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

  const playLockSoundSync = useCallback(() => {
    if (settingsRef.current.sfxVolume <= 0) {
      return;
    }

    const player = droppedPlayerRef.current;
    player.volume = levelToVolume(settingsRef.current.sfxVolume);
    player.pause();
    void player.seekTo(0);
    player.play();
  }, []);

  useEffect(() => {
    registerLockSoundPlayer(playLockSoundSync);
    return () => registerLockSoundPlayer(null);
  }, [playLockSoundSync]);

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

  const value = useMemo(
    () => ({
      playSfx,
      setBgmPaused,
    }),
    [playSfx, setBgmPaused],
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
