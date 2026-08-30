import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { addLeaderboardEntry, isValidInitials, normalizeInitials } from './leaderboardProgress';
import { loadLeaderboardState, saveLeaderboardState } from './leaderboardStorage';
import type { LeaderboardState, SaveLeaderboardInput } from './types';

type LeaderboardContextValue = {
  leaderboard: LeaderboardState;
  loaded: boolean;
  saveChairmanEntry: (input: SaveLeaderboardInput) => Promise<boolean>;
};

const LeaderboardContext = createContext<LeaderboardContextValue | null>(null);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardState>({ entries: [] });
  const [loaded, setLoaded] = useState(false);
  const leaderboardRef = useRef(leaderboard);
  leaderboardRef.current = leaderboard;

  useEffect(() => {
    let cancelled = false;

    loadLeaderboardState()
      .then((state) => {
        if (!cancelled) {
          setLeaderboard(state);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveChairmanEntry = useCallback(async (input: SaveLeaderboardInput) => {
    const initials = normalizeInitials(input.initials);
    if (!isValidInitials(initials)) {
      return false;
    }

    const nextState: LeaderboardState = {
      entries: addLeaderboardEntry(leaderboardRef.current.entries, {
        initials,
        score: input.score,
        avatarId: input.avatarId,
      }),
    };

    setLeaderboard(nextState);
    await saveLeaderboardState(nextState);
    return true;
  }, []);

  const value = useMemo(
    () => ({
      leaderboard,
      loaded,
      saveChairmanEntry,
    }),
    [leaderboard, loaded, saveChairmanEntry],
  );

  return (
    <LeaderboardContext.Provider value={value}>{children}</LeaderboardContext.Provider>
  );
}

export function useLeaderboard(): LeaderboardContextValue {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within LeaderboardProvider');
  }
  return context;
}
