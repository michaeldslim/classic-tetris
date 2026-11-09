import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useScreenLayout } from '../hooks/useScreenLayout';
import { LandscapeSideArt } from './LandscapeSideArt';

type TabletLandscapeShellProps = {
  children: ReactNode;
};

/**
 * Keeps a stable center wrapper so rotating tablet portrait ↔ landscape
 * does not remount game UI children.
 */
export function TabletLandscapeShell({ children }: TabletLandscapeShellProps) {
  const { isWideLayout, sidePanelWidth } = useScreenLayout();

  return (
    <View style={[styles.root, isWideLayout && styles.rootRow]}>
      {isWideLayout ? (
        <View style={[styles.sidePanel, { width: sidePanelWidth }]}>
          <LandscapeSideArt side="left" variant="minimal" />
        </View>
      ) : null}
      <View style={styles.center}>{children}</View>
      {isWideLayout ? (
        <View style={[styles.sidePanel, { width: sidePanelWidth }]}>
          <LandscapeSideArt side="right" variant="minimal" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootRow: {
    flexDirection: 'row',
  },
  sidePanel: {
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    minWidth: 0,
  },
});
