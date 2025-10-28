import { useEffect, useState } from 'react';

export function useOfflineStatus() {
  const [isOffline, setOffline] = useState<boolean>(() => typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setOffline(false);
    }

    function handleOffline() {
      setOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}
