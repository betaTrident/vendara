import { registerSW } from "virtual:pwa-register";
import { useCallback, useEffect, useState } from "react";

export type PwaUpdateState = {
  isOnline: boolean;
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
};

const getInitialOnline = () => (typeof navigator !== "undefined" ? navigator.onLine : true);

export const usePwaState = (): PwaUpdateState => {
  const [isOnline, setIsOnline] = useState(getInitialOnline);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<
    ((reloadPage?: boolean) => Promise<void>) | null
  >(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (import.meta.env.SSR) {
      return;
    }

    const applyUpdate = registerSW({
      immediate: true,
      onOfflineReady() {
        setOfflineReady(true);
      },
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegistered(registration) {
        if (!registration) {
          return;
        }

        window.setInterval(
          () => {
            void registration.update();
          },
          60 * 60 * 1000,
        );
      },
    });

    setUpdateServiceWorker(() => applyUpdate);
  }, []);

  const refresh = useCallback(
    async (reloadPage = true) => {
      if (updateServiceWorker) {
        await updateServiceWorker(reloadPage);
      }
    },
    [updateServiceWorker],
  );

  return {
    isOnline,
    needRefresh,
    offlineReady,
    updateServiceWorker: refresh,
  };
};

export const hasDirtyForm = () => {
  if (typeof document === "undefined") {
    return false;
  }

  return Boolean(
    document.querySelector("form[data-dirty='true'], form[data-vendara-dirty='true']"),
  );
};
