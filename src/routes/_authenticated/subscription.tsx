import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, Clock, Sparkles, XCircle, RotateCcw } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { formatDistanceToNow, format } from "date-fns";
import { ar, nl, enUS } from "date-fns/locale";
import { useLang } from "@/lib/i18n";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/subscription")({
  component: SubscriptionPage,
  head: () => ({
    meta: [
      { title: "اشتراك مقدمي الخدمة | Wasla — Abonnement" },
      {
        name: "description",
        content:
          "أدر اشتراكك كصاحب مهنة على وصلة: شهران مجانيان ثم اشتراك شهري لتقديم عروض غير محدودة.",
      },
      { property: "og:title", content: "اشتراك مقدمي الخدمة | Wasla" },
      {
        property: "og:description",
        content: "شهران مجانيان لكل صاحب مهنة جديد على منصة وصلة، ثم اشتراك شهري.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function SubscriptionPage() {
  const {
    subscription,
    trialActive,
    paidActive,
    isActive,
    trialDaysLeft,
    bidsThisMonth,
    remainingFree,
    canBid,
    loading,
  } = useSubscription();
  const { t, lang } = useLang();
  const dateLocale = lang === "ar" ? ar : lang === "nl" ? nl : enUS;
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const sub = subscription as (typeof subscription & {
    cancel_at_period_end?: boolean;
    canceled_at?: string | null;
  }) | null;

  const effectiveEnd = sub
    ? trialActive
      ? sub.trial_ends_at
      : sub.current_period_end ?? sub.trial_ends_at
    : null;

  async function setCancel(flag: boolean) {
    if (!sub) return;
    setBusy(true);
    const { error } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: flag,
        canceled_at: flag ? new Date().toISOString() : null,
      })
      .eq("id", sub.id);
    setBusy(false);
    if (error) {
      toast.error(t("sub.updateError"));
      return;
    }
    toast.success(flag ? t("sub.cancelScheduled") : t("sub.resumed"));
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
  }


  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-muted-foreground">
        {t("sub.loading")}
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-6 text-center">
          <div className="text-lg font-semibold">{t("sub.clientFreeTitle")}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {t("sub.clientFreeBody")}
          </div>
          <Button asChild className="mt-4">
            <Link to="/profile">{t("sub.toProfile")}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("sub.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("sub.subtitle")}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/subscription/history">{t("sub.history")}</Link>
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase text-muted-foreground">{t("sub.currentStatus")}</div>
            <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
              {trialActive && (
                <>
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t("sub.trialActive")}
                </>
              )}
              {paidActive && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {t("sub.paidActive")}
                </>
              )}
              {!isActive && (
                <>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  {t("sub.trialEnded")}
                </>
              )}
            </div>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {subscription.status}
          </Badge>
        </div>

        {trialActive && (
          <div className="mt-4 rounded-md bg-muted/50 p-4 text-sm">
            <div>
              <span className="font-semibold">{trialDaysLeft}</span> {t("sub.daysLeft")}
            </div>
            <div className="mt-1 text-muted-foreground">
              {t("sub.endsIn")}{" "}
              {formatDistanceToNow(new Date(subscription.trial_ends_at), {
                addSuffix: true,
                locale: dateLocale,
              })}
              .
            </div>
          </div>
        )}

        {!isActive && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
            {t("sub.limitNotice")}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">{t("sub.bidsThisMonth")}</div>
            <div className="mt-1 text-lg font-semibold">{bidsThisMonth}</div>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">
              {isActive ? t("sub.unlimited") : t("sub.remainingFree")}
            </div>
            <div className="mt-1 text-lg font-semibold">
              {isActive ? "∞" : `${remainingFree}/1`}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-lg font-semibold">{t("sub.plan")}</div>
        <div className="mt-4 space-y-3">
          <PlanFeature text={t("sub.feat1")} />
          <PlanFeature text={t("sub.feat2")} />
          <PlanFeature text={t("sub.feat3")} />
          <PlanFeature text={t("sub.feat4")} />
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold">{t("sub.soon")}</div>
            <div className="text-xs text-muted-foreground">
              {t("sub.soonHint")}
            </div>
          </div>
          <Button disabled title={t("sub.soonHint")}>
            {canBid && isActive ? t("sub.subscribed") : t("sub.subscribe")}
          </Button>
        </div>
      </Card>

      {isActive && (
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">{t("sub.cancelTitle")}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("sub.cancelBody")}
              </p>
              {effectiveEnd && (
                <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
                  <div className="text-xs text-muted-foreground">
                    {trialActive ? t("sub.trialEndDate") : t("sub.periodEndDate")}
                  </div>
                  <div className="mt-1 font-semibold">
                    {format(new Date(effectiveEnd), "EEEE d MMMM yyyy", { locale: dateLocale })}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t("sub.effectiveAfter")}
                  </div>
                </div>
              )}
              {sub?.cancel_at_period_end && sub.canceled_at && (
                <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                  {t("sub.canceledOn")}{" "}
                  {format(new Date(sub.canceled_at), "d MMM yyyy", { locale: dateLocale })}. {t("sub.noRenew")}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            {sub?.cancel_at_period_end ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setCancel(false)}
              >
                <RotateCcw className="ml-1 h-4 w-4" />
                {t("sub.resume")}
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={busy}>
                    <XCircle className="ml-1 h-4 w-4" />
                    {t("sub.cancelTitle")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("sub.confirmCancel")}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-2 text-sm">
                        <p>
                          {t("sub.activeUntil")}{" "}
                          <span className="font-semibold text-foreground">
                            {effectiveEnd
                              ? format(new Date(effectiveEnd), "d MMMM yyyy", {
                                  locale: dateLocale,
                                })
                              : t("sub.periodEndFallback")}
                          </span>
                          .
                        </p>
                        <p>
                          {t("sub.cancelExplain")}
                        </p>
                        <p>{t("sub.resumeAnytime")}</p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("sub.back")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => setCancel(true)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("sub.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function PlanFeature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{text}</span>
    </div>
  );
}
