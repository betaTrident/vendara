const getRequiredEnv = (key: string) => {
  let value = process.env[key];

  if (!value) {
    // Fall back to import.meta.env statically to allow Vite replacement
    if (key === "DATABASE_URL") {
      value = import.meta.env.DATABASE_URL;
    } else if (key === "PUBLIC_NEON_AUTH_URL") {
      value = import.meta.env.PUBLIC_NEON_AUTH_URL;
    }
  }

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const getServerEnv = () => ({
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  publicNeonAuthUrl: getRequiredEnv("PUBLIC_NEON_AUTH_URL"),
});

