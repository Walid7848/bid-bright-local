import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { DeleteAccountResult } from "./account.functions";

const BUCKET = "request-images";
const MAX_AUTH_AGE_SECONDS = 15 * 60;
const BATCH = 100;
const MAX_ROUNDS = 200;

export type AuthClaims = { amr?: { method: string; timestamp: number }[] };

export async function deleteAccountCore(
  supabaseAdmin: SupabaseClient<Database>,
  userId: string,
  claims: AuthClaims,
): Promise<DeleteAccountResult> {
    // 1. Recent sign-in required (amr timestamp = actual sign-in time).
    const signInTimes = (claims.amr ?? []).map((a) => a.timestamp).filter(Boolean);
    const lastSignIn = signInTimes.length ? Math.max(...signInTimes) : 0;
    if (!lastSignIn || Date.now() / 1000 - lastSignIn > MAX_AUTH_AGE_SECONDS) {
      return { ok: false, code: "reauth" };
    }


    // 2. Block while active work exists (as client OR as awarded professional).
    const { data: asClient, error: e1 } = await supabaseAdmin
      .from("requests")
      .select("id")
      .eq("client_id", userId)
      .in("status", ["awarded", "in_progress"])
      .limit(1);
    if (e1) return { ok: false, code: "delete_failed" };
    if (asClient && asClient.length > 0) return { ok: false, code: "active_work" };

    const { data: active, error: e2 } = await supabaseAdmin
      .from("requests")
      .select("id, bids!requests_awarded_bid_id_fkey!inner(professional_id)")
      .in("status", ["awarded", "in_progress"])
      .eq("bids.professional_id", userId)
      .limit(1);
    if (e2) return { ok: false, code: "delete_failed" };
    if (active && active.length > 0) return { ok: false, code: "active_work" };

    // 3. Storage cleanup of <userId>/ only, in batches, idempotent.
    const prefix = `${userId}/`;
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const { data: files, error: listErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .list(userId, { limit: BATCH });
      if (listErr) return { ok: false, code: "storage_failed" };
      const paths = (files ?? [])
        .filter((f) => f.id) // skip folder placeholders
        .map((f) => `${userId}/${f.name}`)
        .filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes(".."));
      if (paths.length === 0) break;
      const { error: rmErr } = await supabaseAdmin.storage.from(BUCKET).remove(paths);
      if (rmErr) return { ok: false, code: "storage_failed" };
      if (round === MAX_ROUNDS - 1) return { ok: false, code: "storage_failed" };
    }

    // 4. Delete the auth user; existing CASCADE rules clean application rows.
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (delErr) {
      // Already deleted (retry) counts as success.
      if (/not.?found/i.test(delErr.message)) return { ok: true };
      console.error("deleteUser failed", delErr.message);
      return { ok: false, code: "delete_failed" };
    }
    return { ok: true };
}
