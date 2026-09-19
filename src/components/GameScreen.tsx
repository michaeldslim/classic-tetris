import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { careerRankKey, getCareerProgressCopy, getStageClearCareerHint } from '../career/careerLabels';
import { getCareerStageTarget } from '../career/careerRules';
import type { CareerStageTarget } from '../career/types';
import { useCareer } from '../career/CareerProvider';
import type { PromotionResult } from '../career/types';
import { getGhostPiece } from '../game/engine';
import {
  getDifficultyProfile,
  getBonusLineTarget,
  resolveCareerStageModifiers,
  resolvePromotionStageModifiers,
} from '../difficulty/difficultyProfile';
import { BONUS_SCORE_MULTIPLIER, shouldTriggerBonus } from '../game/bonusGame';
import {
  clearGameSession,
  createGameSessionSnapshot,
  saveGameSession,
  type GameSessionSnapshot,
} from '../game/gameStorage';
import { BOARD_FRAME_SIZE } from '../theme/colors';
import { BOARD_WIDTH, computeCellSize } from '../game/types';
import type { EngineAction, GameAction } from '../game/types';
import { useGameEngine } from '../hooks/useGameEngine';
import { useGameFeedback } from '../hooks/useGameFeedback';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useSettings } from '../settings/SettingsContext';
import type { GameDifficulty } from '../settings/types';
import { achievementKey } from '../score/achievements';
import { useLeaderboard } from '../leaderboard/LeaderboardProvider';
import { useScore } from '../score/ScoreProvider';
import type { ScoreAchievementId } from '../score/types';
import { theme } from '../theme/colors';
import { AchievementToast } from './AchievementToast';
import { BoardView } from './BoardView';
import { BonusGameOverlay } from './BonusGameOverlay';
import { ChairmanSaveModal } from './ChairmanSaveModal';
import { GameOverlay } from './GameOverlay';
import { GestureTutorial, GESTURE_TUTORIAL_HEIGHT } from './GestureTutorial';
import { PlayerStatusBar } from './PlayerStatusBar';
import { PromotionOverlay } from './PromotionOverlay';
import { SwipeZone } from './TouchControls';
import { HudPanel } from './HudPanel';

const HORIZONTAL_PADDING = 12;
const HUD_WIDTH = 72;
const PLAY_GAP = 8;
const BOARD_BORDER = BOARD_FRAME_SIZE;
const TUTORIAL_GAP = 12;
const BOTTOM_LIFT = 24;

const TITLE_ROW_HEIGHT = 40;
const PROFILE_BAR_HEIGHT = 72;
const MIN_PLAY_SECTION_HEIGHT = 200;
const GAME_OVER_RESTART_DELAY_MS = 4000;

type BonusPhase = 'none' | 'intro' | 'result';

function dispatchCareerStage(
  dispatch: (action: EngineAction) => void,
  target: CareerStageTarget,
  difficulty: GameDifficulty,
  actionType: 'NEXT_STAGE' | 'RESTART',
) {
  const mods = resolveCareerStageModifiers(difficulty, target);
  dispatch({
    type: actionType,
    level: target.level,
    stage: target.stage,
    stageLineTarget: mods.lineTarget,
    gravityTier: mods.gravityTier,
  });
}

type GameScreenProps = {
  active?: boolean;
  forceResumeToken?: number;
  restoredSession?: GameSessionSnapshot | null;
  onOpenSettings: () => void;
  onPauseChange: (paused: boolean) => void;
  onGameOverChange: (gameOver: boolean) => void;
};

