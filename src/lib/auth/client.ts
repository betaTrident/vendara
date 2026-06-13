import { createInternalNeonAuth } from "@neondatabase/auth";

const neonAuth = createInternalNeonAuth(import.meta.env.PUBLIC_NEON_AUTH_URL);

export const authClient = neonAuth.adapter;

export const getAuthToken = () => neonAuth.getJWTToken(false);
