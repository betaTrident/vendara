import { getSql } from "@/lib/db/client";
import { normalizeAdminEmail } from "@/lib/auth/http";

export const getActiveAdminUserByEmail = async (email: string) => {
  const sql = getSql();
  const [row] = await sql`
    select id, email, is_active
    from admin_users
    where email = ${normalizeAdminEmail(email)}
      and is_active = true
    limit 1
  `;

  return row
    ? {
        id: String(row.id),
        email: String(row.email),
      }
    : null;
};
