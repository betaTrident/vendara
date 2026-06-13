const getRequiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const getServerEnv = () => ({
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  publicNeonAuthUrl: getRequiredEnv("PUBLIC_NEON_AUTH_URL"),
});
