import { useState, useCallback } from 'react';

export type Duration = 5 | 15 | 30 | null;

export const useDuration = () => {
  const [duration, setDuration] = useState<Duration>(null);

  const updateDuration = useCallback((newDuration: Duration) => {
    setDuration(newDuration);
  }, []);

  const resetDuration = useCallback(() => {
    setDuration(null);
  }, []);

  return {
    duration,
    setDuration: updateDuration,
    resetDuration,
  };
};