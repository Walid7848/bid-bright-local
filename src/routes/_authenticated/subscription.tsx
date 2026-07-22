import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/subscription")({
  component: SubscriptionPage,
  head: () => ({
    meta: [
      { title: "اشتراك مقدمي الخدمة | Shughlak" },
      {
        name: "description",
        content:
          "أدر اشتراكك كصاحب مهنة: شهران مجانيان ثم اشتراك شهري لتقديم عروض غير محدودة.",
      },
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

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-muted-foreground">
        جاري التحميل...
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-6 text-center">
          <div className="text-lg font-semibold">حساب الزبائن مجاني دائماً</div>
          <div className="mt-2 text-sm text-muted-foreground">
            الاشتراك مطلوب فقط لأصحاب المهن. أكمل ملفك كصاحب مهنة للاستفادة من التجربة المجانية.
          </div>
          <Button asChild className="mt-4">
            <Link to="/profile">إلى الملف الشخصي</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">اشتراكك</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          شهران مجانيان لكل صاحب مهنة جديد، ثم اشتراك شهري لتقديم عروض غير محدودة.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase text-muted-foreground">الحالة الحالية</div>
            <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
              {trialActive && (
                <>
                  <Sparkles className="h-5 w-5 text-primary" />
                  فترة تجربة مجانية
                </>
              )}
              {paidActive && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  اشتراك نشط
                </>
              )}
              {!isActive && (
                <>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  انتهت التجربة
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
              متبقٍ <span className="font-semibold">{trialDaysLeft} يوم</span> من تجربتك المجانية.
            </div>
            <div className="mt-1 text-muted-foreground">
              تنتهي{" "}
              {formatDistanceToNow(new Date(subscription.trial_ends_at), {
                addSuffix: true,
                locale: ar,
              })}
              .
            </div>
          </div>
        )}

        {!isActive && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
            انتهت فترتك التجريبية. يمكنك تقديم <span className="font-semibold">عرض واحد فقط شهرياً</span> حتى تشترك.
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">العروض هذا الشهر</div>
            <div className="mt-1 text-lg font-semibold">{bidsThisMonth}</div>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground">
              {isActive ? "غير محدود" : "المتبقي مجاناً"}
            </div>
            <div className="mt-1 text-lg font-semibold">
              {isActive ? "∞" : `${remainingFree}/1`}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-lg font-semibold">خطة العضوية</div>
        <div className="mt-4 space-y-3">
          <PlanFeature text="عروض غير محدودة على كل الطلبات" />
          <PlanFeature text="ظهور فوري في نتائج المدينة والتخصص" />
          <PlanFeature text="تنبيهات عند نشر طلبات جديدة" />
          <PlanFeature text="إلغاء في أي وقت" />
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold">قريباً</div>
            <div className="text-xs text-muted-foreground">
              سيتم تفعيل الدفع عبر Stripe قريباً
            </div>
          </div>
          <Button disabled title="سيتم تفعيل الدفع قريباً">
            {canBid && isActive ? "أنت مشترك" : "اشترك"}
          </Button>
        </div>
      </Card>
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
