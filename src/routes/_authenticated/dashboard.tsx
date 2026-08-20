import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, type AppRole } from "@/hooks/useRoles";
import { useNotifications } from "@/hooks/useNotifications";
import { useLang } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_MAP } from "@/lib/categories";
import {
  Plus,
  Users,
  Clock,
  Bell,
  Search,
  Briefcase,
  Star,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
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

const RANK: Record<string, number> = {
  awarded: 1,
  in_progress: 2,
  open: 3,
  completed: 4,
  closed: 5,
};

function Dashboard() {
  const { user } = useAuth();
  const { activeRole, roles, switchRole } = useRoles();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const locale = lang === "nl" ? nl : lang === "en" ? enUS : ar;
  const ts = (s: string) => t(`status.${s}` as Parameters<typeof t>[0]);
  const { unreadCount } = useNotifications();

  const isPro = activeRole === "professional";
  const hasBoth = roles.includes("client") && roles.includes("professional");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, city")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  // ---- client data (kept mounted so switching modes keeps both datasets) ----
  const { data: requests, isLoading: loadingReq } = useQuery({
    queryKey: ["dash-requests", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*, bids!bids_request_id_fkey(count)")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: myReviews } = useQuery({
    queryKey: ["dash-reviews", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("request_id")
        .eq("client_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.request_id as string);
    },
  });

  // ---- professional data ----
  const { data: bids, isLoading: loadingBids } = useQuery({
    queryKey: ["dash-bids", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("*, requests!bids_request_id_fkey(id, title, city, status)")
        .eq("professional_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: opportunities, isLoading: loadingOpps } = useQuery({
    queryKey: ["dash-opportunities"],
    enabled: !!user?.id && isPro,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("id, title, city, category, created_at, bids!bids_request_id_fkey(count)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const reqs = (requests ?? []) as any[];
  const bidList = (bids ?? []) as any[];
  const reviewed = new Set(myReviews ?? []);
  const myBidRequestIds = new Set(bidList.map((b) => b.request_id));

  const name = (profile?.full_name || user?.email || "").split(" ")[0];

  // ---------- switcher (never grants a role) ----------
  async function setMode(role: AppRole) {
    if (role === activeRole || !roles.includes(role)) return;
    try {
      await switchRole(role);
      toast.success(t("role.switched"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {t("db.hello")}
          {name ? `، ${name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isPro ? t("db.subPro") : t("db.subClient")}
        </p>

        {hasBoth && (
          <div
            role="group"
            aria-label={t("role.mode")}
            className="mt-4 inline-flex w-full max-w-sm rounded-xl border border-border bg-card p-1 sm:w-auto"
          >
            {(["client", "professional"] as AppRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setMode(r)}
                aria-pressed={activeRole === r}
                className={
                  "min-h-11 flex-1 rounded-lg px-4 text-sm font-semibold transition sm:flex-none " +
                  (activeRole === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground")
                }
              >
                {t(`role.${r}` as never)}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Quick actions */}
      <section className="mb-6" aria-labelledby="qa-h">
        <h2 id="qa-h" className="sr-only">
          {t("db.quickActions")}
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {isPro ? (
            <>
              <QuickAction to="/requests" icon={<Briefcase className="h-4 w-4" />} label={t("db.browseOpportunities")} primary />
              <QuickAction to="/my-bids" icon={<Search className="h-4 w-4" />} label={t("db.myBids")} />
            </>
          ) : (
            <>
              <QuickAction to="/requests/new" icon={<Plus className="h-4 w-4" />} label={t("nav.newRequest")} primary />
              <QuickAction to="/services" icon={<Search className="h-4 w-4" />} label={t("db.browseServices")} />
            </>
          )}
          <QuickAction
            to="/notifications"
            icon={<Bell className="h-4 w-4" />}
            label={t("db.notifications")}
            badge={unreadCount > 0 ? (unreadCount > 99 ? "99+" : String(unreadCount)) : undefined}
          />
        </div>
      </section>

      {/* Stats */}
      <section className="mb-6" aria-labelledby="st-h">
        <h2 id="st-h" className="mb-3 text-sm font-semibold text-muted-foreground">
          {t("db.stats")}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {isPro
            ? [
                [t("db.statOpportunities"), (opportunities ?? []).length],
                [t("db.statBids"), bidList.length],
                [t("db.statAccepted"), bidList.filter((b) => b.status === "accepted").length],
                [
                  t("db.statJobsInProgress"),
                  bidList.filter((b) => b.status === "accepted" && b.requests?.status === "in_progress").length,
                ],
                [
                  t("db.statJobsDone"),
                  bidList.filter((b) => b.status === "accepted" && b.requests?.status === "completed").length,
                ],
              ].map(([l, v]) => <Stat key={l as string} label={l as string} value={v as number} />)
            : [
                [t("db.statOpen"), reqs.filter((r) => r.status === "open").length],
                [t("db.statWithBids"), reqs.filter((r) => (r.bids?.[0]?.count ?? 0) > 0).length],
                [t("db.statAwarded"), reqs.filter((r) => r.status === "awarded").length],
                [t("db.statInProgress"), reqs.filter((r) => r.status === "in_progress").length],
                [t("db.statCompleted"), reqs.filter((r) => r.status === "completed").length],
              ].map(([l, v]) => <Stat key={l as string} label={l as string} value={v as number} />)}
        </div>
      </section>

      {/* Action required */}
      <ActionRequired
        items={
          isPro
            ? [
                ...bidList
                  .filter((b) => b.status === "accepted" && b.requests?.status === "awarded")
                  .map((b) => ({
                    id: b.id,
                    icon: <PlayCircle className="h-4 w-4 text-primary" />,
                    title: b.requests?.title as string,
                    hint: t("db.arStart"),
                    to: b.request_id as string,
                  })),
                ...bidList
                  .filter((b) => b.status === "accepted" && b.requests?.status === "in_progress")
                  .map((b) => ({
                    id: b.id,
                    icon: <CheckCircle2 className="h-4 w-4 text-success" />,
                    title: b.requests?.title as string,
                    hint: t("db.arComplete"),
                    to: b.request_id as string,
                  })),
              ]
            : [
                ...reqs
                  .filter((r) => r.status === "open" && (r.bids?.[0]?.count ?? 0) > 0)
                  .map((r) => ({
                    id: r.id,
                    icon: <Users className="h-4 w-4 text-primary" />,
                    title: r.title as string,
                    hint: t("db.arNewBids"),
                    to: r.id as string,
                  })),
                ...reqs
                  .filter((r) => r.status === "completed" && !reviewed.has(r.id))
                  .map((r) => ({
                    id: r.id,
                    icon: <Star className="h-4 w-4 text-secondary" />,
                    title: r.title as string,
                    hint: t("db.arReview"),
                    to: r.id as string,
                  })),
              ]
        }
        unread={unreadCount}
        unreadLabel={t("db.arUnread")}
        title={t("db.actionRequired")}
        onNotifications={() => navigate({ to: "/notifications" })}
      />

      {/* Main list */}
      {isPro ? (
        <>
          <SectionHead title={t("db.opportunities")} to="/requests" label={t("db.viewAll")} lang={lang} />
          {loadingOpps ? (
            <Skeletons />
          ) : (opportunities ?? []).length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              {t("db.emptyOpportunities")}
            </Card>
          ) : (
            <div className="mb-8 space-y-3">
              {(opportunities ?? []).map((r: any) => (
                <RowCard
                  key={r.id}
                  id={r.id}
                  title={r.title}
                  meta={
                    <>
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_MAP[r.category] || r.category}
                      </Badge>
                      <span>{r.city}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {r.bids?.[0]?.count ?? 0} {t("db.bidsCount")}
                      </span>
                      <TimeAgo date={r.created_at} locale={locale} />
                    </>
                  }
                  cta={myBidRequestIds.has(r.id) ? t("db.ctaViewRequest") : t("db.ctaPlaceBid")}
                />
              ))}
            </div>
          )}

          <SectionHead title={t("db.myBids")} to="/my-bids" label={t("db.viewAll")} lang={lang} />
          {loadingBids ? (
            <Skeletons />
          ) : bidList.length === 0 ? (
            <EmptyState
              text={t("db.emptyPro")}
              to="/requests"
              cta={t("db.browseOpportunities")}
            />
          ) : (
            <div className="space-y-3">
              {bidList.slice(0, 6).map((b: any) => (
                <RowCard
                  key={b.id}
                  id={b.request_id}
                  title={b.requests?.title}
                  status={<Badge variant="outline" className={statusChip(b.status)}>{ts(b.status)}</Badge>}
                  meta={
                    <>
                      <span>{b.requests?.city}</span>
                      <span className="font-bold text-primary">{b.price} €</span>
                      <span>
                        {b.duration_days} {t("db.days")}
                      </span>
                      <TimeAgo date={b.created_at} locale={locale} />
                    </>
                  }
                  cta={b.status === "accepted" ? t("db.ctaFollow") : t("db.ctaViewRequest")}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <SectionHead title={t("db.myRequests")} to="/my-requests" label={t("db.viewAll")} lang={lang} />
          {loadingReq ? (
            <Skeletons />
          ) : reqs.length === 0 ? (
            <EmptyState text={t("db.emptyClient")} to="/requests/new" cta={t("nav.newRequest")} />
          ) : (
            <div className="space-y-3">
              {reqs
                .slice()
                .sort((a, b) => {
                  const ap = priority(a, reviewed);
                  const bp = priority(b, reviewed);
                  if (ap !== bp) return ap - bp;
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
                .slice(0, 6)
                .map((r: any) => (
                  <RowCard
                    key={r.id}
                    id={r.id}
                    title={r.title}
                    status={<Badge className={statusChip(r.status)}>{ts(r.status)}</Badge>}
                    meta={
                      <>
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORY_MAP[r.category] || r.category}
                        </Badge>
                        <span>{r.city}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {r.bids?.[0]?.count ?? 0} {t("db.bidsCount")}
                        </span>
                        <TimeAgo date={r.created_at} locale={locale} />
                      </>
                    }
                    cta={clientCta(r, reviewed, t)}
                  />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function priority(r: any, reviewed: Set<string>) {
  if (r.status === "open" && (r.bids?.[0]?.count ?? 0) > 0) return 0;
  if (r.status === "completed" && !reviewed.has(r.id)) return 0;
  return RANK[r.status] ?? 9;
}

function clientCta(r: any, reviewed: Set<string>, t: (k: never) => string) {
  const tr = t as unknown as (k: string) => string;
  if (r.status === "open") return (r.bids?.[0]?.count ?? 0) > 0 ? tr("db.ctaReviewBids") : tr("db.ctaFollow");
  if (r.status === "awarded") return tr("db.ctaFollow");
  if (r.status === "in_progress") return tr("db.ctaFollowWork");
  if (r.status === "completed") return reviewed.has(r.id) ? tr("db.ctaViewRequest") : tr("db.ctaRate");
  return tr("db.ctaViewRequest");
}

function statusChip(s: string) {
  if (s === "open" || s === "completed" || s === "accepted") return "bg-success/15 text-success border-success/30";
  if (s === "rejected" || s === "closed") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-primary/15 text-primary border-primary/30";
}

function TimeAgo({ date, locale }: { date: string; locale: typeof ar }) {
  return (
    <span className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      {formatDistanceToNow(new Date(date), { addSuffix: true, locale })}
    </span>
  );
}

function QuickAction({
  to,
  icon,
  label,
  primary,
  badge,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  badge?: string;
}) {
  return (
    <Button
      asChild
      variant={primary ? "default" : "outline"}
      className="h-12 w-full justify-start gap-2 text-sm font-semibold"
    >
      <Link to={to as never}>
        {icon}
        <span className="truncate">{label}</span>
        {badge && (
          <span className="ms-auto rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground">
            {badge}
          </span>
        )}
      </Link>
    </Button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="text-2xl font-extrabold text-primary">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}

function ActionRequired({
  items,
  unread,
  unreadLabel,
  title,
  onNotifications,
}: {
  items: { id: string; icon: React.ReactNode; title: string; hint: string; to: string }[];
  unread: number;
  unreadLabel: string;
  title: string;
  onNotifications: () => void;
}) {
  if (items.length === 0 && unread === 0) return null;
  return (
    <section className="mb-8" aria-labelledby="ar-h">
      <h2 id="ar-h" className="mb-3 text-sm font-semibold text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-2">
        {unread > 0 && (
          <button
            type="button"
            onClick={onNotifications}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-start transition hover:bg-accent"
          >
            <Bell className="h-4 w-4 text-primary" />
            <span className="truncate text-sm font-medium">{unreadLabel}</span>
            <span className="ms-auto rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          </button>
        )}
        {items.map((it) => (
          <Link
            key={`${it.hint}-${it.id}`}
            to="/requests/$id"
            params={{ id: it.to }}
            className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:bg-accent"
          >
            {it.icon}
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{it.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{it.hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHead({
  title,
  to,
  label,
  lang,
}: {
  title: string;
  to: string;
  label: string;
  lang: string;
}) {
  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold">{title}</h2>
      <Link
        to={to as never}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-primary hover:underline"
      >
        {label}
        <Arrow className="h-4 w-4" />
      </Link>
    </div>
  );
}

function RowCard({
  id,
  title,
  meta,
  status,
  cta,
}: {
  id: string;
  title: string;
  meta: React.ReactNode;
  status?: React.ReactNode;
  cta: string;
}) {
  return (
    <Link
      to="/requests/$id"
      params={{ id }}
      className="block rounded-xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate text-base font-bold">{title}</h3>
        {status}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {meta}
      </div>
      <div className="mt-3 text-sm font-semibold text-primary">{cta} ←</div>
    </Link>
  );
}

function EmptyState({ text, to, cta }: { text: string; to: string; cta: string }) {
  return (
    <Card className="p-10 text-center">
      <h3 className="font-semibold">{text}</h3>
      <Button asChild size="sm" className="mt-4">
        <Link to={to as never}>{cta}</Link>
      </Button>
    </Card>
  );
}

function Skeletons() {
  return (
    <div className="mb-8 space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
