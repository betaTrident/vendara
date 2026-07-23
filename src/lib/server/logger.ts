export type ServerLogLevel = "info" | "warn" | "error";

export type ServerLogEvent = {
  level: ServerLogLevel;
  message: string;
  requestId: string;
  context?: Record<string, string | number | boolean>;
};

export const logServerEvent = (event: ServerLogEvent) => {
  const payload = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  const line = JSON.stringify(payload);

  if (event.level === "error") {
    console.error(line);
    return;
  }

  if (event.level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
};
