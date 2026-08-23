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
import { applyScoreUpdate } from './scoreProgress';
import { loadScoreRecord, saveScoreRecord, DEFAULT_SCORE_RECORD } from './scoreStorage';
import type { ScoreRecord, ScoreUpdateResult } from './types';

type ScoreContextValue = {
  scoreRecord: ScoreRecord;
  loaded: boolean;
  updateScoreProgress: (score: number) => ScoreUpdateResult;
};

const ScoreContext = createContext<ScoreContextValue | null>(null);

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [scoreRecord, setScoreRecord] = useState<ScoreRecord>(DEFAULT_SCORE_RECORD);
  const [loaded, setLoaded] = useState(false);
  const scoreRecordRef = useRef(scoreRecord);
  scoreRecordRef.current = scoreRecord;

  useEffect(() => {
    let cancelled = false;

    loadScoreRecord()
      .then((record) => {
        if (!cancelled) {
          setScoreRecord(record);
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

  const updateScoreProgress = useCallback((score: number): ScoreUpdateResult => {
    const { nextRecord, result } = applyScoreUpdate(scoreRecordRef.current, score);

    if (
      result.isNewHighScore ||
      result.newlyUnlocked.length > 0
    ) {
      setScoreRecord(nextRecord);
      void saveScoreRecord(nextRecord);
    }

    return result;
  }, []);

  const value = useMemo(
    () => ({
      scoreRecord,
      loaded,
      updateScoreProgress,
    }),
    [scoreRecord, loaded, updateScoreProgress],
  );

  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
}

export function useScore() {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error('useScore must be used within ScoreProvider');
  }
  return context;
}
