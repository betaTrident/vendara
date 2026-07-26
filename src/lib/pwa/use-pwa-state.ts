import { registerSW } from "virtual:pwa-register";
import { useCallback, useEffect, useRef, useState } from "react";

export { hasDirtyForm } from "@/lib/pwa/dirty-form";

export type PwaUpdateState = {
  isOnline: boolean;
  needRefresh: boolean;
  offlineReady: boolean;
  reconnected: boolean;
  acknowledgeReconnected: () => void;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
};

const getInitialOnline = () => (typeof navigator !== "undefined" ? navigator.onLine : true);

export const usePwaState = (): PwaUpdateState => {
  const [isOnline, setIsOnline] = useState(getInitialOnline);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [reconnected, setReconnected] = useState(false);
  const wasOfflineRef = useRef(!getInitialOnline());
  const [updateServiceWorker, setUpdateServiceWorker] = useState<
    ((reloadPage?: boolean) => Promise<void>) | null
  >(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOfflineRef.current) {
        setReconnected(true);
        wasOfflineRef.current = false;
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      wasOfflineRef.current = true;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const acknowledgeReconnected = useCallback(() => {
    setReconnected(false);
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
    reconnected,
    acknowledgeReconnected,
    updateServiceWorker: refresh,
  };
};
