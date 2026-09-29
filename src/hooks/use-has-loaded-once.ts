import { useEffect, useState } from 'react';

export function useHasLoadedOnce<T>(data: T): boolean {
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (data) setHasLoadedOnce(true);
  }, [data]);
  return hasLoadedOnce;
}
