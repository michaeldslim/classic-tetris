import AsyncStorage from '@react-native-async-storage/async-storage';
import { createInitialState } from '../src/game/engine';
import {
  clearGameSession,
  createGameSessionSnapshot,
  isResumableSession,
  loadGameSession,
  saveGameSession,
} from '../src/game/gameStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('game session storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks active sessions as resumable', () => {
    const snapshot = createGameSessionSnapshot(createInitialState(), {
      paused: true,
      stagesClearedCount: 2,
      recordedStageKey: null,
      bonusCheckStageKey: null,
      pendingBonus: false,
      bonusPhase: 'none',
    });

    expect(isResumableSession(snapshot)).toBe(true);
  });

  it('does not resume game over or completed campaigns', () => {
    const gameOver = createGameSessionSnapshot(
      { ...createInitialState(), gameOver: true },
      {
        paused: false,
        stagesClearedCount: 0,
        recordedStageKey: null,
        bonusCheckStageKey: null,
        pendingBonus: false,
        bonusPhase: 'none',
      },
    );

    const campaignComplete = createGameSessionSnapshot(
      { ...createInitialState(), campaignComplete: true },
      {
        paused: false,
        stagesClearedCount: 0,
        recordedStageKey: null,
        bonusCheckStageKey: null,
        pendingBonus: false,
        bonusPhase: 'none',
      },
    );

    expect(isResumableSession(gameOver)).toBe(false);
    expect(isResumableSession(campaignComplete)).toBe(false);
  });

  it('loads a valid saved session', async () => {
    const snapshot = createGameSessionSnapshot(createInitialState(), {
      paused: true,
      stagesClearedCount: 1,
      recordedStageKey: '1-1',
      bonusCheckStageKey: '1-1',
      pendingBonus: false,
      bonusPhase: 'none',
    });

    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(snapshot));

    await expect(loadGameSession()).resolves.toEqual(snapshot);
  });

  it('clears invalid sessions on load', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        version: 1,
        state: { ...createInitialState(), gameOver: true },
        paused: false,
        stagesClearedCount: 0,
        recordedStageKey: null,
        bonusCheckStageKey: null,
        pendingBonus: false,
        bonusPhase: 'none',
        savedAt: Date.now(),
      }),
    );

    await expect(loadGameSession()).resolves.toBeNull();
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalled();
  });

  it('clears storage when saving a finished session', async () => {
    const snapshot = createGameSessionSnapshot(
      { ...createInitialState(), gameOver: true },
      {
        paused: false,
        stagesClearedCount: 0,
        recordedStageKey: null,
        bonusCheckStageKey: null,
        pendingBonus: false,
        bonusPhase: 'none',
      },
    );

    await saveGameSession(snapshot);

    expect(mockedAsyncStorage.removeItem).toHaveBeenCalled();
    expect(mockedAsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('persists resumable sessions', async () => {
    const snapshot = createGameSessionSnapshot(createInitialState(), {
      paused: true,
      stagesClearedCount: 0,
      recordedStageKey: null,
      bonusCheckStageKey: null,
      pendingBonus: false,
      bonusPhase: 'none',
    });

    await saveGameSession(snapshot);

    expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
      '@classic-tetris/session',
      JSON.stringify(snapshot),
    );
  });

  it('clears saved sessions explicitly', async () => {
    await clearGameSession();
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith('@classic-tetris/session');
  });
});
