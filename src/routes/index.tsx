import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLang, LanguageSwitch } from "@/lib/i18n";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileText,
  Languages,
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
      {
        title: "Mihnati — Professionals & vakmensen in Nederland | مِهنتي",
      },
      {
        name: "description",
        content:
          "Vind loodgieters, elektriciens, schoonmakers, advocaten, vertalers, docenten en meer in Nederland. Plaats je aanvraag, ontvang offertes en kies de beste — in het Arabisch, Nederlands of Engels.",
      },
      { property: "og:title", content: "Mihnati — Professionals & vakmensen in Nederland" },
      {
        property: "og:description",
        content:
          "Post your request and receive offers from professionals and tradespeople across the Netherlands. Arabic, Dutch and English supported.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, lang } = useLang();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/60 bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">{t("brand.name")}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitch />
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">{t("nav.signIn")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">{t("nav.start")}</Link>
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
              {t("hero.badge")}
            </div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="text-lg text-white/85 md:text-xl">{t("hero.subtitle")}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" variant="secondary" className="gap-1 text-base">
                <Link to="/auth">
                  {t("hero.cta.post")}
                  <Arrow className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to="/auth">{t("hero.cta.pro")}</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> {t("hero.feature.noCommission")}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {t("hero.feature.local")}
              </div>
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" /> {t("hero.feature.bilingual")}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-elegant backdrop-blur-xl">
              <div className="rounded-xl bg-surface p-5 text-foreground shadow-soft" dir={lang === "ar" ? "rtl" : "ltr"}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-primary">
                      {lang === "ar"
                        ? "سباكة • أمستردام"
                        : lang === "nl"
                        ? "Loodgieter • Amsterdam"
                        : "Plumbing • Amsterdam"}
                    </div>
                    <div className="mt-1 text-lg font-bold">
                      {lang === "ar"
                        ? "إصلاح تسريب في المطبخ"
                        : lang === "nl"
                        ? "Lekkage in de keuken repareren"
                        : "Fix a kitchen leak"}
                    </div>
                  </div>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    {lang === "ar" ? "مفتوح" : lang === "nl" ? "Open" : "Open"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "تسريب أسفل الحوض يحتاج إصلاحاً سريعاً هذا الأسبوع."
                    : lang === "nl"
                    ? "Lekkage onder de gootsteen, deze week te repareren."
                    : "Leak under the sink, needs a quick fix this week."}
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { name: lang === "ar" ? "يوسف م." : "Youssef M.", price: "85", days: 2 },
                    {
                      name: lang === "ar" ? "ساندرا ك." : "Sandra K.",
                      price: "110",
                      days: 1,
                      best: true,
                    },
                    { name: lang === "ar" ? "عمر ح." : "Omar H.", price: "70", days: 3 },
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
                            {lang === "ar"
                              ? `خلال ${b.days} يوم`
                              : lang === "nl"
                              ? `${b.days} dagen`
                              : `${b.days} days`}
                          </div>
                        </div>
                      </div>
                      <div className={lang === "ar" ? "text-left" : "text-right"}>
                        <div className="text-base font-bold text-primary">€{b.price}</div>
                        {b.best && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-success">
                            <CheckCircle2 className="h-3 w-3" />{" "}
                            {lang === "ar" ? "الأنسب" : lang === "nl" ? "Beste keuze" : "Best pick"}
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
          <h2 className="text-3xl font-bold md:text-4xl">{t("how.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("how.subtitle")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: FileText, title: t("how.s1.title"), desc: t("how.s1.desc") },
            { icon: MessageSquare, title: t("how.s2.title"), desc: t("how.s2.desc") },
            { icon: CheckCircle2, title: t("how.s3.title"), desc: t("how.s3.desc") },
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
              <Wallet className="h-3.5 w-3.5" /> {t("pros.badge")}
            </div>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">{t("pros.title")}</h2>
            <p className="mt-4 text-muted-foreground">{t("pros.desc")}</p>
            <ul className="mt-5 space-y-3">
              {[t("pros.point1"), t("pros.point2"), t("pros.point3")].map((tx) => (
                <li key={tx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  {tx}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-6">
              <Link to="/auth">{t("pros.cta")}</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: Users,
                label:
                  lang === "ar" ? "مقدم خدمة" : lang === "nl" ? "Professionals" : "Professionals",
                value: "+200",
              },
              {
                icon: Briefcase,
                label:
                  lang === "ar"
                    ? "طلب نشط"
                    : lang === "nl"
                    ? "Actieve aanvragen"
                    : "Active requests",
                value: "+80",
              },
              {
                icon: MapPin,
                label:
                  lang === "ar"
                    ? "مدينة هولندية"
                    : lang === "nl"
                    ? "Nederlandse steden"
                    : "Dutch cities",
                value: "25",
              },
              {
                icon: Languages,
                label: lang === "ar" ? "لغة مدعومة" : lang === "nl" ? "Talen" : "Languages",
                value: "AR / NL / EN",
              },
              },
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
        <h2 className="text-3xl font-bold md:text-4xl">{t("cta.ready")}</h2>
        <p className="mt-3 text-muted-foreground">{t("cta.readyDesc")}</p>
        <Button asChild size="lg" className="mt-6 gap-1">
          <Link to="/auth">
            {t("cta.signup")}
            <Arrow className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t("brand.name")} · {t("brand.tagline")}
      </footer>
    </div>
  );
}
