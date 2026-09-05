import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { RoleGate } from "@/components/RoleGate";
import { QueryError } from "@/components/QueryError";
import { logQueryError } from "@/lib/query-log";
import { formatDistanceToNow } from "date-fns";
import { ar, nl, enUS } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/my-bids")({
  head: () => ({
    meta: [
      { title: "عروضي | وصلة — Mijn offertes" },
      {
        name: "description",
        content:
          "تابع كل العروض التي قدّمتها على طلبات العملاء في هولندا وحالتها: قيد الانتظار، مقبول أو مرفوض.",
      },
      { property: "og:title", content: "عروضي | وصلة" },
      {
        property: "og:description",
        content: "كل عروضك المقدّمة على منصة وصلة وحالتها في مكان واحد.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyBids,
});

function MyBids() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const locale = lang === "nl" ? nl : lang === "en" ? enUS : ar;
  const ts = (s: string) => t(`status.${s}` as Parameters<typeof t>[0]);

  const { data: bids, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-bids", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("*, requests!bids_request_id_fkey(id, title, city, status)")
        .eq("professional_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) {
        logQueryError("my-bids", error);
        throw error;
      }
      return data;
    },
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t("mb.title")}</h1>
      <RoleGate role="professional">
        <>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : isError ? (
            <QueryError onRetry={() => refetch()} />
          ) : !bids || bids.length === 0 ? (
            <Card className="p-8 text-center sm:p-12">
              <h3 className="font-semibold">{t("mb.emptyTitle")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("mb.emptyDesc")}</p>
              <Button asChild className="mt-4 h-11">
                <Link to="/requests">{t("mb.browse")}</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {bids.map((b: any) => (
                <Link
                  key={b.id}
                  to="/requests/$id"
                  params={{ id: b.request_id }}
                  className="block rounded-xl border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-base font-bold">{b.requests?.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{b.requests?.city}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          {formatDistanceToNow(new Date(b.created_at), {
                            addSuffix: true,
                            locale,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-start">
                      <div className="text-xl font-extrabold text-primary" dir="ltr">
                        {b.price} €
                      </div>
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
                        {ts(b.status)}
                      </Badge>
                    </div>
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
