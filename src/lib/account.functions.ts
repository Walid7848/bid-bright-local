import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; code: "reauth" | "active_work" | "storage_failed" | "delete_failed" };

// Deletes the CURRENT user's account. Takes no input: the user id comes only
// from the verified session token, never from the browser.
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DeleteAccountResult> => {
    const { userId, claims } = context as unknown as {
      userId: string;
      claims: { amr?: { method: string; timestamp: number }[] };
    };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { deleteAccountCore } = await import("./account.server");
    return deleteAccountCore(supabaseAdmin, userId, claims);
  });
