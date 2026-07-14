import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مِهنتي — انشر طلبك واستقبل عروض من أصحاب المهن في مدينتك" },
      {
        name: "description",
        content:
          "منصة عربية تربط الزبائن بأصحاب المهن الحرة. انشر طلب خدمتك مع الصور، قارن العروض التفاعلية، واختر ما يناسبك في دقائق.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/60 bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">مِهنتي</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">تسجيل الدخول</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">ابدأ الآن</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_35%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              منصة المزايدة العربية للخدمات الحرة
            </div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              اطلب خدمتك،
              <br />
              واختر أفضل عرض في مدينتك
            </h1>
            <p className="text-lg text-white/85 md:text-xl">
              انشر طلبك مع الصور، واستقبل عروض أسعار تفاعلية من أصحاب المهن في نفس مدينتك، ثم قارن
              واختر ما يناسبك.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" variant="secondary" className="gap-1 text-base">
                <Link to="/auth">
                  انشر طلبك الآن
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to="/auth">أنا صاحب مهنة</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> بدون عمولة على العروض
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> مقدمو خدمات من مدينتك
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-elegant backdrop-blur-xl">
              <div className="rounded-xl bg-surface p-5 text-foreground shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-primary">سباكة • جدة</div>
                    <div className="mt-1 text-lg font-bold">تسريب مياه في المطبخ</div>
                  </div>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    مفتوح
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  يوجد تسريب أسفل الحوض ويحتاج صيانة عاجلة، أرفقت صور الوصلة.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { name: "أحمد الغامدي", price: "180", days: 1 },
                    { name: "خالد السبيعي", price: "220", days: 1, best: true },
                    { name: "فايز الحربي", price: "150", days: 2 },
                  ].map((b) => (
                    <div
                      key={b.name}
                      className={
                        "flex items-center justify-between rounded-lg border p-3 " +
                        (b.best
                          ? "border-primary bg-primary/5 shadow-glow"
                          : "border-border bg-muted/30")
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                          {b.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{b.name}</div>
                          <div className="text-xs text-muted-foreground">
                            خلال {b.days} يوم
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-base font-bold text-primary">{b.price} ر.س</div>
                        {b.best && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-success">
                            <CheckCircle2 className="h-3 w-3" /> الأنسب
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">كيف تعمل المنصة؟</h2>
          <p className="mt-3 text-muted-foreground">ثلاث خطوات بسيطة تفصلك عن إنجاز طلبك</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ImageIcon,
              title: "١. انشر طلبك",
              desc: "أضف تفاصيل الخدمة المطلوبة مع صور توضح المشكلة أو المهمة.",
            },
            {
              icon: MessageSquare,
              title: "٢. استقبل العروض",
              desc: "أصحاب المهن في مدينتك يقدمون عروض أسعار مع مدة التنفيذ.",
            },
            {
              icon: CheckCircle2,
              title: "٣. قارن واختر",
              desc: "قارن الأسعار والتقييمات، ثم اختر العرض الأنسب لك.",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="group rounded-2xl border bg-card p-6 shadow-soft transition hover:shadow-elegant"
            >
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow transition group-hover:scale-110">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For pros */}
      <section className="border-y border-border/60 bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Wallet className="h-3.5 w-3.5" /> لأصحاب المهن
            </div>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">وسّع مصادر دخلك</h2>
            <p className="mt-4 text-muted-foreground">
              تصفح الطلبات في مدينتك، قدم عرضك مباشرة مع السعر والمدة، وابدأ العمل بمجرد قبول الزبون.
              بدون عمولة على العروض.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "طلبات حقيقية من زبائن في مدينتك",
                "قدّم عرضاً واحداً لكل طلب",
                "تواصل مباشر مع الزبون بعد الاختيار",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  {t}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-6">
              <Link to="/auth">سجّل كصاحب مهنة</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: "مقدم خدمة", value: "+٥٠٠" },
              { icon: Briefcase, label: "طلب نشط", value: "+١٢٠" },
              { icon: MapPin, label: "مدينة مغطاة", value: "٢٠" },
              { icon: CheckCircle2, label: "معدل الرضا", value: "٩٦٪" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-soft">
                <s.icon className="mb-3 h-6 w-6 text-primary" />
                <div className="text-2xl font-extrabold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">جاهز تبدأ؟</h2>
        <p className="mt-3 text-muted-foreground">
          سواء تبحث عن خدمة أو تقدمها، منصتك تنتظرك.
        </p>
        <Button asChild size="lg" className="mt-6 gap-1">
          <Link to="/auth">
            إنشاء حساب مجاني
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} مِهنتي. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}
