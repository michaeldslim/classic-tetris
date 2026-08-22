import { useCallback, useMemo, useReducer, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGhostPiece, createInitialState, reduce } from '../game/engine';
import { getStageLineTarget } from '../game/campaign';
import { placeholderProfile } from '../game/profile';
import { BOARD_WIDTH, computeCellSize } from '../game/types';
import type { GameAction } from '../game/types';
import { useGameFeedback } from '../hooks/useGameFeedback';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { theme } from '../theme/colors';
import { BoardView } from './BoardView';
import { GameOverlay } from './GameOverlay';
import { GestureTutorial, GESTURE_TUTORIAL_HEIGHT } from './GestureTutorial';
import { SwipeZone } from './TouchControls';
import { HudPanel } from './HudPanel';
import { PlayerStatusBar } from './PlayerStatusBar';

const HORIZONTAL_PADDING = 12;
const HUD_WIDTH = 72;
const PLAY_GAP = 8;
const BOARD_BORDER = 4;
const TUTORIAL_GAP = 12;
const BOTTOM_LIFT = 24;

export function GameScreen() {
  const { width } = useWindowDimensions();
  const [playSection, setPlaySection] = useState({ width: 0, height: 0 });
  const [paused, setPaused] = useState(false);
  const [lastAction, setLastAction] = useState<GameAction | null>(null);
  const [state, dispatch] = useReducer(
    reduce,
    undefined,
    createInitialState,
  );

  useGameLoop(state, dispatch, paused);
  useGameFeedback(state, lastAction);

  const inputDisabled =
    state.gameOver ||
    paused ||
    state.lineClear !== null ||
    state.stageCleared ||
    state.campaignComplete;

  const lineTarget = getStageLineTarget(state.stage);

  const cellSize = useMemo(() => {
    const sectionWidth =
      playSection.width || width - HORIZONTAL_PADDING * 2;
    const sectionHeight = playSection.height || 400;
    const boardWidth = sectionWidth - HUD_WIDTH - PLAY_GAP - BOARD_BORDER;
    const playAreaHeight =
      sectionHeight -
      GESTURE_TUTORIAL_HEIGHT -
      TUTORIAL_GAP -
      BOTTOM_LIFT;
    const boardHeight = playAreaHeight - BOARD_BORDER;
    return computeCellSize(boardWidth, boardHeight);
  }, [playSection.width, playSection.height, width]);

  const boardOuterWidth = BOARD_WIDTH * cellSize + BOARD_BORDER;
  const boardColumnWidth = boardOuterWidth;

  const displayBoard = state.board;

  const ghostPiece = useMemo(
    () => getGhostPiece(state),
    [state.board, state.active],
  );

  const handleDas = useCallback((direction: -1 | 0 | 1) => {
    dispatch({ type: 'DAS', direction });
  }, []);

  const handlePlaySectionLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    setPlaySection({ width: layoutWidth, height: layoutHeight });
  }, []);

  const handleAction = useCallback((action: GameAction) => {
    setLastAction(action);
    dispatch(action);
  }, []);

  const handleNextStage = useCallback(() => {
    dispatch({ type: 'NEXT_STAGE' });
  }, []);

  const handleRestart = useCallback(() => {
    setPaused(false);
    dispatch({ type: 'RESTART' });
  }, []);

  const handlePauseToggle = useCallback(() => {
    if (state.gameOver || state.stageCleared || state.campaignComplete) {
      return;
    }
    setPaused((value) => {
      if (!value) {
        dispatch({ type: 'DAS', direction: 0 });
      }
      return !value;
    });
  }, [state.gameOver, state.stageCleared, state.campaignComplete]);

  const handleResume = useCallback(() => {
    setPaused(false);
  }, []);

  useKeyboardControls(
    handleAction,
    handlePauseToggle,
    handleRestart,
    !inputDisabled,
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <View style={styles.titleSpacer} />
          <Text style={styles.title}>TETRIS</Text>
          <Pressable
            style={styles.pauseButton}
            onPress={handlePauseToggle}
            disabled={state.gameOver || state.stageCleared || state.campaignComplete}
            accessibilityRole="button"
            accessibilityLabel={paused ? 'Resume game' : 'Pause game'}
          >
            <Text
              style={[
                styles.pauseLabel,
                state.gameOver && styles.pauseLabelDisabled,
              ]}
            >
              {paused ? '▶' : '❚❚'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.playBlock}>
            <PlayerStatusBar profile={placeholderProfile} />

            <View style={styles.playSection} onLayout={handlePlaySectionLayout}>
              <View style={styles.playArea}>
                <View style={styles.playAreaSpacer} />

                <View style={styles.centerColumn}>
                  <View style={styles.gameCluster}>
                    <View
                      style={[styles.boardColumn, { width: boardColumnWidth }]}
                    >
                      <SwipeZone
                        onAction={handleAction}
                        onDas={handleDas}
                        disabled={inputDisabled}
                      >
                        <BoardView
                          board={displayBoard}
                          cellSize={cellSize}
                          active={state.active}
                          ghost={ghostPiece}
                          lineClear={state.lineClear}
                        />
                        {paused ? (
                          <GameOverlay
                            variant="pause"
                            onPrimary={handleResume}
                            onSecondary={handleRestart}
                          />
                        ) : null}
                        {state.stageCleared ? (
                          <GameOverlay
                            variant="stageClear"
                            level={state.level}
                            stage={state.stage}
                            onPrimary={handleNextStage}
                          />
                        ) : null}
                        {state.campaignComplete ? (
                          <GameOverlay
                            variant="campaignComplete"
                            score={state.score}
                            onPrimary={handleRestart}
                          />
                        ) : null}
                        {state.gameOver ? (
                          <GameOverlay
                            variant="gameOver"
                            score={state.score}
                            onPrimary={handleRestart}
                          />
                        ) : null}
                      </SwipeZone>
                    </View>

                    <HudPanel
                      stats={{
                        score: state.score,
                        level: state.level,
                        stage: state.stage,
                        lines: state.lines,
                        lineTarget,
                      }}
                      nextPiece={state.next}
                    />
                  </View>

                  <GestureTutorial width={boardOuterWidth} />
                </View>

                <View style={styles.playAreaSpacer} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 4,
    marginBottom: 4,
  },
  titleSpacer: {
    width: 36,
  },
  title: {
    flex: 1,
    color: theme.accent,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
  },
  pauseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
  },
  pauseLabel: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  pauseLabelDisabled: {
    opacity: 0.35,
  },
  content: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  playBlock: {
    flex: 1,
    width: '100%',
  },
  playArea: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  playAreaSpacer: {
    flex: 1,
  },
  centerColumn: {
    gap: TUTORIAL_GAP,
    alignItems: 'flex-start',
  },
  gameCluster: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: PLAY_GAP,
  },
  boardColumn: {
    alignItems: 'flex-start',
  },
  playSection: {
    flex: 1,
    minHeight: 0,
    paddingBottom: BOTTOM_LIFT,
  },
});
