import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { careerRankKey, getCareerProgressCopy } from '../career/careerLabels';
import { getPromotionStagePosition } from '../career/careerRules';
import { useCareer } from '../career/CareerProvider';
import type { PromotionResult } from '../career/types';
import { getGhostPiece } from '../game/engine';
import { getStageLineTarget } from '../game/campaign';
import { BOARD_WIDTH, computeCellSize } from '../game/types';
import type { GameAction } from '../game/types';
import { useGameEngine } from '../hooks/useGameEngine';
import { useGameFeedback } from '../hooks/useGameFeedback';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useSettings } from '../settings/SettingsContext';
import { achievementKey } from '../score/achievements';
import { useScore } from '../score/ScoreProvider';
import type { ScoreAchievementId } from '../score/types';
import { theme } from '../theme/colors';
import { AchievementToast } from './AchievementToast';
import { BoardView } from './BoardView';
import { GameOverlay } from './GameOverlay';
import { GestureTutorial, GESTURE_TUTORIAL_HEIGHT } from './GestureTutorial';
import { PlayerStatusBar } from './PlayerStatusBar';
import { PromotionOverlay } from './PromotionOverlay';
import { SwipeZone } from './TouchControls';
import { HudPanel } from './HudPanel';

const HORIZONTAL_PADDING = 12;
const HUD_WIDTH = 72;
const PLAY_GAP = 8;
const BOARD_BORDER = 4;
const TUTORIAL_GAP = 12;
const BOTTOM_LIFT = 24;

const TITLE_ROW_HEIGHT = 44;
const PROFILE_BAR_HEIGHT = 72;
const MIN_PLAY_SECTION_HEIGHT = 200;
const GAME_OVER_RESTART_DELAY_MS = 4000;

type GameScreenProps = {
  active?: boolean;
  onOpenSettings: () => void;
  onPauseChange: (paused: boolean) => void;
  onGameOverChange: (gameOver: boolean) => void;
};

