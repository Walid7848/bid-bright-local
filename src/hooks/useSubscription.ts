import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "expired";
  trial_started_at: string;
  trial_ends_at: string;
  current_period_end: string | null;
};

export function useSubscription() {
  const { user } = useAuth();

  const subQuery = useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as SubscriptionRow | null;
    },
  });

  const bidCountQuery = useQuery({
    queryKey: ["bids-this-month", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const start = new Date();
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("bids")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user!.id)
        .gte("created_at", start.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
  });

  const sub = subQuery.data ?? null;
  const now = Date.now();
  const trialActive =
    !!sub && sub.status === "trialing" && new Date(sub.trial_ends_at).getTime() > now;
  const paidActive =
    !!sub &&
    sub.status === "active" &&
    (!sub.current_period_end || new Date(sub.current_period_end).getTime() > now);
  const isActive = trialActive || paidActive;

  const bidsThisMonth = bidCountQuery.data ?? 0;
  const monthlyFreeLimit = 1;
  const canBid = isActive || bidsThisMonth < monthlyFreeLimit;
  const remainingFree = Math.max(0, monthlyFreeLimit - bidsThisMonth);

  const trialDaysLeft = sub
    ? Math.max(
        0,
        Math.ceil((new Date(sub.trial_ends_at).getTime() - now) / (1000 * 60 * 60 * 24)),
      )
    : 0;

  return {
    subscription: sub,
    loading: subQuery.isLoading || bidCountQuery.isLoading,
    trialActive,
    paidActive,
    isActive,
    bidsThisMonth,
    remainingFree,
    canBid,
    trialDaysLeft,
  };
}
