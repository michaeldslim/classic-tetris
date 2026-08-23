import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/colors';

type AchievementToastProps = {
  visible: boolean;
  badge: string;
  title: string;
  subtitle: string;
  onComplete: () => void;
};

const DISPLAY_MS = 1800;
const FADE_MS = 300;

export function AchievementToast({
  visible,
  badge,
  title,
  subtitle,
  onComplete,
}: AchievementToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!visible) {
      return;
    }

    opacity.setValue(0);
    scale.setValue(0.85);

    const animation = Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(DISPLAY_MS),
        Animated.timing(opacity, {
          toValue: 0,
          duration: FADE_MS,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        onCompleteRef.current();
      }
    });

    const timeoutId = setTimeout(() => {
      onCompleteRef.current();
    }, DISPLAY_MS + FADE_MS + 400);

    return () => {
      animation.stop();
      clearTimeout(timeoutId);
    };
  }, [opacity, scale, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.banner,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={styles.badge}>{badge}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 88,
    left: 12,
    right: 12,
    alignItems: 'center',
    zIndex: 90,
  },
  banner: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.accent,
    backgroundColor: 'rgba(15, 15, 26, 0.96)',
    maxWidth: '100%',
    shadowColor: theme.accent,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  badge: {
    color: theme.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
