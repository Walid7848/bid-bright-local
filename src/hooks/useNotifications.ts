import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type NotificationType =
  | "bid_received"
  | "bid_accepted"
  | "bid_rejected"
  | "request_started"
  | "request_completed"
  | "review_reminder";

export type AppNotification = {
  id: string;
  type: NotificationType;
  actor_id: string | null;
  request_id: string | null;
  bid_id: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

const LIMIT = 30;

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;

  const listQuery = useQuery({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<AppNotification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, actor_id, request_id, bid_id, metadata, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(LIMIT);
      if (error) throw error;
      return (data ?? []) as unknown as AppNotification[];
    },
  });

  const unreadQuery = useQuery({
    queryKey: ["notifications-unread", userId],
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      if (error) throw error;
      return count ?? 0;
    },
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["notifications", userId] });
    qc.invalidateQueries({ queryKey: ["notifications-unread", userId] });
  }

  const markOne = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const notifications = (listQuery.data ?? []).slice().sort((a, b) => {
    const au = a.read_at ? 1 : 0;
    const bu = b.read_at ? 1 : 0;
    if (au !== bu) return au - bu;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return {
    notifications,
    unreadCount: unreadQuery.data ?? 0,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: () => {
      listQuery.refetch();
      unreadQuery.refetch();
    },
    markAsRead: (id: string) => markOne.mutate(id),
    markAllAsRead: () => markAll.mutate(),
    isMarkingAll: markAll.isPending,
    refresh: invalidate,
  };
}
