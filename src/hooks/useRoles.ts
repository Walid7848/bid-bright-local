import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "client" | "professional";

const STORAGE_KEY = "active_role";

/**
 * Users may hold BOTH roles (client + professional) and freely switch
 * between them. `activeRole` is the mode the UI currently renders.
 */
export function useRoles() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [stored, setStored] = useState<AppRole | null>(null);

  useEffect(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (v === "client" || v === "professional") setStored(v);
  }, []);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      return (data ?? [])
        .map((r) => r.role as string)
        .filter((r): r is AppRole => r === "client" || r === "professional");
    },
  });

  const activeRole: AppRole | null =
    stored && roles.includes(stored) ? stored : (roles[0] ?? null);

  const hasRole = useCallback((r: AppRole) => roles.includes(r), [roles]);

  const switchRole = useCallback(
    async (role: AppRole) => {
      if (!user) return;
      if (!roles.includes(role)) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role });
        if (error && !/duplicate/i.test(error.message)) throw error;
      }
      if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, role);
      setStored(role);
      await qc.invalidateQueries();
    },
    [user, roles, qc],
  );

  return {
    roles,
    activeRole,
    isClient: activeRole === "client",
    isPro: activeRole === "professional",
    hasRole,
    switchRole,
    loading: isLoading,
  };
}
