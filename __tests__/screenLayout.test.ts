import {
  getLandscapeSidePanelWidth,
  getOrientationGuide,
  isTabletWideLayout,
} from '../src/hooks/useScreenLayout';

describe('screen layout', () => {
  it('detects tablet landscape wide layout', () => {
    expect(isTabletWideLayout(1024, 768)).toBe(true);
    expect(isTabletWideLayout(768, 1024)).toBe(false);
    expect(isTabletWideLayout(390, 844)).toBe(false);
  });

  it('guides phone landscape to portrait only', () => {
    expect(getOrientationGuide(844, 390)).toBe('portrait');
    expect(getOrientationGuide(390, 844)).toBe(null);
    expect(getOrientationGuide(1024, 768)).toBe(null);
  });

  it('clamps side panel width', () => {
    expect(getLandscapeSidePanelWidth(800)).toBeGreaterThanOrEqual(160);
    expect(getLandscapeSidePanelWidth(800)).toBeLessThanOrEqual(260);
  });
});
