import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/my-bids")({
  component: MyBids,
});

function MyBids() {
  const { user } = useAuth();
  const { data: bids, isLoading } = useQuery({
    queryKey: ["my-bids", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("*, requests(id, title, city, status)")
        .eq("professional_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">عروضي</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : !bids || bids.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="font-semibold">لم تقدم أي عروض بعد</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            تصفح الطلبات المتاحة وقدّم عرضك الأول
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {bids.map((b: any) => (
            <Link
              key={b.id}
              to="/requests/$id"
              params={{ id: b.request_id }}
              className="block rounded-xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold">{b.requests?.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{b.requests?.city}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(b.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xl font-extrabold text-primary">{b.price} ر.س</div>
                  <Badge
                    variant="outline"
                    className={
                      "mt-1 text-xs " +
                      (b.status === "accepted"
                        ? "border-success text-success"
                        : b.status === "rejected"
                          ? "border-destructive text-destructive"
                          : "")
                    }
                  >
                    {b.status === "accepted"
                      ? "مقبول"
                      : b.status === "rejected"
                        ? "مرفوض"
                        : "قيد الانتظار"}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
