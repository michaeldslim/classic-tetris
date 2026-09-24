import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useScreenLayout } from '../hooks/useScreenLayout';
import { LandscapeSideArt } from './LandscapeSideArt';

type TabletLandscapeShellProps = {
  children: ReactNode;
};

export function TabletLandscapeShell({ children }: TabletLandscapeShellProps) {
  const { isWideLayout, sidePanelWidth } = useScreenLayout();

  if (!isWideLayout) {
    return children;
  }

  return (
    <View style={styles.root}>
      <View style={[styles.sidePanel, { width: sidePanelWidth }]}>
        <LandscapeSideArt side="left" variant="minimal" />
      </View>
      <View style={styles.center}>{children}</View>
      <View style={[styles.sidePanel, { width: sidePanelWidth }]}>
        <LandscapeSideArt side="right" variant="minimal" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
