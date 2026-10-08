import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminUser = {
  id: string;
  email: string | null;
  full_name: string;
  city: string;
  phone: string | null;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
};

export type AdminOverview = {
  users: AdminUser[];
  requestsByStatus: Record<string, number>;
  totalRequests: number;
  totalBids: number;
  totalReviews: number;
};

export const isPlatformAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("is_platform_admin");
    return data === true;
  });

// Admin-only overview. Admin status is verified as the caller (RLS-bound
// client) BEFORE the privileged client is loaded.
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const { data: isAdmin, error } = await context.supabase.rpc("is_platform_admin");
    if (error || isAdmin !== true) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const authUsers: { id: string; email?: string; created_at: string; last_sign_in_at?: string | null }[] = [];
    for (let page = 1; page <= 50; page++) {
      const { data, error: e } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (e) throw new Error("Failed to list users");
      authUsers.push(...data.users);
      if (data.users.length < 1000) break;
    }

    const [{ data: profiles }, { data: roles }, { data: reqs }, bids, reviews] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name, city, phone"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("requests").select("status"),
      supabaseAdmin.from("bids").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("reviews").select("id", { count: "exact", head: true }),
    ]);

    const pMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const rMap = new Map<string, string[]>();
    for (const r of roles ?? []) rMap.set(r.user_id, [...(rMap.get(r.user_id) ?? []), r.role]);

    const requestsByStatus: Record<string, number> = {};
    for (const r of reqs ?? []) requestsByStatus[r.status] = (requestsByStatus[r.status] ?? 0) + 1;

    const users: AdminUser[] = authUsers
      .map((u) => {
        const p = pMap.get(u.id);
        return {
          id: u.id,
          email: u.email ?? null,
          full_name: p?.full_name ?? "",
          city: p?.city ?? "",
          phone: p?.phone ?? null,
          roles: rMap.get(u.id) ?? [],
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
        };
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    return {
      users,
      requestsByStatus,
      totalRequests: reqs?.length ?? 0,
      totalBids: bids.count ?? 0,
      totalReviews: reviews.count ?? 0,
    };
  });
