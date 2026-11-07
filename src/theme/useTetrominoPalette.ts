import { useMemo } from 'react';
import { useSettings } from '../settings/SettingsContext';
import { getTetrominoPalette } from './palettes';

export function useTetrominoPalette() {
  const { settings } = useSettings();
  return useMemo(
    () => getTetrominoPalette(settings.tetrominoPalette),
    [settings.tetrominoPalette],
  );
}
