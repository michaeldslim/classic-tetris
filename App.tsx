import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameAudioProvider, useGameAudio } from './src/audio/GameAudioContext';
import { CareerProvider } from './src/career/CareerProvider';
import { LeaderboardProvider } from './src/leaderboard/LeaderboardProvider';
import { ScoreProvider } from './src/score/ScoreProvider';
import { CareerScreen } from './src/components/CareerScreen';
import { GameScreen } from './src/components/GameScreen';
import { LeaderboardScreen } from './src/components/LeaderboardScreen';
import { SettingsScreen } from './src/components/SettingsScreen';
import { StartScreen } from './src/components/StartScreen';
import { SettingsProvider } from './src/settings/SettingsContext';
import { theme } from './src/theme/colors';

type OverlayScreen = 'home' | 'settings' | 'career' | 'leaderboard' | null;

function AppRoot() {
  const { setBgmPaused } = useGameAudio();
  const [gameStarted, setGameStarted] = useState(false);
  const [overlay, setOverlay] = useState<OverlayScreen>('home');
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const effectiveOverlay: OverlayScreen = !gameStarted
    ? overlay === 'settings' || overlay === 'career' || overlay === 'leaderboard'
      ? overlay
      : 'home'
    : overlay;

  const gameActive = gameStarted && effectiveOverlay === null;

  useEffect(() => {
    setBgmPaused(
      effectiveOverlay === 'home' ||
        effectiveOverlay === 'settings' ||
        effectiveOverlay === 'career' ||
        effectiveOverlay === 'leaderboard' ||
        gamePaused ||
        gameOver,
    );
  }, [effectiveOverlay, gamePaused, gameOver, setBgmPaused]);

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    setOverlay(null);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setOverlay('settings');
  }, []);

  const handleCloseSettings = useCallback(() => {
    setOverlay(gameStarted ? null : 'home');
  }, [gameStarted]);

  const handleOpenCareer = useCallback(() => {
    setOverlay('career');
  }, []);

  const handleCloseCareer = useCallback(() => {
    setOverlay('settings');
  }, []);

  const handleOpenLeaderboard = useCallback(() => {
    setOverlay('leaderboard');
  }, []);

  const handleCloseLeaderboard = useCallback(() => {
    setOverlay(gameStarted ? 'settings' : 'home');
  }, [gameStarted]);

  const handleCareerReset = useCallback(() => {
    setGameStarted(false);
    setOverlay('home');
    setGamePaused(false);
    setGameOver(false);
  }, []);

  return (
    <View style={styles.root}>
      {gameStarted ? (
        <View style={styles.gameLayer}>
          <GameScreen
            active={gameActive}
            onOpenSettings={handleOpenSettings}
            onPauseChange={setGamePaused}
            onGameOverChange={setGameOver}
          />
        </View>
      ) : null}

      {effectiveOverlay === 'home' ? (
        <View style={styles.overlay}>
          <StartScreen
            onStart={handleStartGame}
            onOpenSettings={handleOpenSettings}
            onOpenLeaderboard={handleOpenLeaderboard}
          />
        </View>
      ) : null}

      {effectiveOverlay === 'settings' ? (
        <View style={styles.overlay}>
          <SettingsScreen
            onBack={handleCloseSettings}
            onOpenCareer={handleOpenCareer}
            onOpenLeaderboard={handleOpenLeaderboard}
            onCareerReset={handleCareerReset}
          />
        </View>
      ) : null}

      {effectiveOverlay === 'career' ? (
        <View style={styles.overlay}>
          <CareerScreen
            onBack={handleCloseCareer}
            onOpenSettings={handleOpenSettings}
          />
        </View>
      ) : null}

      {effectiveOverlay === 'leaderboard' ? (
        <View style={styles.overlay}>
          <LeaderboardScreen onBack={handleCloseLeaderboard} />
        </View>
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ScoreProvider>
          <CareerProvider>
            <LeaderboardProvider>
              <GameAudioProvider>
                <AppRoot />
                <StatusBar style="light" />
              </GameAudioProvider>
            </LeaderboardProvider>
          </CareerProvider>
        </ScoreProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.background,
  },
  gameLayer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    backgroundColor: theme.background,
  },
});
