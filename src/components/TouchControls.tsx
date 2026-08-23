import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { GameAction } from '../game/types';
import { useSwipeActions } from '../hooks/useSwipeActions';

type SwipeZoneProps = {
  children: ReactNode;
  onAction: (action: GameAction) => void;
  onDas?: (direction: -1 | 0 | 1) => void;
  onSoftDropHold?: (active: boolean) => void;
  disabled?: boolean;
};

function SwipeZoneComponent({
  children,
  onAction,
  onDas,
  onSoftDropHold,
  disabled = false,
}: SwipeZoneProps) {
  const panResponder = useSwipeActions(onAction, disabled, onDas, onSoftDropHold);

  return (
    <View style={styles.swipeZone} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

export const SwipeZone = memo(SwipeZoneComponent);

const styles = StyleSheet.create({
  swipeZone: {
    alignItems: 'flex-start',
    position: 'relative',
  },
});
