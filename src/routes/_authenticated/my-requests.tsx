import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_MAP } from "@/lib/categories";
import { Plus, Users } from "lucide-react";
import { RoleGate } from "@/components/RoleGate";

export const Route = createFileRoute("/_authenticated/my-requests")({
  component: MyRequests,
});

function MyRequests() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useQuery({
    queryKey: ["my-requests", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*, bids(count)")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">طلباتي</h1>
        <Button asChild size="sm" className="gap-1">
          <Link to="/requests/new">
            <Plus className="h-4 w-4" /> طلب جديد
          </Link>
        </Button>
      </div>

      <RoleGate role="client">
      <>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="font-semibold">لا توجد طلبات بعد</h3>
          <p className="mt-1 text-sm text-muted-foreground">ابدأ بنشر أول طلب لك</p>
          <Button asChild className="mt-4">
            <Link to="/requests/new">إنشاء طلب</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <Link
              key={r.id}
              to="/requests/$id"
              params={{ id: r.id }}
              className="block rounded-xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">{r.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_MAP[r.category] || r.category}
                    </Badge>
                    <span>{r.city}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {r.bids?.[0]?.count ?? 0} عرض
                    </span>
                  </div>
                </div>
                <Badge
                  className={
                    r.status === "open"
                      ? "bg-success/15 text-success"
                      : r.status === "awarded"
                        ? "bg-primary/15 text-primary"
                        : ""
                  }
                >
                  {r.status === "open" ? "مفتوح" : r.status === "awarded" ? "تم الاختيار" : "مغلق"}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
      </>
      </RoleGate>
    </div>
  );
}
