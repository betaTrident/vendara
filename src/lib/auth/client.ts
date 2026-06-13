import { createAuthClient } from "@neondatabase/neon-js/auth";

const authBaseUrl = import.meta.env.PUBLIC_NEON_AUTH_URL;

const buildAuthUrl = (path: string) => `${authBaseUrl}${path}`;

export const authClient = createAuthClient(authBaseUrl);

export const getAuthToken = async () => {
  const response = await fetch(buildAuthUrl("/get-session"), {
    credentials: "include",
    method: "GET",
  });

  if (!response.ok) {
    return null;
  }

  return response.headers.get("set-auth-jwt");
};
