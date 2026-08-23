import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setI18nLanguage, t } from '../i18n';
import type { AvatarId } from '../constants/avatars';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './storage';
import type { AppSettings, BgmTrack } from './types';
import type { AppLanguage } from '../i18n';

type SettingsContextValue = {
  settings: AppSettings;
  ready: boolean;
  setLanguage: (language: AppLanguage) => void;
  setBgmTrack: (track: BgmTrack) => void;
  setBgmVolume: (level: number) => void;
  setSfxVolume: (level: number) => void;
  setPlayerAvatarId: (avatarId: AvatarId) => void;
  setCareerModeEnabled: (enabled: boolean) => void;
  translate: typeof t;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    setI18nLanguage(DEFAULT_SETTINGS.language);
    return DEFAULT_SETTINGS;
  });
  const [ready] = useState(true);

  useEffect(() => {
    let active = true;

    void loadSettings().then((loaded) => {
      if (!active) {
        return;
      }
      setSettings(loaded);
      setI18nLanguage(loaded.language);
    });

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback(
    (language: AppLanguage) => {
      setI18nLanguage(language);
      setSettings((current) => {
        const next = { ...current, language };
        void saveSettings(next);
        return next;
      });
    },
    [],
  );

  const setBgmTrack = useCallback((bgmTrack: BgmTrack) => {
    setSettings((current) => {
      const next = { ...current, bgmTrack };
      void saveSettings(next);
      return next;
    });
  }, []);

  const setBgmVolume = useCallback((bgmVolume: number) => {
    setSettings((current) => {
      const next = { ...current, bgmVolume };
      void saveSettings(next);
      return next;
    });
  }, []);

  const setSfxVolume = useCallback((sfxVolume: number) => {
    setSettings((current) => {
      const next = { ...current, sfxVolume };
      void saveSettings(next);
      return next;
    });
  }, []);

  const setPlayerAvatarId = useCallback((playerAvatarId: AvatarId) => {
    setSettings((current) => {
      const next = { ...current, playerAvatarId };
      void saveSettings(next);
      return next;
    });
  }, []);

  const setCareerModeEnabled = useCallback((careerModeEnabled: boolean) => {
    setSettings((current) => {
      const next = { ...current, careerModeEnabled };
      void saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      settings,
      ready,
      setLanguage,
      setBgmTrack,
      setBgmVolume,
      setSfxVolume,
      setPlayerAvatarId,
      setCareerModeEnabled,
      translate: t,
    }),
    [
      settings,
      ready,
      setLanguage,
      setBgmTrack,
      setBgmVolume,
      setSfxVolume,
      setPlayerAvatarId,
      setCareerModeEnabled,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
