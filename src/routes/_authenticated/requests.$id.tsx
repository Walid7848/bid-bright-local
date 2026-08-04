import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { CATEGORY_MAP } from "@/lib/categories";
import { SignedImage } from "@/components/SignedImage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReviewSection } from "@/components/ReviewSection";
import { RoleGate } from "@/components/RoleGate";
import {
  BidComparison,
  BidScoreBadges,
  useBidScores,
  type ScoredBid,
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/requests/$id")({
  component: RequestDetail,
});

function RequestDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

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
        .select("*, profiles!bids_professional_profile_fkey(full_name, city, phone, profession, bio)")
        .eq("request_id", id)
        .order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const scores = useBidScores(bids ?? undefined);



  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!request) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center">الطلب غير موجود</div>;
  }

  const isOwner = user?.id === request.client_id;
  const canBidSlot = request.status === "open" && !isOwner;
  const myBid = bids?.find((b: any) => b.professional_id === user?.id);
  const acceptedBid = bids?.find((b: any) => b.status === "accepted");

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
    const { error: e1 } = await supabase
      .from("bids")
      .update({ status: "accepted" })
      .eq("id", bidId);
    if (e1) return toast.error(e1.message);
    await supabase
      .from("bids")
      .update({ status: "rejected" })
      .eq("request_id", id)
      .neq("id", bidId);
    const { error: e2 } = await supabase
      .from("requests")
      .update({ status: "awarded", awarded_bid_id: bidId })
      .eq("id", id);
    if (e2) return toast.error(e2.message);
    toast.success("تم قبول العرض");
    qc.invalidateQueries({ queryKey: ["request", id] });
    qc.invalidateQueries({ queryKey: ["bids", id] });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden shadow-soft">
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{CATEGORY_MAP[request.category] || request.category}</Badge>
                    {request.status === "open" ? (
                      <Badge className="bg-success/15 text-success hover:bg-success/20">
                        مفتوح
                      </Badge>
                    ) : request.status === "awarded" ? (
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                        تم الاختيار
                      </Badge>
                    ) : (
                      <Badge variant="outline">مغلق</Badge>
                    )}
                  </div>
                  <h1 className="mt-2 text-2xl font-bold">{request.title}</h1>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {request.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </span>
                  </div>
                </div>
                {isOwner && isClient && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1 text-destructive">
                        <Trash2 className="h-4 w-4" /> حذف
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
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {request.description}
              </p>
              {(request.budget_min || request.budget_max) && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="text-muted-foreground">الميزانية:</span>
                  <span className="font-semibold">
                    {request.budget_min || 0}
                    {" - "}
                    {request.budget_max || "؟"} €
                  </span>
                </div>
              )}
            </div>
            {request.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-1 border-t p-1 sm:grid-cols-3">
                {request.images.map((p: string) => (
                  <SignedImage
                    key={p}
                    path={p}
                    className="aspect-square w-full rounded object-cover"
                  />
                ))}
              </div>
            )}
          </Card>

          {isOwner && bids && bids.length > 1 && request.status === "open" && (
            <BidComparison
              bids={bids}
              scores={scores}
              canSelect={isOwner && isClient}
              onAccept={acceptBid}
            />
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                العروض ({bids?.length ?? 0})
              </h2>
              {bids && bids.length > 0 && (
                <span className="text-xs text-muted-foreground">مرتبة حسب السعر</span>
              )}
            </div>
            {!bids || bids.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                لم تُقدم عروض بعد
              </Card>
            ) : (
              <div className="space-y-3">
                {bids.map((b: any) => (
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


          {(request.status === "awarded" || request.status === "in_progress" || request.status === "completed") && acceptedBid && (
            <ReviewSection
              requestId={id}
              clientId={request.client_id}
              professionalId={acceptedBid.professional_id}
              isOwner={isOwner}
            />
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-5 shadow-soft">
            <div className="text-xs font-medium uppercase text-muted-foreground">
              صاحب الطلب
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {(request.profiles?.full_name || "؟").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">
                  {request.profiles?.full_name || "زبون"}
                </div>
                <div className="text-xs text-muted-foreground">{request.profiles?.city}</div>
              </div>
            </div>
            {acceptedBid && (isOwner || acceptedBid.professional_id === user?.id) && request.profiles?.phone && (
              <a
                href={`tel:${request.profiles.phone}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-success/10 py-2 text-sm font-medium text-success hover:bg-success/15"
                dir="ltr"
              >
                <Phone className="h-4 w-4" />
                {request.profiles.phone}
              </a>
            )}
          </Card>

          {canBidSlot && !myBid && (
            <RoleGate role="professional" compact>
              <BidForm requestId={id} />
            </RoleGate>
          )}
          {myBid && (
            <Card className="p-5 shadow-soft">
              <div className="text-xs font-medium uppercase text-muted-foreground">عرضك</div>
              <div className="mt-2 text-2xl font-bold text-primary">{myBid.price} €</div>
              <div className="text-sm text-muted-foreground">خلال {myBid.duration_days} يوم</div>
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
                  ? "مقبول"
                  : myBid.status === "rejected"
                    ? "مرفوض"
                    : "قيد الانتظار"}
              </Badge>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function BidCard({
  bid,
  isOwner,
  canSelect,
  isAccepted,
  onAccept,
}: {
  bid: any;
  isOwner: boolean;
  canSelect: boolean;
  isAccepted: boolean;
  onAccept: () => void;
}) {
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
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
              {(bid.profiles?.full_name || "؟").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{bid.profiles?.full_name || "صاحب مهنة"}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {bid.profiles?.city} •{" "}
              {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true, locale: ar })}
            </div>
          </div>
        </div>
        <div className="text-left">
          <div className="text-2xl font-extrabold text-primary">{bid.price} €</div>
          <div className="text-xs text-muted-foreground">
            <Clock className="ml-1 inline h-3 w-3" /> خلال {bid.duration_days} يوم
          </div>
        </div>
      </div>
      {bid.profiles?.bio && (
        <p className="mt-3 text-xs text-muted-foreground">{bid.profiles.bio}</p>
      )}
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-sm">
        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="whitespace-pre-wrap">{bid.message}</span>
      </div>
      {isAccepted && bid.profiles?.phone && isOwner && (
        <a
          href={`tel:${bid.profiles.phone}`}
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-success/10 py-2 text-sm font-semibold text-success"
          dir="ltr"
        >
          <Phone className="h-4 w-4" />
          {bid.profiles.phone}
        </a>
      )}
      {canSelect && (
        <div className="mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full gap-1">
                <CheckCircle2 className="h-4 w-4" /> اختر هذا العرض
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
        </div>
      )}
    </Card>
  );
}

function BidForm({ requestId }: { requestId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
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
        return toast.error(
          "لقد استنفدت العرض المجاني لهذا الشهر. اشترك للاستمرار في تقديم العروض.",
        );
      }
      return toast.error(error.message);
    }
    toast.success("تم تقديم عرضك");
    setPrice("");
    setDays("");
    setMessage("");
    qc.invalidateQueries({ queryKey: ["bids", requestId] });
    qc.invalidateQueries({ queryKey: ["bids-this-month", user.id] });
  }

  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase text-muted-foreground">قدّم عرضك</div>
        {!subLoading && (
          <Badge variant={isActive ? "default" : canBid ? "secondary" : "destructive"}>
            {trialActive
              ? `تجربة مجانية · ${trialDaysLeft} يوم`
              : isActive
                ? "مشترك"
                : `عرض مجاني: ${remainingFree}/1`}
          </Badge>
        )}
      </div>

      {!subLoading && !canBid && (
        <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <div className="font-medium">استنفدت عرضك المجاني لهذا الشهر</div>
          <div className="mt-1 text-muted-foreground">
            قدّمت {bidsThisMonth} عرضاً هذا الشهر. اشترك لتقديم عروض غير محدودة.
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={() => navigate({ to: "/subscription" })}
          >
            الاشتراك الآن
          </Button>
        </div>
      )}

      <form onSubmit={submit} className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label>السعر (€)</Label>
          <Input
            type="number"
            min={1}
            required
            disabled={!canBid}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>مدة التنفيذ (أيام)</Label>
          <Input
            type="number"
            min={1}
            required
            disabled={!canBid}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>رسالة للزبون</Label>
          <Textarea
            required
            rows={3}
            maxLength={500}
            disabled={!canBid}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اشرح خطة العمل باختصار..."
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !canBid}>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          إرسال العرض
        </Button>
      </form>
    </Card>
  );
}

