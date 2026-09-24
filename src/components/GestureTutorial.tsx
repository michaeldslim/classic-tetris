import { memo, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { getRotatedShape } from '../game/board';
import type { TetrominoType } from '../theme/colors';
import { useSettings } from '../settings/SettingsContext';
import { theme } from '../theme/colors';
import { Cell } from './Cell';

type GestureTutorialProps = {
  width: number;
};

const DEMO_PIECE: TetrominoType = 'T';
const CELL_SIZE = 9;
const MINI_BOARD = 4;

type MiniPieceProps = {
  rotation?: number;
  style?: ViewStyle;
};

function MiniPiece({ rotation = 0, style }: MiniPieceProps) {
  const grid = useMemo(
    () => getRotatedShape(DEMO_PIECE, rotation),
    [rotation],
  );

  return (
    <View style={style}>
      {grid.map((row, y) => (
        <View key={`piece-row-${y}`} style={styles.pieceRow}>
          {row.map((filled, x) => (
            <Cell
              key={`piece-${x}-${y}`}
              type={filled ? DEMO_PIECE : null}
              size={CELL_SIZE}
              showGrid={false}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function MoveDemo() {
  return (
    <View style={styles.demoStage}>
      <Text style={styles.arrow}>←</Text>
      <View style={styles.miniBoardFrame}>
        <MiniPiece />
      </View>
      <Text style={styles.arrow}>→</Text>
    </View>
  );
}

function RotateDemo() {
  return (
    <View style={styles.demoStage}>
      <View style={styles.miniBoardFrame}>
        <MiniPiece />
        <View style={styles.tapRing} />
        <View style={styles.tapDot} />
      </View>
    </View>
  );
}

function SoftDropDemo() {
  return (
    <View style={styles.demoStage}>
      <View style={styles.dropColumn}>
        <Text style={styles.arrowDown}>↓</Text>
        <View style={[styles.miniBoardFrame, styles.softDropFrame]}>
          <MiniPiece style={styles.softDropPiece} />
        </View>
      </View>
    </View>
  );
}

function HardDropDemo() {
  return (
    <View style={styles.demoStage}>
      <View style={styles.dropColumn}>
        <Text style={styles.arrowDown}>↓</Text>
        <View style={[styles.miniBoardFrame, styles.dropFrame]}>
          <MiniPiece />
          <View style={styles.landingLine} />
        </View>
      </View>
    </View>
  );
}

type TutorialCardProps = {
  hint: string;
  children: ReactNode;
};

function TutorialCard({ hint, children }: TutorialCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardDemo}>{children}</View>
      <Text style={styles.cardHint}>{hint}</Text>
    </View>
  );
}

function GestureTutorialComponent({ width }: GestureTutorialProps) {
  const { translate } = useSettings();

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.cardsRow}>
        <TutorialCard hint={translate('tutorial.move')}>
          <MoveDemo />
        </TutorialCard>
        <TutorialCard hint={translate('tutorial.rotate')}>
          <RotateDemo />
        </TutorialCard>
        <TutorialCard hint={translate('tutorial.softDrop')}>
          <SoftDropDemo />
        </TutorialCard>
        <TutorialCard hint={translate('tutorial.hardDrop')}>
          <HardDropDemo />
        </TutorialCard>
      </View>
    </View>
  );
}

export const GestureTutorial = memo(GestureTutorialComponent);

export const GESTURE_TUTORIAL_HEIGHT = 68;

const styles = StyleSheet.create({
  container: {},
  cardsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  card: {
    flex: 1,
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingTop: 3,
    paddingBottom: 3,
    alignItems: 'center',
    gap: 2,
    minHeight: 58,
  },
  cardDemo: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHint: {
    color: theme.textMuted,
    fontSize: 7,
    fontWeight: '600',
    textAlign: 'center',
  },
  demoStage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MINI_BOARD * CELL_SIZE + 4,
  },
  miniBoardFrame: {
    width: MINI_BOARD * CELL_SIZE + 6,
    height: MINI_BOARD * CELL_SIZE + 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: theme.boardBackground,
    borderColor: theme.cellBorder,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropFrame: {
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  softDropFrame: {
    justifyContent: 'center',
    paddingTop: 8,
  },
  softDropPiece: {
    marginTop: 6,
  },
  pieceRow: {
    flexDirection: 'row',
  },
  arrow: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '800',
    width: 16,
    textAlign: 'center',
    opacity: 0.85,
  },
  arrowDown: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 1,
    opacity: 0.85,
  },
  dropColumn: {
    alignItems: 'center',
  },
  landingLine: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(240, 240, 0, 0.35)',
  },
  tapRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.accent,
    opacity: 0.85,
  },
  tapDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accent,
    opacity: 0.9,
  },
});
