import { useEffect, useState } from "react";

export const ConnectionStatus = ({ isOnline: isOnlineProp }: { isOnline?: boolean } = {}) => {
  const [isOnlineState, setIsOnlineState] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  const isOnline = isOnlineProp ?? isOnlineState;

  useEffect(() => {
    if (isOnlineProp !== undefined) {
      return;
    }

    const handleOnline = () => setIsOnlineState(true);
    const handleOffline = () => setIsOnlineState(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOnlineProp]);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-card px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-text"
      role="status"
      aria-live="polite"
    >
      <span
        className={`size-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-destructive"}`}
        aria-hidden="true"
      />
      {isOnline ? "Online" : "Offline"}
    </span>
  );
};
