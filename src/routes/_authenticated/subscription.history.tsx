import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/subscription/history")({
  component: SubscriptionHistoryPage,
  head: () => ({
    meta: [
      { title: "سجل الاشتراك والعروض | Shughlak" },
      {
        name: "description",
        content:
          "استعرض تاريخ اشتراكك، تجديداتك، والعروض التي قدمتها ضمن كل فترة اشتراك.",
      },
    ],
  }),
});

type TimelineEvent = {
  id: string;
  date: string;
  type: "trial_start" | "trial_end" | "renewal" | "period_end" | "status_change";
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "muted" | "success" | "warning";
};

function SubscriptionHistoryPage() {
  const { user } = useAuth();

  const subQuery = useQuery({
    queryKey: ["subscription-full", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const bidsQuery = useQuery({
    queryKey: ["my-bids-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("id, price, status, created_at, request_id, requests(title, city)")
        .eq("professional_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const sub = subQuery.data;
  const bids = bidsQuery.data ?? [];
  const loading = subQuery.isLoading || bidsQuery.isLoading;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-6 text-center">
          <div className="text-lg font-semibold">لا يوجد اشتراك بعد</div>
          <div className="mt-2 text-sm text-muted-foreground">
            يبدأ سجل الاشتراك عندما تصبح صاحب مهنة.
          </div>
          <Button asChild className="mt-4">
            <Link to="/subscription">إلى صفحة الاشتراك</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Build subscription timeline
  const now = Date.now();
  const events: TimelineEvent[] = [];

  if (sub.trial_started_at) {
    events.push({
      id: "trial-start",
      date: sub.trial_started_at,
      type: "trial_start",
      title: "بدء الفترة التجريبية المجانية",
      description: "شهران مجانيان لتقديم عروض غير محدودة",
      icon: Sparkles,
      tone: "primary",
    });
  }

  if (sub.trial_ends_at) {
    const trialEnded = new Date(sub.trial_ends_at).getTime() <= now;
    events.push({
      id: "trial-end",
      date: sub.trial_ends_at,
      type: "trial_end",
      title: trialEnded ? "انتهت الفترة التجريبية" : "تنتهي الفترة التجريبية",
      description: trialEnded
        ? "أصبح الحد عرضاً واحداً شهرياً حتى الاشتراك"
        : "متبقٍ من التجربة المجانية",
      icon: Clock,
      tone: trialEnded ? "warning" : "muted",
    });
  }

  if (sub.current_period_end) {
    events.push({
      id: "period-end",
      date: sub.current_period_end,
      type: "period_end",
      title: "نهاية دورة الاشتراك الحالية",
      description: "يتم التجديد تلقائياً في هذا التاريخ",
      icon: RefreshCw,
      tone: "primary",
    });
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group bids by month (subscription-aligned view)
  const bidsByMonth = new Map<string, typeof bids>();
  for (const b of bids) {
    const d = new Date(b.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const arr = bidsByMonth.get(key) ?? [];
    arr.push(b);
    bidsByMonth.set(key, arr);
  }
  const monthKeys = Array.from(bidsByMonth.keys()).sort().reverse();

  const trialEndMs = sub.trial_ends_at ? new Date(sub.trial_ends_at).getTime() : 0;
  const periodEndMs = sub.current_period_end
    ? new Date(sub.current_period_end).getTime()
    : 0;

  function coverageFor(dateStr: string) {
    const t = new Date(dateStr).getTime();
    if (sub!.status === "trialing" && t <= trialEndMs)
      return { label: "ضمن التجربة", tone: "primary" as const };
    if (sub!.status === "active" && (!periodEndMs || t <= periodEndMs))
      return { label: "ضمن الاشتراك المدفوع", tone: "success" as const };
    if (t <= trialEndMs) return { label: "ضمن تجربة سابقة", tone: "muted" as const };
    return { label: "خارج الاشتراك (حصة مجانية)", tone: "warning" as const };
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">سجل الاشتراك والعروض</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تاريخ بدء الاشتراك، التجديدات، والعروض المرتبطة بكل فترة.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/subscription">
            <ArrowLeft className="ml-1 h-4 w-4" />
            الاشتراك
          </Link>
        </Button>
      </div>

      {/* Summary */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <SummaryStat
            label="الحالة"
            value={
              <Badge variant={sub.status === "active" || sub.status === "trialing" ? "default" : "secondary"}>
                {sub.status}
              </Badge>
            }
          />
          <SummaryStat
            label="بدأ في"
            value={format(new Date(sub.trial_started_at), "d MMM yyyy", { locale: ar })}
          />
          <SummaryStat
            label="التجربة تنتهي"
            value={format(new Date(sub.trial_ends_at), "d MMM yyyy", { locale: ar })}
          />
          <SummaryStat
            label="إجمالي العروض"
            value={String(bids.length)}
          />
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">الجدول الزمني للاشتراك</h2>
        </div>
        <ol className="relative space-y-4 border-r border-border pr-6">
          {events.map((e) => {
            const Icon = e.icon;
            return (
              <li key={e.id} className="relative">
                <span
                  className={
                    "absolute -right-[34px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background " +
                    (e.tone === "primary"
                      ? "bg-primary/15 text-primary"
                      : e.tone === "success"
                        ? "bg-success/15 text-success"
                        : e.tone === "warning"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-muted text-muted-foreground")
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="text-sm font-semibold">{e.title}</div>
                {e.description && (
                  <div className="text-xs text-muted-foreground">{e.description}</div>
                )}
                <div className="mt-1 text-xs text-muted-foreground">
                  {format(new Date(e.date), "EEEE d MMMM yyyy", { locale: ar })}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Bids grouped by month */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">العروض المقدمة حسب الشهر</h2>
        </div>

        {monthKeys.length === 0 ? (
          <div className="rounded-md bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            لم تقدّم أي عروض بعد.
          </div>
        ) : (
          <div className="space-y-5">
            {monthKeys.map((key) => {
              const rows = bidsByMonth.get(key)!;
              const [y, m] = key.split("-").map(Number);
              const label = format(new Date(y, m - 1, 1), "MMMM yyyy", { locale: ar });
              return (
                <div key={key}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground">
                      {rows.length} عرض
                    </div>
                  </div>
                  <div className="space-y-2">
                    {rows.map((b: any) => {
                      const cov = coverageFor(b.created_at);
                      return (
                        <Link
                          key={b.id}
                          to="/requests/$id"
                          params={{ id: b.request_id }}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 transition hover:bg-accent/40"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {b.requests?.title ?? "طلب"}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>{b.requests?.city}</span>
                              <span>·</span>
                              <span>
                                {format(new Date(b.created_at), "d MMM yyyy · HH:mm", {
                                  locale: ar,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                cov.tone === "primary"
                                  ? "border-primary/40 text-primary"
                                  : cov.tone === "success"
                                    ? "border-success/40 text-success"
                                    : cov.tone === "warning"
                                      ? "border-destructive/40 text-destructive"
                                      : ""
                              }
                            >
                              {cov.label}
                            </Badge>
                            <div className="text-sm font-bold text-primary">
                              {b.price} €
                            </div>
                            {b.status === "accepted" && (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