export function GameScreen({
  active = true,
  forceResumeToken = 0,
  restoredSession = null,
  onOpenSettings,
  onPauseChange,
  onGameOverChange,
}: GameScreenProps) {
  const { settings, translate } = useSettings();
  const { careerState, loaded: careerLoaded, recordStageResult, finalizeChairmanClear } =
    useCareer();
  const { scoreRecord, updateScoreProgress } = useScore();
  const { saveChairmanEntry } = useLeaderboard();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [playSection, setPlaySection] = useState({ width: 0, height: 0 });
  const [paused, setPaused] = useState(false);
  const [lastAction, setLastAction] = useState<GameAction | null>(null);
  const [careerResult, setCareerResult] = useState<PromotionResult | null>(null);
  const [showPromotionOverlay, setShowPromotionOverlay] = useState(false);
  const [showChairmanSaveOverlay, setShowChairmanSaveOverlay] = useState(false);
  const [bonusPhase, setBonusPhase] = useState<BonusPhase>(
    restoredSession?.bonusPhase ?? 'none',
  );
  const [pendingBonus, setPendingBonus] = useState(restoredSession?.pendingBonus ?? false);
  const [chairmanSaveScore, setChairmanSaveScore] = useState(0);
  const [gameOverRestartReady, setGameOverRestartReady] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<ScoreAchievementId[]>([]);
  const [activeAchievement, setActiveAchievement] = useState<ScoreAchievementId | null>(null);
  const [runSetRecord, setRunSetRecord] = useState(false);
  const lastProcessedScoreRef = useRef(restoredSession?.state.score ?? 0);
  const recordedStageKey = useRef<string | null>(restoredSession?.recordedStageKey ?? null);
  const recordedGameOverRun = useRef<number | null>(null);
  const stagesClearedCountRef = useRef(restoredSession?.stagesClearedCount ?? 0);
  const bonusCheckStageKeyRef = useRef<string | null>(
    restoredSession?.bonusCheckStageKey ?? null,
  );
  const runId = useRef(0);
  const recordStageResultRef = useRef(recordStageResult);
  recordStageResultRef.current = recordStageResult;
  const softDropActiveRef = useRef(false);
  const sessionSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { state, dispatch } = useGameEngine(restoredSession?.state);

  useGameLoop(
    state,
    dispatch,
    paused ||
      !active ||
      showPromotionOverlay ||
      showChairmanSaveOverlay ||
      bonusPhase === 'intro' ||
      bonusPhase === 'result',
    softDropActiveRef,
  );
  const { lockPulseKey } = useGameFeedback(state, lastAction);

  const modalBlocking =
    showPromotionOverlay ||
    showChairmanSaveOverlay ||
    bonusPhase === 'intro' ||
    bonusPhase === 'result' ||
    state.gameOver ||
    (state.stageCleared && state.mode === 'campaign') ||
    state.campaignComplete;

  const inputDisabled =
    !active ||
    modalBlocking ||
    paused ||
    state.lineClear !== null ||
    state.pendingSpawn;

  const lineTarget =
    state.mode === 'bonus'
      ? (state.stageLineTargetOverride ??
        getBonusLineTarget(state.gameDifficulty))
      : (state.stageLineTargetOverride ??
        resolvePromotionStageModifiers(settings.gameDifficulty, state.stage)
          .lineTarget);
  const gravityTier =
    state.gravityTierOverride ??
    resolvePromotionStageModifiers(settings.gameDifficulty, state.stage)
      .gravityTier;
  const bonusLineTargetDisplay =
    state.stageLineTargetOverride ??
    getBonusLineTarget(state.gameDifficulty);
  const bonusTimerSec = state.bonus
    ? Math.ceil(state.bonus.timeRemainingMs / 1000)
    : undefined;

  const tutorialLayoutHeight = GESTURE_TUTORIAL_HEIGHT + TUTORIAL_GAP;

  const fallbackPlayHeight = useMemo(() => {
    const chromeHeight =
      insets.top +
      insets.bottom +
      TITLE_ROW_HEIGHT +
      PROFILE_BAR_HEIGHT +
      BOTTOM_LIFT +
      tutorialLayoutHeight +
      24;
    return Math.max(windowHeight - chromeHeight, 320);
  }, [
    insets.top,
    insets.bottom,
    tutorialLayoutHeight,
    windowHeight,
  ]);

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
    const playAreaHeight = sectionHeight - tutorialLayoutHeight - BOTTOM_LIFT;
    const boardHeight = playAreaHeight - BOARD_BORDER;
    return computeCellSize(boardWidth, boardHeight);
  }, [
    playSection.width,
    playSection.height,
    windowWidth,
    fallbackPlayHeight,
    tutorialLayoutHeight,
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
      nextStageLabel: progress.nextStage,
    };
  }, [settings.careerModeEnabled, careerLoaded, translate, careerState]);

  const stageClearCareerHint = useMemo(() => {
    if (!settings.careerModeEnabled || !careerLoaded || !state.stageCleared) {
      return undefined;
    }

    return (
      getStageClearCareerHint(translate, careerState, careerResult?.promoted ?? null) ??
      undefined
    );
  }, [
    careerLoaded,
    careerResult?.promoted,
    careerState,
    settings.careerModeEnabled,
    state.stageCleared,
    translate,
  ]);

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
      const nextPosition = getCareerStageTarget(careerState);

      if (nextPosition) {
        dispatchCareerStage(
          dispatch,
          nextPosition,
          settings.gameDifficulty,
          'NEXT_STAGE',
        );
        return;
      }
    }

    dispatch({ type: 'NEXT_STAGE' });
  }, [
    careerLoaded,
    careerState,
    dispatch,
    settings.careerModeEnabled,
    settings.gameDifficulty,
  ]);

  const resetRunTracking = useCallback(() => {
    runId.current += 1;
    recordedGameOverRun.current = null;
    recordedStageKey.current = null;
    setShowPromotionOverlay(false);
    setShowChairmanSaveOverlay(false);
    setBonusPhase('none');
    setPendingBonus(false);
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
      const startPosition = getCareerStageTarget(careerState);

      if (startPosition) {
        dispatchCareerStage(
          dispatch,
          startPosition,
          settings.gameDifficulty,
          'RESTART',
        );
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
    settings.gameDifficulty,
  ]);

  const handleGameOverRestart = useCallback(() => {
    if (!gameOverRestartReady) {
      return;
    }
    handleRetryStage();
  }, [gameOverRestartReady, handleRetryStage]);

  const handlePauseToggle = useCallback(() => {
    if (
      showChairmanSaveOverlay ||
      showPromotionOverlay ||
      state.gameOver ||
      (state.stageCleared && state.mode === 'campaign') ||
      state.campaignComplete ||
      bonusPhase === 'intro' ||
      bonusPhase === 'result'
    ) {
      return;
    }
    setPaused((value) => {
      if (!value) {
        dispatch({ type: 'DAS', direction: 0 });
        softDropActiveRef.current = false;
      }
      return !value;
    });
  }, [
    showChairmanSaveOverlay,
    showPromotionOverlay,
    state.gameOver,
    state.stageCleared,
    state.campaignComplete,
    state.mode,
    bonusPhase,
    dispatch,
  ]);

  const handleBonusStart = useCallback(() => {
    setBonusPhase('none');
    dispatch({ type: 'ENTER_BONUS' });
  }, [dispatch]);

  const handleBonusContinue = useCallback(() => {
    dispatch({ type: 'EXIT_BONUS' });
    setPendingBonus(false);
    setBonusPhase('none');
  }, [dispatch]);

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
    if (forceResumeToken <= 0) {
      return;
    }

    setPaused(false);
    softDropActiveRef.current = false;
    dispatch({ type: 'DAS', direction: 0 });
  }, [forceResumeToken, dispatch]);

  useEffect(() => {
    onPauseChange(paused);
  }, [paused, onPauseChange]);

  useEffect(() => {
    onGameOverChange(state.gameOver);
  }, [state.gameOver, onGameOverChange]);

  const persistSession = useCallback(() => {
    if (state.gameOver || state.campaignComplete) {
      void clearGameSession();
      return;
    }

    void saveGameSession(
      createGameSessionSnapshot(state, {
        paused,
        stagesClearedCount: stagesClearedCountRef.current,
        recordedStageKey: recordedStageKey.current,
        bonusCheckStageKey: bonusCheckStageKeyRef.current,
        pendingBonus,
        bonusPhase,
      }),
    );
  }, [state, paused, pendingBonus, bonusPhase]);

  useEffect(() => {
    if (state.gameOver || state.campaignComplete) {
      void clearGameSession();
      return;
    }

    if (sessionSaveTimeoutRef.current) {
      clearTimeout(sessionSaveTimeoutRef.current);
    }

    if (paused || !active) {
      persistSession();
      return;
    }

    sessionSaveTimeoutRef.current = setTimeout(() => {
      persistSession();
    }, 400);

    return () => {
      if (sessionSaveTimeoutRef.current) {
        clearTimeout(sessionSaveTimeoutRef.current);
      }
    };
  }, [state, paused, pendingBonus, bonusPhase, active, persistSession]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        persistSession();
      }
    });

    return () => subscription.remove();
  }, [persistSession]);

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
    if (careerResult?.promoted === 'chairman') {
      setChairmanSaveScore(state.score);
      setShowPromotionOverlay(false);
      setShowChairmanSaveOverlay(true);
      return;
    }
    setShowPromotionOverlay(false);
  }, [careerResult?.promoted, state.score]);

  const handleChairmanSave = useCallback(
    (initials: string) => {
      void saveChairmanEntry({
        initials,
        score: chairmanSaveScore,
        avatarId: settings.playerAvatarId,
        difficulty: settings.gameDifficulty,
      }).then((saved) => {
        if (saved) {
          void finalizeChairmanClear();
          setShowChairmanSaveOverlay(false);
          setPaused(false);
          softDropActiveRef.current = false;
          dispatch({ type: 'DAS', direction: 0 });
        }
      });
    },
    [
      chairmanSaveScore,
      finalizeChairmanClear,
      saveChairmanEntry,
      settings.playerAvatarId,
      settings.gameDifficulty,
      dispatch,
    ],
  );

  useEffect(() => {
    if (!state.stageCleared || state.mode !== 'campaign') {
      return;
    }

    const stageKey = `${state.level}-${state.stage}`;
    if (bonusCheckStageKeyRef.current === stageKey) {
      return;
    }

    bonusCheckStageKeyRef.current = stageKey;
    stagesClearedCountRef.current += 1;

    if (
      shouldTriggerBonus({
        stagesClearedTotal: stagesClearedCountRef.current,
      })
    ) {
      setPendingBonus(true);
    }
  }, [state.stageCleared, state.mode, state.level, state.stage]);

  useEffect(() => {
    if (
      !pendingBonus ||
      bonusPhase !== 'none' ||
      showPromotionOverlay ||
      showChairmanSaveOverlay ||
      !state.stageCleared ||
      state.mode !== 'campaign'
    ) {
      return;
    }

    setBonusPhase('intro');
  }, [
    pendingBonus,
    bonusPhase,
    showPromotionOverlay,
    showChairmanSaveOverlay,
    state.stageCleared,
    state.mode,
  ]);

  useEffect(() => {
    if (state.mode === 'bonus' && state.bonus?.ended && bonusPhase !== 'result') {
      setBonusPhase('result');
    }
  }, [state.mode, state.bonus?.ended, bonusPhase]);

  useEffect(() => {
    if (
      !state.stageCleared ||
      state.mode !== 'campaign' ||
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
    state.mode,
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
    if (
      !careerLoaded ||
      !settings.careerModeEnabled ||
      state.stageCleared ||
      showPromotionOverlay ||
      showChairmanSaveOverlay
    ) {
      return;
    }

    const startPosition = getCareerStageTarget(careerState);

    if (!startPosition) {
      return;
    }

    const mods = resolveCareerStageModifiers(
      settings.gameDifficulty,
      startPosition,
    );

    if (
      state.level !== startPosition.level ||
      state.stage !== startPosition.stage ||
      state.stageLineTargetOverride !== mods.lineTarget ||
      state.gravityTierOverride !== mods.gravityTier
    ) {
      dispatchCareerStage(
        dispatch,
        startPosition,
        settings.gameDifficulty,
        'RESTART',
      );
    }
  }, [
    careerLoaded,
    careerState,
    dispatch,
    settings.careerModeEnabled,
    settings.gameDifficulty,
    showPromotionOverlay,
    showChairmanSaveOverlay,
    state.gravityTierOverride,
    state.level,
    state.stage,
    state.stageCleared,
    state.stageLineTargetOverride,
  ]);

  useEffect(() => {
    const profile = getDifficultyProfile(settings.gameDifficulty);
    if (
      state.gameDifficulty === settings.gameDifficulty &&
      state.gravityScale === profile.gravityScale &&
      state.dasDelayMs === profile.dasDelayMs &&
      state.arrIntervalMs === profile.arrIntervalMs
    ) {
      return;
    }

    let stageLineTargetOverride: number | undefined;
    let gravityTierOverride: number | undefined;

    if (state.mode === 'campaign' && !state.stageCleared) {
      if (settings.careerModeEnabled && careerLoaded) {
        const target = getCareerStageTarget(careerState);
        if (
          target &&
          target.level === state.level &&
          target.stage === state.stage
        ) {
          const mods = resolveCareerStageModifiers(
            settings.gameDifficulty,
            target,
          );
          stageLineTargetOverride = mods.lineTarget;
          gravityTierOverride = mods.gravityTier;
        }
      } else {
        const mods = resolvePromotionStageModifiers(
          settings.gameDifficulty,
          state.stage,
        );
        stageLineTargetOverride = mods.lineTarget;
        gravityTierOverride = mods.gravityTier;
      }
    }

    dispatch({
      type: 'UPDATE_PLAY_PROFILE',
      gameDifficulty: settings.gameDifficulty,
      gravityScale: profile.gravityScale,
      dasDelayMs: profile.dasDelayMs,
      arrIntervalMs: profile.arrIntervalMs,
      ...(stageLineTargetOverride !== undefined
        ? { stageLineTargetOverride }
        : {}),
      ...(gravityTierOverride !== undefined ? { gravityTierOverride } : {}),
    });
  }, [
    careerLoaded,
    careerState,
    dispatch,
    settings.careerModeEnabled,
    settings.gameDifficulty,
    state.dasDelayMs,
    state.gameDifficulty,
    state.gravityScale,
    state.arrIntervalMs,
    state.level,
    state.mode,
    state.stage,
    state.stageCleared,
  ]);

  const handleOpenSettings = useCallback(() => {
    if (!modalBlocking) {
      setPaused(true);
      dispatch({ type: 'DAS', direction: 0 });
    }
    onOpenSettings();
  }, [modalBlocking, onOpenSettings]);

  const promotedRank = careerResult?.promoted ?? null;
  const isChairmanPromotion = promotedRank === 'chairman';
  const isCeoPromotion = promotedRank === 'ceo';
  const promotionTitle = isChairmanPromotion
    ? translate('career.chairmanReached.title')
    : isCeoPromotion
      ? translate('career.ceoReached.title')
      : translate('career.promoted.title');
  const promotionSubtitle = isChairmanPromotion
    ? translate('career.chairmanReached.subtitle')
    : isCeoPromotion
      ? translate('career.ceoReached.subtitle')
      : promotedRank
        ? translate('career.promoted.subtitle', {
            rank: translate(careerRankKey(promotedRank)),
          })
        : '';

  const showCareerBar =
    settings.careerModeEnabled && careerLoaded && careerBar !== null;

  const difficultyBadgeLabel =
    settings.gameDifficulty === 'casual'
      ? translate('settings.difficultyCasual')
      : settings.gameDifficulty === 'standard'
        ? translate('settings.difficultyStandard')
        : translate('settings.difficultyPro');

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
          <Pressable
            style={styles.iconButton}
            onPress={handlePauseToggle}
            disabled={
              state.gameOver ||
              (state.stageCleared && state.mode === 'campaign') ||
              state.campaignComplete ||
              bonusPhase !== 'none'
            }
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
              difficultyLabel={showCareerBar ? difficultyBadgeLabel : undefined}
              career={careerBar ?? undefined}
              score={state.score}
              highScore={showCareerBar ? undefined : scoreRecord.highScore}
              isPersonalBest={!showCareerBar && runSetRecord}
              scoreLabel={translate('profile.score')}
              highScoreLabel={translate('profile.highScore')}
              newBestLabel={translate('profile.newBest')}
            />

            <View
              style={[styles.playSection, { minHeight: fallbackPlayHeight }]}
              onLayout={handlePlaySectionLayout}
            >
              <View style={styles.playArea}>
                <View style={styles.playAreaSpacer} />

                <View style={[styles.centerColumn, { gap: TUTORIAL_GAP }]}>
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
                            stageCleared={state.stageCleared}
                            lockPulseKey={lockPulseKey}
                          />
                        </SwipeZone>
                      </View>

                      <HudPanel
                        careerMode={showCareerBar}
                        stats={{
                          score: state.score,
                          level: state.level,
                          stage: state.stage,
                          lines: state.lines,
                          lineTarget,
                          gravityTier,
                          bonusMode: state.mode === 'bonus',
                          bonusTimerSec,
                          bonusMultiplier: BONUS_SCORE_MULTIPLIER,
                        }}
                        nextPiece={state.next}
                      />
                    </View>

                    {paused && !modalBlocking ? (
                      <GameOverlay
                        variant="pause"
                        onPrimary={handleResume}
                        onSecondary={
                          state.mode === 'bonus' ? undefined : handleRetryStage
                        }
                      />
                    ) : null}
                    {state.stageCleared &&
                    state.mode === 'campaign' &&
                    !showPromotionOverlay &&
                    !showChairmanSaveOverlay &&
                    !pendingBonus &&
                    bonusPhase === 'none' ? (
                      <GameOverlay
                        variant="stageClear"
                        level={state.level}
                        stage={state.stage}
                        careerHint={stageClearCareerHint}
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
                    <BonusGameOverlay
                      visible={bonusPhase === 'intro' || bonusPhase === 'result'}
                      phase={bonusPhase === 'result' ? 'result' : 'intro'}
                      lineTarget={bonusLineTargetDisplay}
                      earnedScore={state.bonus?.earnedScore}
                      success={state.bonus?.success}
                      onPrimary={
                        bonusPhase === 'result'
                          ? handleBonusContinue
                          : handleBonusStart
                      }
                    />
                    <PromotionOverlay
                      visible={showPromotionOverlay}
                      title={promotionTitle}
                      subtitle={promotionSubtitle}
                      isCeo={isCeoPromotion}
                      isChairman={isChairmanPromotion}
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

      <ChairmanSaveModal
        visible={showChairmanSaveOverlay}
        score={chairmanSaveScore}
        playerAvatarId={settings.playerAvatarId}
        onSave={handleChairmanSave}
      />
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
    justifyContent: 'space-between',
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
