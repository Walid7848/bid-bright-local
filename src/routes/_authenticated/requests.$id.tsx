import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { categoryLabel } from "@/lib/service-search";
import { useLang } from "@/lib/i18n";
import { SignedImage } from "@/components/SignedImage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ReviewSection } from "@/components/ReviewSection";
import { RoleGate } from "@/components/RoleGate";
import {
  BidComparison,
  BidFacts,
  RatingInline,
  useBidStats,
  type BidStats,
} from "@/components/BidComparison";

import { useSubscription as useSubscriptionGate } from "@/hooks/useSubscription";
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
import {
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Loader2,
  Trash2,
  MessageSquare,
  Calendar,
  Wallet,
  ChevronLeft,
  ChevronRight,
  X,
  Inbox,
  Check,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ar as arLocale, nl as nlLocale, enUS } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/requests/$id")({
  component: RequestDetail,
});

type Status = "open" | "awarded" | "in_progress" | "completed" | "closed";

const STATUS_STYLE: Record<Status, string> = {
  open: "bg-success/15 text-success hover:bg-success/20",
  awarded: "bg-primary/15 text-primary hover:bg-primary/20",
  in_progress: "bg-primary/15 text-primary hover:bg-primary/20",
  completed: "bg-success/15 text-success hover:bg-success/20",
  closed: "bg-destructive/10 text-destructive hover:bg-destructive/15",
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useLang();
  const s = (status as Status) ?? "open";
  const key = (`status.${s}` as const) satisfies
    | "status.open"
    | "status.awarded"
    | "status.in_progress"
    | "status.completed"
    | "status.closed";
  return <Badge className={STATUS_STYLE[s] ?? ""}>{t(key)}</Badge>;
}

function useDateLocale() {
  const { lang } = useLang();
  return lang === "ar" ? arLocale : lang === "nl" ? nlLocale : enUS;
}

