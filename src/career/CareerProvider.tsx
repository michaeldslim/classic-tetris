import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSettings } from '../settings/SettingsContext';
import {
  applyStageResult,
  DEFAULT_CAREER_STATE,
  getResetStateAfterChairman,
} from './careerProgress';
import { clearCareerState, loadCareerState, saveCareerState } from './careerStorage';
import type { PromotionResult, StageResultInput } from './types';
import type { CareerState } from './types';

interface CareerContextValue {
  careerState: CareerState;
  loaded: boolean;
  recordStageResult: (input: StageResultInput) => PromotionResult | null;
  resetCareerProgress: () => Promise<void>;
  finalizeChairmanClear: () => Promise<void>;
}

const CareerContext = createContext<CareerContextValue | null>(null);

export function CareerProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [careerState, setCareerState] = useState<CareerState>(DEFAULT_CAREER_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadCareerState()
      .then((state) => {
        if (!cancelled) {
          setCareerState(state);
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

  const recordStageResult = useCallback(
    (input: StageResultInput): PromotionResult | null => {
      if (!settings.careerModeEnabled) {
        return null;
      }

      let result: PromotionResult | null = null;
      setCareerState((current) => {
        result = applyStageResult(current, input);
        void saveCareerState(result.nextState);
        return result.nextState;
      });
      return result;
    },
    [settings.careerModeEnabled],
  );

  const resetCareerProgress = useCallback(async () => {
    setCareerState(DEFAULT_CAREER_STATE);
    await clearCareerState();
  }, []);

  const finalizeChairmanClear = useCallback(async () => {
    let nextState = DEFAULT_CAREER_STATE;
    setCareerState((current) => {
      nextState = getResetStateAfterChairman(current);
      return nextState;
    });
    await saveCareerState(nextState);
  }, []);

  const value = useMemo(
    () => ({
      careerState,
      loaded,
      recordStageResult,
      resetCareerProgress,
      finalizeChairmanClear,
    }),
    [careerState, loaded, recordStageResult, resetCareerProgress, finalizeChairmanClear],
  );

  return <CareerContext.Provider value={value}>{children}</CareerContext.Provider>;
}

export function useCareer(): CareerContextValue {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within CareerProvider');
  }
  return context;
}
