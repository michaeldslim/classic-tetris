import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export const TABLET_SHORT_EDGE_MIN = 600;

const LANDSCAPE_SIDE_PANEL_MIN = 160;
const LANDSCAPE_SIDE_PANEL_MAX = 260;
const LANDSCAPE_SIDE_PANEL_RATIO = 0.22;

export function getLandscapeSidePanelWidth(screenWidth: number): number {
  return Math.round(
    Math.min(
      LANDSCAPE_SIDE_PANEL_MAX,
      Math.max(LANDSCAPE_SIDE_PANEL_MIN, screenWidth * LANDSCAPE_SIDE_PANEL_RATIO),
    ),
  );
}

export function isTabletDevice(screenWidth: number, screenHeight: number): boolean {
  return Math.min(screenWidth, screenHeight) >= TABLET_SHORT_EDGE_MIN;
}

/** Tablet in landscape — center column with decorative side panels. */
export function isTabletWideLayout(screenWidth: number, screenHeight: number): boolean {
  return isTabletDevice(screenWidth, screenHeight) && screenWidth > screenHeight;
}

export type OrientationGuide = 'portrait';

/** Phone landscape → suggest portrait (mobile only; tablets use wide layout). */
export function getOrientationGuide(
  screenWidth: number,
  screenHeight: number,
): OrientationGuide | null {
  const isTablet = isTabletDevice(screenWidth, screenHeight);
  const isLandscape = screenWidth > screenHeight;

  if (!isTablet && isLandscape) {
    return 'portrait';
  }

  return null;
}

export function useScreenLayout() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return useMemo(() => {
    const tablet = isTabletDevice(screenWidth, screenHeight);
    const wideLayout = isTabletWideLayout(screenWidth, screenHeight);
    return {
      isTablet: tablet,
      isWideLayout: wideLayout,
      sidePanelWidth: wideLayout ? getLandscapeSidePanelWidth(screenWidth) : 0,
    };
  }, [screenHeight, screenWidth]);
}
