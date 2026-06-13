import { neon } from "@neondatabase/serverless";

import { getServerEnv } from "@/lib/env.server";

export const getSql = () => neon(getServerEnv().databaseUrl);
