import { useState, useCallback } from 'react';

export type Situation = 'workplace' | 'home' | 'outside' | null;

export const useSituation = () => {
  const [situation, setSituation] = useState<Situation>(null);

  const updateSituation = useCallback((newSituation: Situation) => {
    setSituation(newSituation);
  }, []);

  const resetSituation = useCallback(() => {
    setSituation(null);
  }, []);

  return {
    situation,
    setSituation: updateSituation,
    resetSituation,
  };
};