export function GameScreen({
  active = true,
  onOpenSettings,
  onPauseChange,
  onGameOverChange,
}: GameScreenProps) {
  const { settings, translate } = useSettings();
  const { careerState, loaded: careerLoaded, recordStageResult } = useCareer();
  const { scoreRecord, updateScoreProgress } = useScore();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [playSection, setPlaySection] = useState({ width: 0, height: 0 });
  const [paused, setPaused] = useState(false);
  const [lastAction, setLastAction] = useState<GameAction | null>(null);
  const [careerResult, setCareerResult] = useState<PromotionResult | null>(null);
  const [showPromotionOverlay, setShowPromotionOverlay] = useState(false);
  const [gameOverRestartReady, setGameOverRestartReady] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<ScoreAchievementId[]>([]);
  const [activeAchievement, setActiveAchievement] = useState<ScoreAchievementId | null>(null);
  const [runSetRecord, setRunSetRecord] = useState(false);
  const lastProcessedScoreRef = useRef(0);
  const recordedStageKey = useRef<string | null>(null);
  const recordedGameOverRun = useRef<number | null>(null);
  const runId = useRef(0);
  const recordStageResultRef = useRef(recordStageResult);
  recordStageResultRef.current = recordStageResult;
  const careerPositionSynced = useRef(false);
  const softDropActiveRef = useRef(false);
  const { state, dispatch } = useGameEngine();

  useGameLoop(
    state,
    dispatch,
    paused || !active || showPromotionOverlay,
    softDropActiveRef,
  );
  useGameFeedback(state, lastAction);

  const modalBlocking =
    showPromotionOverlay ||
    state.gameOver ||
    state.stageCleared ||
    state.campaignComplete;

  const inputDisabled =
    !active ||
    modalBlocking ||
    paused ||
    state.lineClear !== null ||
    state.pendingSpawn;

  const lineTarget = getStageLineTarget(state.stage);

  const fallbackPlayHeight = useMemo(() => {
    const chromeHeight =
      insets.top +
      insets.bottom +
      TITLE_ROW_HEIGHT +
      PROFILE_BAR_HEIGHT +
      BOTTOM_LIFT +
      GESTURE_TUTORIAL_HEIGHT +
      TUTORIAL_GAP +
      24;
    return Math.max(windowHeight - chromeHeight, 320);
  }, [insets.top, insets.bottom, windowHeight]);

  const cellSize = useMemo(() => {
    const sectionWidth =
      playSection.width > 0
        ? playSection.width
        : windowWidth - HORIZONTAL_PADDING * 2;
    const sectionHeight =
      playSection.height >= MIN_PLAY_SECTION_HEIGHT
        ? playSection.height
        : fallbackPlayHeight;
    const boardWidth = sectionWidth - HUD_WIDTH - PLAY_GAP - BOARD_BORDER;
    const playAreaHeight =
      sectionHeight -
      GESTURE_TUTORIAL_HEIGHT -
      TUTORIAL_GAP -
      BOTTOM_LIFT;
    const boardHeight = playAreaHeight - BOARD_BORDER;
    return computeCellSize(boardWidth, boardHeight);
  }, [
    playSection.width,
    playSection.height,
    windowWidth,
    fallbackPlayHeight,
  ]);

  const boardOuterWidth = BOARD_WIDTH * cellSize + BOARD_BORDER;
  const boardColumnWidth = boardOuterWidth;
  const gameClusterWidth = boardOuterWidth + PLAY_GAP + HUD_WIDTH;

  const displayBoard = state.board;

  const ghostPiece = useMemo(
    () => getGhostPiece(state),
    [state.board, state.active],
  );

  const careerBar = useMemo(() => {
    if (!settings.careerModeEnabled || !careerLoaded) {
      return null;
    }

    const progress = getCareerProgressCopy(translate, careerState);
    return {
      rankLabel: progress.primary,
      progress: progress.progress,
      progressHint: progress.secondary ?? progress.primary,
    };
  }, [settings.careerModeEnabled, careerLoaded, translate, careerState]);

  const handleDas = useCallback((direction: -1 | 0 | 1) => {
    dispatch({ type: 'DAS', direction });
  }, []);

  const handleSoftDropHold = useCallback((active: boolean) => {
    softDropActiveRef.current = active;
    if (active) {
      setLastAction('SOFT_DROP');
      dispatch('SOFT_DROP');
    }
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
    setShowPromotionOverlay(false);

    if (settings.careerModeEnabled && careerLoaded) {
      const nextPosition = getPromotionStagePosition(
        careerState.rank,
        careerState.promotionWins,
      );

      if (nextPosition) {
        dispatch({
          type: 'NEXT_STAGE',
          level: nextPosition.level,
          stage: nextPosition.stage,
        });
        return;
      }
    }

    dispatch({ type: 'NEXT_STAGE' });
  }, [
    careerLoaded,
    careerState.promotionWins,
    careerState.rank,
    dispatch,
    settings.careerModeEnabled,
  ]);

  const resetRunTracking = useCallback(() => {
    runId.current += 1;
    recordedGameOverRun.current = null;
    recordedStageKey.current = null;
    setShowPromotionOverlay(false);
    setPaused(false);
    setGameOverRestartReady(false);
  }, []);

  const handleRetryStage = useCallback(() => {
    resetRunTracking();
    lastProcessedScoreRef.current = state.score;
    dispatch({ type: 'RETRY_STAGE' });
  }, [resetRunTracking, state.score]);

  const handleRestartCampaign = useCallback(() => {
    resetRunTracking();
    setRunSetRecord(false);
    lastProcessedScoreRef.current = 0;

    if (settings.careerModeEnabled && careerLoaded) {
      const startPosition = getPromotionStagePosition(
        careerState.rank,
        careerState.promotionWins,
      );

      if (startPosition) {
        dispatch({
          type: 'RESTART',
          level: startPosition.level,
          stage: startPosition.stage,
        });
        return;
      }
    }

    dispatch({ type: 'RESTART' });
  }, [
    careerLoaded,
    careerState.promotionWins,
    careerState.rank,
    dispatch,
    resetRunTracking,
    settings.careerModeEnabled,
  ]);

  const handleGameOverRestart = useCallback(() => {
    if (!gameOverRestartReady) {
      return;
    }
    handleRetryStage();
  }, [gameOverRestartReady, handleRetryStage]);

  const handlePauseToggle = useCallback(() => {
    if (state.gameOver || state.stageCleared || state.campaignComplete) {
      return;
    }
    setPaused((value) => {
      if (!value) {
        dispatch({ type: 'DAS', direction: 0 });
        softDropActiveRef.current = false;
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
    state.gameOver ? handleGameOverRestart : handleRetryStage,
    !inputDisabled,
  );

  useEffect(() => {
    onPauseChange(paused);
  }, [paused, onPauseChange]);

  useEffect(() => {
    onGameOverChange(state.gameOver);
  }, [state.gameOver, onGameOverChange]);

  useEffect(() => {
    if (state.pendingSpawn) {
      softDropActiveRef.current = false;
    }
  }, [state.pendingSpawn]);

  useEffect(() => {
    if (!state.gameOver) {
      setGameOverRestartReady(false);
      return;
    }

    setGameOverRestartReady(false);
    const timeoutId = setTimeout(() => {
      setGameOverRestartReady(true);
    }, GAME_OVER_RESTART_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [state.gameOver]);

  useEffect(() => {
    if (state.score < lastProcessedScoreRef.current) {
      lastProcessedScoreRef.current = state.score;
      if (state.score === 0) {
        setRunSetRecord(false);
      }
      return;
    }

    if (state.score === lastProcessedScoreRef.current) {
      return;
    }

    lastProcessedScoreRef.current = state.score;
    const result = updateScoreProgress(state.score);
    if (result.isNewHighScore) {
      setRunSetRecord(true);
    }
    if (result.newlyUnlocked.length > 0) {
      setAchievementQueue((queue) => [...queue, ...result.newlyUnlocked]);
    }
  }, [state.score, updateScoreProgress]);

  useEffect(() => {
    if (activeAchievement !== null || achievementQueue.length === 0) {
      return;
    }

    setActiveAchievement(achievementQueue[0]!);
    setAchievementQueue((queue) => queue.slice(1));
  }, [activeAchievement, achievementQueue]);

  const handleAchievementComplete = useCallback(() => {
    setActiveAchievement(null);
  }, []);

  const handlePromotionComplete = useCallback(() => {
    setShowPromotionOverlay(false);
  }, []);

  useEffect(() => {
    if (
      !state.stageCleared ||
      !settings.careerModeEnabled ||
      !careerLoaded
    ) {
      return;
    }

    const stageKey = `${state.level}-${state.stage}`;
    if (recordedStageKey.current === stageKey) {
      return;
    }

    recordedStageKey.current = stageKey;
    const result = recordStageResultRef.current({
      cleared: true,
      campaignLevel: state.level,
      campaignStage: state.stage,
    });

    if (result) {
      setCareerResult(result);
      if (result.promoted) {
        setShowPromotionOverlay(true);
      }
    }
  }, [
    state.stageCleared,
    state.level,
    state.stage,
    settings.careerModeEnabled,
    careerLoaded,
  ]);

  useEffect(() => {
    if (!state.gameOver || !settings.careerModeEnabled || !careerLoaded) {
      return;
    }

    if (recordedGameOverRun.current === runId.current) {
      return;
    }

    recordedGameOverRun.current = runId.current;
    const result = recordStageResultRef.current({
      cleared: false,
      campaignLevel: state.level,
      campaignStage: state.stage,
    });

    if (result) {
      setCareerResult(result);
    }
  }, [
    state.gameOver,
    state.level,
    state.stage,
    settings.careerModeEnabled,
    careerLoaded,
  ]);

  useEffect(() => {
    if (!careerLoaded || !settings.careerModeEnabled || careerPositionSynced.current) {
      return;
    }

    careerPositionSynced.current = true;
    const startPosition = getPromotionStagePosition(
      careerState.rank,
      careerState.promotionWins,
    );

    if (!startPosition) {
      return;
    }

    if (state.level !== startPosition.level || state.stage !== startPosition.stage) {
      dispatch({
        type: 'RESTART',
        level: startPosition.level,
        stage: startPosition.stage,
      });
    }
  }, [
    careerLoaded,
    careerState.promotionWins,
    careerState.rank,
    dispatch,
    settings.careerModeEnabled,
    state.level,
    state.stage,
  ]);

  const handleOpenSettings = useCallback(() => {
    if (!modalBlocking) {
      setPaused(true);
      dispatch({ type: 'DAS', direction: 0 });
    }
    onOpenSettings();
  }, [modalBlocking, onOpenSettings]);

  const promotedRank = careerResult?.promoted ?? null;
  const promotionTitle =
    promotedRank === 'ceo'
      ? translate('career.ceoReached.title')
      : translate('career.promoted.title');
  const promotionSubtitle =
    promotedRank === 'ceo'
      ? translate('career.ceoReached.subtitle')
      : promotedRank
        ? translate('career.promoted.subtitle', {
            rank: translate(careerRankKey(promotedRank)),
          })
        : '';

  const showCareerBar =
    settings.careerModeEnabled && careerLoaded && careerBar !== null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <Pressable
            style={styles.iconButton}
            onPress={handleOpenSettings}
            accessibilityRole="button"
            accessibilityLabel={translate('accessibility.settings')}
          >
            <Text style={styles.iconLabel}>⚙</Text>
          </Pressable>
          <Text style={styles.title}>{translate('app.title')}</Text>
          <Pressable
            style={styles.iconButton}
            onPress={handlePauseToggle}
            disabled={state.gameOver || state.stageCleared || state.campaignComplete}
            accessibilityRole="button"
            accessibilityLabel={
              paused
                ? translate('accessibility.resume')
                : translate('accessibility.pause')
            }
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
            <PlayerStatusBar
              avatarId={settings.playerAvatarId}
              careerMode={showCareerBar}
              career={careerBar ?? undefined}
              stats={{
                score: state.score,
                level: state.level,
                stage: state.stage,
                lines: state.lines,
              }}
              highScore={showCareerBar ? undefined : scoreRecord.highScore}
              isPersonalBest={!showCareerBar && runSetRecord}
              scoreLabel={translate('profile.score')}
              highScoreLabel={translate('profile.highScore')}
              newBestLabel={translate('profile.newBest')}
              levelLabel={translate('profile.level')}
              stageLabel={translate('profile.stage')}
              lineLabel={translate('profile.line')}
            />

            <View
              style={[styles.playSection, { minHeight: fallbackPlayHeight }]}
              onLayout={handlePlaySectionLayout}
            >
              <View style={styles.playArea}>
                <View style={styles.playAreaSpacer} />

                <View style={styles.centerColumn}>
                  <View
                    style={[styles.gameClusterWrap, { width: gameClusterWidth }]}
                  >
                    <View style={styles.gameCluster}>
                      <View
                        style={[styles.boardColumn, { width: boardColumnWidth }]}
                      >
                        <SwipeZone
                          onAction={handleAction}
                          onDas={handleDas}
                          onSoftDropHold={handleSoftDropHold}
                          disabled={inputDisabled}
                        >
                          <BoardView
                            board={displayBoard}
                            cellSize={cellSize}
                            active={state.active}
                            ghost={ghostPiece}
                            lineClear={state.lineClear}
                          />
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

                    {paused && !modalBlocking ? (
                      <GameOverlay
                        variant="pause"
                        onPrimary={handleResume}
                        onSecondary={handleRetryStage}
                      />
                    ) : null}
                    {state.stageCleared && !showPromotionOverlay ? (
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
                        highScore={scoreRecord.highScore}
                        isNewHighScore={runSetRecord}
                        onPrimary={handleRestartCampaign}
                      />
                    ) : null}
                    {state.gameOver ? (
                      <GameOverlay
                        variant="gameOver"
                        score={state.score}
                        highScore={scoreRecord.highScore}
                        isNewHighScore={runSetRecord}
                        primaryDisabled={!gameOverRestartReady}
                        onPrimary={handleGameOverRestart}
                      />
                    ) : null}
                    <PromotionOverlay
                      visible={showPromotionOverlay}
                      title={promotionTitle}
                      subtitle={promotionSubtitle}
                      isCeo={promotedRank === 'ceo'}
                      playerAvatarId={settings.playerAvatarId}
                      onComplete={handlePromotionComplete}
                    />
                  </View>

                  <GestureTutorial width={gameClusterWidth} />
                </View>

                <View style={styles.playAreaSpacer} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {activeAchievement ? (
        <AchievementToast
          visible
          badge={translate('score.achievementUnlocked')}
          title={translate(`${achievementKey(activeAchievement)}.title`)}
          subtitle={translate(`${achievementKey(activeAchievement)}.description`)}
          onComplete={handleAchievementComplete}
        />
      ) : null}
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
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.panel,
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
  },
  iconLabel: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    color: theme.accent,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
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
    backgroundColor: theme.background,
  },
  playBlock: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.background,
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
  gameClusterWrap: {
    position: 'relative',
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
    backgroundColor: theme.background,
  },
});