function Timeline({ status }: { status: string }) {
  const { t } = useLang();
  const closed = status === "closed";
  const order: Status[] = ["open", "awarded", "in_progress", "completed"];
  const idx = order.indexOf(status as Status);

  const steps = closed
    ? [
        { label: t("rd.tl.created"), state: "done" as const },
        { label: t("rd.tl.published"), state: "done" as const },
        { label: t("rd.tl.closed"), state: "closed" as const },
      ]
    : [
        { label: t("rd.tl.created"), state: "done" as const },
        { label: t("rd.tl.published"), state: "done" as const },
        {
          label: t("rd.tl.receiving"),
          state: idx > 0 ? ("done" as const) : ("current" as const),
        },
        {
          label: t("rd.tl.selected"),
          state: idx > 1 ? ("done" as const) : idx === 1 ? ("current" as const) : ("todo" as const),
        },
        {
          label: t("rd.tl.execution"),
          state: idx > 2 ? ("done" as const) : idx === 2 ? ("current" as const) : ("todo" as const),
        },
        {
          label: t("rd.tl.completed"),
          state: idx === 3 ? ("current" as const) : ("todo" as const),
        },
      ];

  return (
    <ol className="space-y-0" aria-label={t("rd.progress")}>
      {steps.map((s, i) => (
        <li key={s.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              aria-hidden
              className={
                "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] " +
                (s.state === "done"
                  ? "border-success bg-success text-success-foreground"
                  : s.state === "current"
                    ? "border-primary bg-primary/10 text-primary"
                    : s.state === "closed"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border bg-muted text-muted-foreground")
              }
            >
              {s.state === "done" ? (
                <Check className="h-3.5 w-3.5" />
              ) : s.state === "current" ? (
                <span className="h-2 w-2 rounded-full bg-primary" />
              ) : s.state === "closed" ? (
                <X className="h-3.5 w-3.5" />
              ) : null}
            </span>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={
                  "my-1 w-px flex-1 " + (s.state === "done" ? "bg-success/40" : "bg-border")
                }
              />
            )}
          </div>
          <span
            className={
              "pb-4 text-sm " +
              (s.state === "todo" ? "text-muted-foreground" : "font-medium text-foreground")
            }
          >
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="space-y-4 p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </Card>
          <Card className="space-y-3 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-20 w-full" />
          </Card>
        </div>
        <Skeleton className="hidden h-72 rounded-2xl lg:block" />
      </div>
    </div>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const { t } = useLang();
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex((index! + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index! - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, images.length, onIndex]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl border-0 bg-background/95 p-3 sm:p-4">
        <DialogTitle className="sr-only">{t("rd.photos")}</DialogTitle>
        {index !== null && (
          <div className="space-y-3">
            <SignedImage
              path={images[index]}
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
            {images.length > 1 && (
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  aria-label={t("rd.prevPhoto")}
                  onClick={() => onIndex((index - 1 + images.length) % images.length)}
                >
                  <ChevronRight className="h-5 w-5 rtl:hidden" />
                  <ChevronLeft className="hidden h-5 w-5 rtl:block" />
                </Button>
                <span className="text-xs text-muted-foreground" dir="ltr">
                  {index + 1} / {images.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  aria-label={t("rd.nextPhoto")}
                  onClick={() => onIndex((index + 1) % images.length)}
                >
                  <ChevronLeft className="h-5 w-5 rtl:hidden" />
                  <ChevronRight className="hidden h-5 w-5 rtl:block" />
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RequestDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const dateLocale = useDateLocale();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*, profiles!requests_client_profile_fkey(full_name, phone, city)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { isClient } = useRoles();

  const { data: bids } = useQuery({
    queryKey: ["bids", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select(
          "*, profiles!bids_professional_profile_fkey(full_name, city, phone, profession, bio, avatar_url)",
        )
        .eq("request_id", id)
        .order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const stats = useBidStats(bids ?? undefined);
  const [pendingBid, setPendingBid] = useState<any | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [justAccepted, setJustAccepted] = useState(false);


  if (isLoading) return <PageSkeleton />;

  if (!request) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-bold">{t("rd.notFound")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("rd.notFoundDesc")}</p>
        <Button asChild className="mt-6">
          <Link to="/my-requests">{t("rd.backToMyRequests")}</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === request.client_id;
  const canBidSlot = request.status === "open" && !isOwner;
  const myBid = bids?.find((b: any) => b.professional_id === user?.id);
  const acceptedBid = bids?.find((b: any) => b.status === "accepted");
  const images: string[] = request.images ?? [];
  const bidCount = bids?.length ?? 0;
  const showReview =
    (request.status === "awarded" ||
      request.status === "in_progress" ||
      request.status === "completed") &&
    !!acceptedBid;

  async function deleteRequest() {
    const { error } = await supabase.from("requests").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم حذف الطلب");
    navigate({ to: "/my-requests" });
  }

  async function acceptBid(bidId: string) {
    if (!isOwner || !isClient) {
      return toast.error("هذا الإجراء متاح لصاحب الطلب في وضع «طالب خدمة» فقط");
    }
    const { error } = await supabase.rpc("accept_bid", {
      _request_id: id,
      _bid_id: bidId,
    });
    if (error) return toast.error(error.message);

    toast.success("تم قبول العرض");
    qc.invalidateQueries({ queryKey: ["request", id] });
    qc.invalidateQueries({ queryKey: ["bids", id] });
  }

  function scrollTo(anchor: string) {
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // CTA derived only from statuses that already exist in the system
  const cta: { label: string; onClick?: () => void; variant: "cta" | "muted" } =
    request.status === "closed"
      ? { label: t("rd.cta.closed"), variant: "muted" }
      : request.status === "completed"
        ? showReview
          ? { label: t("rd.cta.rate"), onClick: () => scrollTo("review"), variant: "cta" }
          : { label: t("rd.cta.closed"), variant: "muted" }
        : request.status === "awarded" || request.status === "in_progress"
          ? { label: t("rd.cta.progress"), onClick: () => scrollTo("bids"), variant: "cta" }
          : bidCount > 0
            ? { label: t("rd.cta.review"), onClick: () => scrollTo("bids"), variant: "cta" }
            : { label: t("rd.cta.waiting"), variant: "muted" };

  const CtaButton = ({ className = "" }: { className?: string }) =>
    cta.variant === "cta" ? (
      <Button
        variant="cta"
        className={"h-11 w-full " + className}
        onClick={cta.onClick}
      >
        {cta.label}
      </Button>
    ) : (
      <div
        className={
          "flex h-11 w-full items-center justify-center rounded-xl bg-muted px-4 text-sm font-medium text-muted-foreground " +
          className
        }
      >
        {cta.label}
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-28 lg:py-8 lg:pb-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <Card className="p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {categoryLabel(request.category, lang)}
                  </Badge>
                  <StatusBadge status={request.status} />
                </div>
                <h1 className="mt-2 break-words text-xl font-bold sm:text-2xl">{request.title}</h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {request.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {request.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(new Date(request.created_at), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </span>
                </div>
              </div>
              {isOwner && isClient && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-11 gap-1 text-destructive">
                      <Trash2 className="h-4 w-4" /> {t("rd.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>حذف الطلب؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيتم حذف الطلب وكل العروض المرتبطة به.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteRequest}>حذف</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="mt-4 lg:hidden">
              <CtaButton />
            </div>
          </Card>

          {/* Details */}
          <Card className="p-5 shadow-soft sm:p-6">
            <h2 className="text-lg font-bold">{t("rd.details")}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">{t("rd.serviceType")}</dt>
                <dd className="mt-0.5 text-sm font-medium">
                  {categoryLabel(request.category, lang)}
                </dd>
              </div>
              {request.city && (
                <div>
                  <dt className="text-xs text-muted-foreground">{t("rd.city")}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{request.city}</dd>
                </div>
              )}
              {(request.budget_min || request.budget_max) && (
                <div>
                  <dt className="text-xs text-muted-foreground">{t("rd.budget")}</dt>
                  <dd className="mt-0.5 flex items-center gap-1 text-sm font-medium" dir="ltr">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    {request.budget_min || 0} – {request.budget_max || "?"} €
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">{t("rd.createdAt")}</dt>
                <dd className="mt-0.5 flex items-center gap-1 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(request.created_at), "d MMM yyyy", { locale: dateLocale })}
                </dd>
              </div>
            </dl>
            <Separator className="my-4" />
            <div>
              <div className="text-xs text-muted-foreground">{t("rd.description")}</div>
              <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
                {request.description}
              </p>
            </div>
          </Card>

          {/* Photos */}
          {images.length > 0 && (
            <Card className="p-5 shadow-soft sm:p-6">
              <h2 className="text-lg font-bold">{t("rd.photos")}</h2>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((p, i) => (
                  <button
                    key={p}
                    type="button"
                    aria-label={t("rd.openPhoto")}
                    onClick={() => setLightbox(i)}
                    className="overflow-hidden rounded-xl border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <SignedImage
                      path={p}
                      className="aspect-square w-full object-cover transition hover:scale-[1.03]"
                    />
                  </button>
                ))}
              </div>
            </Card>
          )}

          {isOwner && bids && bids.length > 1 && request.status === "open" && (
            <BidComparison
              bids={bids}
              scores={scores}
              canSelect={isOwner && isClient}
              onAccept={acceptBid}
            />
          )}

          {/* Bids */}
          <div id="bids" className="scroll-mt-24">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold">
                {t("rd.bids")}{" "}
                <span className="text-muted-foreground">
                  ({bidCount} {t("rd.bidsCount")})
                </span>
              </h2>
              {bidCount > 0 && (
                <span className="text-xs text-muted-foreground">{t("rd.sortedByPrice")}</span>
              )}
            </div>
            {bidCount === 0 ? (
              <Card className="p-8 text-center shadow-soft">
                <Inbox className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <div className="mt-3 font-semibold">{t("rd.noBidsTitle")}</div>
                <p className="mt-1 text-sm text-muted-foreground">{t("rd.noBidsDesc")}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {bids!.map((b: any) => (
                  <BidCard
                    key={b.id}
                    bid={b}
                    scored={scores[b.id]}
                    isOwner={isOwner}
                    canSelect={isOwner && isClient && request.status === "open"}
                    isAccepted={b.status === "accepted"}
                    onAccept={() => acceptBid(b.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Timeline (mobile order: after bids) */}
          <Card className="p-5 shadow-soft sm:p-6 lg:hidden">
            <h2 className="mb-4 text-lg font-bold">{t("rd.progress")}</h2>
            <Timeline status={request.status} />
          </Card>

          {showReview && (
            <div id="review" className="scroll-mt-24">
              <ReviewSection
                requestId={id}
                clientId={request.client_id}
                professionalId={acceptedBid!.professional_id}
                isOwner={isOwner}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5 shadow-soft">
            <div className="text-xs font-medium uppercase text-muted-foreground">
              {t("rd.statusTitle")}
            </div>
            <div className="mt-2">
              <StatusBadge status={request.status} />
            </div>
            <div className="mt-4 hidden lg:block">
              <CtaButton />
            </div>
            <Separator className="my-4" />
            <div className="text-xs font-medium uppercase text-muted-foreground">
              {t("rd.summary")}
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{t("rd.serviceType")}</span>
                <span className="font-medium">{categoryLabel(request.category, lang)}</span>
              </li>
              {request.city && (
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t("rd.city")}</span>
                  <span className="font-medium">{request.city}</span>
                </li>
              )}
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{t("rd.bids")}</span>
                <span className="font-medium">{bidCount}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{t("rd.createdAt")}</span>
                <span className="font-medium">
                  {format(new Date(request.created_at), "d MMM yyyy", { locale: dateLocale })}
                </span>
              </li>
            </ul>
          </Card>

          <Card className="hidden p-5 shadow-soft lg:block">
            <div className="mb-4 text-xs font-medium uppercase text-muted-foreground">
              {t("rd.progress")}
            </div>
            <Timeline status={request.status} />
          </Card>

          <Card className="p-5 shadow-soft">
            <div className="text-xs font-medium uppercase text-muted-foreground">
              {t("rd.client")}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {(request.profiles?.full_name || "؟").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-semibold">
                  {request.profiles?.full_name || t("rd.client")}
                </div>
                <div className="text-xs text-muted-foreground">{request.profiles?.city}</div>
              </div>
            </div>
            {acceptedBid &&
              (isOwner || acceptedBid.professional_id === user?.id) &&
              request.profiles?.phone && (
                <a
                  href={`tel:${request.profiles.phone}`}
                  className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-success/10 text-sm font-medium text-success hover:bg-success/15"
                  dir="ltr"
                >
                  <Phone className="h-4 w-4" />
                  {request.profiles.phone}
                </a>
              )}
          </Card>

          {canBidSlot && !myBid && (
            <RoleGate role="professional" compact>
              <BidForm
                requestId={id}
                budgetMin={request.budget_min}
                budgetMax={request.budget_max}
              />
            </RoleGate>
          )}
          {myBid && (
            <Card className="border-success/40 bg-success/5 p-5 shadow-soft">
              <div className="flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" />
                {t("bf.alreadyTitle")}
              </div>
              <div className="mt-3 text-xs font-medium uppercase text-muted-foreground">
                {t("bf.myOffer")}
              </div>
              <div className="mt-2 text-2xl font-bold text-primary">{myBid.price} €</div>
              <div className="text-sm text-muted-foreground">
                {myBid.duration_days} {t("rd.days")}
              </div>
              <Badge
                variant="outline"
                className={
                  "mt-3 " +
                  (myBid.status === "accepted"
                    ? "border-success text-success"
                    : myBid.status === "rejected"
                      ? "border-destructive text-destructive"
                      : "")
                }
              >
                {myBid.status === "accepted"
                  ? t("status.accepted")
                  : myBid.status === "rejected"
                    ? t("status.rejected")
                    : t("status.pending")}
              </Badge>
            </Card>
          )}
        </aside>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-5xl">
          <CtaButton />
        </div>
      </div>

      <Lightbox
        images={images}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
      />
    </div>
  );
}

function BidCard({
  bid,
  scored,
  isOwner,
  canSelect,
  isAccepted,
  onAccept,
}: {
  bid: any;
  scored?: ScoredBid;
  isOwner: boolean;
  canSelect: boolean;
  isAccepted: boolean;
  onAccept: () => void;
}) {
  const { t, lang } = useLang();
  const dateLocale = useDateLocale();
  return (
    <Card
      className={
        "p-5 transition " +
        (isAccepted
          ? "border-success bg-success/5 shadow-glow"
          : bid.status === "rejected"
            ? "opacity-60"
            : "shadow-soft hover:shadow-elegant")
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-11 w-11">
            {bid.profiles?.avatar_url && (
              <AvatarImage src={bid.profiles.avatar_url} alt={bid.profiles?.full_name ?? ""} />
            )}
            <AvatarFallback className="bg-gradient-primary text-sm text-primary-foreground">
              {(bid.profiles?.full_name || "؟").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-semibold">
              {bid.profiles?.full_name || t("rd.viewProfile")}
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
              {bid.profiles?.profession && (
                <span>{categoryLabel(bid.profiles.profession, lang)}</span>
              )}
              {bid.profiles?.city && <span>· {bid.profiles.city}</span>}
              <span>
                ·{" "}
                {formatDistanceToNow(new Date(bid.created_at), {
                  addSuffix: true,
                  locale: dateLocale,
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="text-start" dir="ltr">
          <div className="text-2xl font-extrabold text-primary">{bid.price} €</div>
          <div className="text-xs text-muted-foreground">
            <Clock className="mr-1 inline h-3 w-3" />
            {bid.duration_days} {t("rd.days")}
          </div>
        </div>
      </div>
      {scored && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <BidScoreBadges scored={scored} />
          {scored.stats.rating !== null && (
            <span className="text-xs text-muted-foreground">
              {scored.stats.rating.toFixed(1)} ★
            </span>
          )}
        </div>
      )}
      {bid.profiles?.bio && (
        <p className="mt-3 line-clamp-3 text-xs text-muted-foreground">{bid.profiles.bio}</p>
      )}
      {bid.message && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="whitespace-pre-wrap break-words">{bid.message}</span>
        </div>
      )}
      {isAccepted && bid.profiles?.phone && isOwner && (
        <a
          href={`tel:${bid.profiles.phone}`}
          className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-success/10 text-sm font-semibold text-success"
          dir="ltr"
        >
          <Phone className="h-4 w-4" />
          {bid.profiles.phone}
        </a>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" className="h-11 flex-1">
          <Link to="/providers/$id" params={{ id: bid.professional_id }}>
            {t("rd.viewProfile")}
          </Link>
        </Button>
        {canSelect && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="cta" className="h-11 flex-1 gap-1">
                <CheckCircle2 className="h-4 w-4" /> {t("rd.selectBid")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد اختيار العرض</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم إغلاق الطلب ورفض العروض الأخرى، وسيصلك رقم صاحب المهنة للتواصل.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={onAccept}>تأكيد</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </Card>
  );
}

function BidForm({
  requestId,
  budgetMin,
  budgetMax,
}: {
  requestId: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { t } = useLang();
  const {
    canBid,
    isActive,
    trialActive,
    trialDaysLeft,
    bidsThisMonth,
    remainingFree,
    loading: subLoading,
  } = useSubscriptionGate();
  const [price, setPrice] = useState("");
  const [days, setDays] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ price?: string; days?: string; message?: string }>({});

  const MAX_MESSAGE = 500;
  const hasBudget = !!(budgetMin || budgetMax);
  const budgetText = hasBudget
    ? budgetMax && budgetMin
      ? `€${budgetMin} – €${budgetMax}`
      : `€${budgetMin || budgetMax}`
    : null;
  const showPreview = !!price.trim() && !!message.trim();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const next: typeof errors = {};
    if (!price.trim() || Number(price) <= 0) next.price = t("bf.errPrice");
    if (!days.trim() || Number(days) <= 0) next.days = t("bf.errDuration");
    if (!message.trim()) next.message = t("bf.errMessage");
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const { error } = await supabase.from("bids").insert({
      request_id: requestId,
      professional_id: user.id,
      price: Number(price),
      duration_days: Number(days),
      message,
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("row-level security")) {
        return toast.error(t("bf.limitError"));
      }
      return toast.error(error.message);
    }
    toast.success(t("bf.successTitle"));
    setPrice("");
    setDays("");
    setMessage("");
    setSent(true);
    qc.invalidateQueries({ queryKey: ["bids", requestId] });
    qc.invalidateQueries({ queryKey: ["bids-this-month", user.id] });
  }

  if (sent) {
    return (
      <Card className="border-success/40 bg-success/5 p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" />
          <div className="min-w-0">
            <div className="font-semibold text-success">{t("bf.successTitle")}</div>
            <p className="mt-1 text-sm text-muted-foreground">{t("bf.successDesc")}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="h-11 flex-1"
            onClick={() => setSent(false)}
            type="button"
          >
            {t("bf.followRequest")}
          </Button>
          <Button asChild variant="cta" className="h-11 flex-1">
            <Link to="/requests">{t("bf.backToRequests")}</Link>
          </Button>
        </div>
      </Card>
    );
  }

  // Subscription gate — informational only, no logic change
  if (!subLoading && !canBid) {
    return (
      <Card className="p-5 shadow-soft">
        <div className="text-base font-bold">{t("bf.gateTitle")}</div>
        <p className="mt-1 text-sm text-muted-foreground">{t("bf.gateDesc")}</p>
        <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm">
          <span className="text-muted-foreground">{t("bf.gateUsed")}: </span>
          <span className="font-semibold">{bidsThisMonth}</span>
        </div>
        <Button
          type="button"
          variant="cta"
          className="mt-4 h-11 w-full"
          onClick={() => navigate({ to: "/subscription" })}
        >
          {t("bf.gateCta")}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold">{t("bf.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("bf.subtitle")}</p>
        </div>
        {!subLoading && (
          <Badge variant={isActive ? "default" : "secondary"} className="shrink-0">
            {trialActive
              ? `${t("bf.trial")} · ${trialDaysLeft} ${t("rd.days")}`
              : isActive
                ? t("bf.subscribed")
                : `${remainingFree} ${t("bf.freeLeft")}`}
          </Badge>
        )}
      </div>

      <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="bid-price">{t("bf.price")}</Label>
            {budgetText && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Wallet className="h-3.5 w-3.5" />
                {t("bf.clientBudget")}: <span dir="ltr">{budgetText}</span>
              </span>
            )}
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm font-semibold text-muted-foreground">
              €
            </span>
            <Input
              id="bid-price"
              type="number"
              inputMode="decimal"
              min={1}
              className="h-12 ps-8 text-base"
              placeholder={t("bf.pricePlaceholder")}
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? "bid-price-err" : undefined}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          {errors.price && (
            <p id="bid-price-err" className="text-xs font-medium text-destructive">
              {errors.price}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bid-days">{t("bf.duration")}</Label>
          <Input
            id="bid-days"
            type="number"
            inputMode="numeric"
            min={1}
            className="h-12 text-base"
            placeholder={t("bf.durationPlaceholder")}
            aria-invalid={!!errors.days}
            aria-describedby={errors.days ? "bid-days-err" : undefined}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          {errors.days && (
            <p id="bid-days-err" className="text-xs font-medium text-destructive">
              {errors.days}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bid-message">{t("bf.message")}</Label>
          <Textarea
            id="bid-message"
            rows={4}
            maxLength={MAX_MESSAGE}
            className="text-base"
            placeholder={t("bf.messagePlaceholder")}
            aria-invalid={!!errors.message}
            aria-describedby="bid-message-hint"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex items-center justify-between gap-2">
            <p id="bid-message-hint" className="text-xs text-muted-foreground">
              {t("bf.messageHint")}
            </p>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground" dir="ltr">
              {message.length}/{MAX_MESSAGE}
            </span>
          </div>
          {errors.message && (
            <p className="text-xs font-medium text-destructive">{errors.message}</p>
          )}
        </div>

        {showPreview && (
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <div className="text-xs font-medium text-muted-foreground">{t("bf.preview")}</div>
            <div className="mt-2 text-2xl font-extrabold text-primary" dir="ltr">
              €{price}
              {days && (
                <span className="ms-2 text-sm font-medium text-muted-foreground">
                  · {days} {t("rd.days")}
                </span>
              )}
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm">{message}</p>
          </div>
        )}

        <Button type="submit" variant="cta" className="h-12 w-full text-base" disabled={loading}>
          {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {loading ? t("bf.submitting") : t("bf.submit")}
        </Button>
      </form>
    </Card>
  );
}
