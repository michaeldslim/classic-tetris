import { useMemo, useRef } from 'react';
import { PanResponder } from 'react-native';
import type { GameAction } from '../game/types';

const SWIPE_DISTANCE = 24;
const TAP_SLOP = 12;

export function useSwipeActions(
  onAction: (action: GameAction) => void,
  disabled = false,
  onDas?: (direction: -1 | 0 | 1) => void,
) {
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;
  const onDasRef = useRef(onDas);
  onDasRef.current = onDas;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const dasActiveRef = useRef(false);
  const dasDirectionRef = useRef<-1 | 0 | 1>(0);

  return useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabledRef.current,
        onMoveShouldSetPanResponder: (_, gesture) =>
          !disabledRef.current &&
          (Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8),
        onPanResponderMove: (_, { dx, dy }) => {
          if (disabledRef.current) {
            return;
          }

          const absX = Math.abs(dx);
          const absY = Math.abs(dy);

          if (absX <= absY || absX < SWIPE_DISTANCE) {
            return;
          }

          const direction = dx > 0 ? 1 : -1;
          if (dasDirectionRef.current === direction) {
            return;
          }

          dasDirectionRef.current = direction;
          dasActiveRef.current = true;
          onDasRef.current?.(direction);
        },
        onPanResponderRelease: (_, { dx, dy }) => {
          if (disabledRef.current) {
            return;
          }

          if (dasActiveRef.current) {
            onDasRef.current?.(0);
            dasActiveRef.current = false;
            dasDirectionRef.current = 0;
            return;
          }

          const absX = Math.abs(dx);
          const absY = Math.abs(dy);

          if (absX < TAP_SLOP && absY < TAP_SLOP) {
            onActionRef.current('ROTATE');
            return;
          }

          if (absX > absY && absX >= SWIPE_DISTANCE) {
            onActionRef.current(dx > 0 ? 'RIGHT' : 'LEFT');
            return;
          }

          if (absY > absX && dy >= SWIPE_DISTANCE) {
            onActionRef.current('HARD_DROP');
          }
        },
        onPanResponderTerminate: () => {
          if (dasActiveRef.current) {
            onDasRef.current?.(0);
            dasActiveRef.current = false;
            dasDirectionRef.current = 0;
          }
        },
      }),
    [],
  );
}
