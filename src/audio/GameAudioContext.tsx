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

export function GameAudioProvider({ children }: { children: ReactNode }) {
  const { settings, ready } = useSettings();
  const bgmPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const sfxPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const gameOverPlayerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const bgmPausedRef = useRef(false);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!bgmPlayerRef.current) {
      bgmPlayerRef.current = createAudioPlayer(getBgmSource(settings.bgmTrack));
    }
    if (!sfxPlayerRef.current) {
      sfxPlayerRef.current = createAudioPlayer(null);
      sfxPlayerRef.current.loop = false;
    }
    if (!gameOverPlayerRef.current) {
      gameOverPlayerRef.current = createAudioPlayer(SOUND_ASSETS.gameOver);
      gameOverPlayerRef.current.loop = false;
    }

    return () => {
      bgmPlayerRef.current?.release();
      sfxPlayerRef.current?.release();
      gameOverPlayerRef.current?.release();
      bgmPlayerRef.current = null;
      sfxPlayerRef.current = null;
      gameOverPlayerRef.current = null;
    };
  }, [ready]);

  useEffect(() => {
    const player = bgmPlayerRef.current;
    if (!player || !ready) {
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
  }, [ready, settings.bgmTrack, settings.bgmVolume]);

  const playSfx = useCallback(
    (id: SfxId) => {
      if (settings.sfxVolume <= 0) {
        return;
      }

      if (id === 'gameOver') {
        const player = gameOverPlayerRef.current;
        if (!player) {
          return;
        }

        bgmPausedRef.current = true;
        bgmPlayerRef.current?.pause();
        player.volume = levelToVolume(settings.sfxVolume);
        void player.seekTo(0).then(() => {
          player.play();
        });
        return;
      }

      const player = sfxPlayerRef.current;
      if (!player) {
        return;
      }

      player.loop = false;
      player.replace(SOUND_ASSETS[id]);
      player.volume = levelToVolume(settings.sfxVolume);
      void player.seekTo(0).then(() => {
        player.play();
      });
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
