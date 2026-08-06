import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { useLang } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CATEGORY_MAP } from "@/lib/categories";
import { Plus, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, nl, enUS } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحتي — طلباتي وعروضي | Wasla" },
      {
        name: "description",
        content:
          "تابع طلباتك كزبون وعروضك كمقدم خدمة في لوحة واحدة مع فلاتر حسب الحالة.",
      },
      { property: "og:title", content: "لوحتي — طلباتي وعروضي | Wasla" },
      {
        property: "og:description",
        content: "طلباتي وعروضي في لوحة واحدة مع فلاتر حسب الحالة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const REQ_STATUSES = ["open", "awarded", "in_progress", "completed", "closed"] as const;
const BID_STATUSES = ["pending", "accepted", "rejected"] as const;

function Dashboard() {
  const { user } = useAuth();
  const { hasRole, activeRole } = useRoles();
  const { t, lang } = useLang();
  const locale = lang === "nl" ? nl : lang === "en" ? enUS : ar;
  const ts = (s: string) => t(`status.${s}` as Parameters<typeof t>[0]);

  const [tab, setTab] = useState<string>(activeRole === "professional" ? "bids" : "requests");
  const [reqStatus, setReqStatus] = useState<string>("all");
  const [bidStatus, setBidStatus] = useState<string>("all");

  const { data: requests, isLoading: loadingReq } = useQuery({
    queryKey: ["dash-requests", user?.id],
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

  const { data: bids, isLoading: loadingBids } = useQuery({
    queryKey: ["dash-bids", user?.id],
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

  const filteredRequests = (requests ?? []).filter(
    (r: any) => reqStatus === "all" || r.status === reqStatus,
  );
  const filteredBids = (bids ?? []).filter(
    (b: any) => bidStatus === "all" || b.status === bidStatus,
  );

  const countReq = (s: string) =>
    s === "all" ? (requests ?? []).length : (requests ?? []).filter((r: any) => r.status === s).length;
  const countBid = (s: string) =>
    s === "all" ? (bids ?? []).length : (bids ?? []).filter((b: any) => b.status === s).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t("dash.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("dash.subtitle")}</p>
        </div>
        <Button asChild size="sm" className="gap-1">
          <Link to="/requests/new">
            <Plus className="h-4 w-4" /> {t("nav.newRequest")}
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5">
          <TabsTrigger value="requests">
            {t("nav.myRequests")} ({(requests ?? []).length})
          </TabsTrigger>
          <TabsTrigger value="bids">
            {t("nav.myBids")} ({(bids ?? []).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <FilterChips
            value={reqStatus}
            onChange={setReqStatus}
            options={["all", ...REQ_STATUSES]}
            label={(s) => ts(s)}
            count={countReq}
          />
          {loadingReq ? (
            <Skeletons />
          ) : filteredRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="font-semibold">{t("dash.noRequests")}</h3>
              {!hasRole("client") && (
                <p className="mt-1 text-sm text-muted-foreground">{t("dash.needClient")}</p>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((r: any) => (
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
                          {r.bids?.[0]?.count ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(r.created_at), {
                            addSuffix: true,
                            locale,
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={
                        r.status === "open"
                          ? "bg-success/15 text-success"
                          : r.status === "completed"
                            ? "bg-success/15 text-success"
                            : r.status === "closed"
                              ? ""
                              : "bg-primary/15 text-primary"
                      }
                    >
                      {ts(r.status)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bids">
          <FilterChips
            value={bidStatus}
            onChange={setBidStatus}
            options={["all", ...BID_STATUSES]}
            label={(s) => ts(s)}
            count={countBid}
          />
          {loadingBids ? (
            <Skeletons />
          ) : filteredBids.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="font-semibold">{t("dash.noBids")}</h3>
              {!hasRole("professional") && (
                <p className="mt-1 text-sm text-muted-foreground">{t("dash.needPro")}</p>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBids.map((b: any) => (
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
                            locale,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-xl font-extrabold text-primary">{b.price} €</div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FilterChips({
  value,
  onChange,
  options,
  label,
  count,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  label: (s: string) => string;
  count: (s: string) => number;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {options.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={
            "rounded-full border px-3 py-1.5 text-sm font-medium transition " +
            (value === s
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground")
          }
        >
          {label(s)} ({count(s)})
        </button>
      ))}
    </div>
  );
}

function Skeletons() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
