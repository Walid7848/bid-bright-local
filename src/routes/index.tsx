import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLang, LanguageSwitch } from "@/lib/i18n";
import { openCookiePreferences } from "@/lib/cookie-consent";
import waslaLogo from "@/assets/wasla-logo.png.asset.json";

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calculator,
  CheckCircle2,
  FileText,
  Languages,
  MapPin,
  MessageSquare,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Wasla — Professionals & vakmensen in Nederland | وصلة",
      },
      {
        name: "description",
        content:
          "Vind loodgieters, elektriciens, schoonmakers, advocaten, vertalers, docenten en meer in Nederland. Plaats je aanvraag, ontvang offertes en kies de beste — in het Arabisch, Nederlands of Engels.",
      },
      { property: "og:title", content: "Wasla — Professionals & vakmensen in Nederland" },
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
        <div className="mx-auto flex min-h-20 max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:py-5">
          <div className="flex items-center gap-2">
            <img src={waslaLogo.url} alt={t("brand.name")} className="h-11 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">{t("nav.signIn")}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
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

            {/* Service badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { icon: Scale, label: t("hero.badges.legal") },
                { icon: Languages, label: t("hero.badges.translation") },
                { icon: Calculator, label: t("hero.badges.accounting") },
                { icon: Wrench, label: t("hero.badges.home") },
                { icon: Truck, label: t("hero.badges.moving") },
              ].map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:border-secondary/70 hover:bg-white/20 md:text-sm"
                >
                  <b.icon className="h-4 w-4 text-secondary" />
                  {b.label}
                </span>
              ))}
            </div>

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
            <div className="space-y-4" dir={lang === "ar" ? "rtl" : "ltr"}>
              {[
                {
                  icon: Scale,
                  cat:
                    lang === "ar"
                      ? "استشارة قانونية • أمستردام"
                      : lang === "nl"
                      ? "Juridisch advies • Amsterdam"
                      : "Legal advice • Amsterdam",
                  title:
                    lang === "ar"
                      ? "مراجعة عقد إيجار"
                      : lang === "nl"
                      ? "Huurcontract laten nakijken"
                      : "Review a rental contract",
                  price: "120",
                  bids: 6,
                  tone: "primary" as const,
                },
                {
                  icon: FileText,
                  cat:
                    lang === "ar"
                      ? "ترجمة محلّفة • روتردام"
                      : lang === "nl"
                      ? "Beëdigde vertaling • Rotterdam"
                      : "Sworn translation • Rotterdam",
                  title:
                    lang === "ar"
                      ? "ترجمة عقد عمل (AR ⇄ NL)"
                      : lang === "nl"
                      ? "Arbeidscontract vertalen (AR ⇄ NL)"
                      : "Translate a work contract (AR ⇄ NL)",
                  price: "75",
                  bids: 9,
                  tone: "secondary" as const,
                },
                {
                  icon: Wrench,
                  cat:
                    lang === "ar"
                      ? "سباكة • أوتريخت"
                      : lang === "nl"
                      ? "Loodgieter • Utrecht"
                      : "Plumbing • Utrecht",
                  title:
                    lang === "ar"
                      ? "إصلاح تسريب في المطبخ"
                      : lang === "nl"
                      ? "Lekkage in de keuken repareren"
                      : "Fix a kitchen leak",
                  price: "85",
                  bids: 4,
                  tone: "primary" as const,
                },
              ].map((c, i) => (
                <div
                  key={c.title}
                  style={{ animationDelay: `${i * 140}ms` }}
                  className={
                    "flex animate-in items-center gap-4 rounded-2xl border border-white/20 bg-surface/95 p-4 text-foreground shadow-elegant backdrop-blur-xl transition duration-300 fade-in slide-in-from-bottom-3 hover:-translate-y-1 hover:shadow-glow " +
                    (i === 1 ? "md:mx-4" : "")
                  }
                >
                  <div
                    className={
                      "grid h-12 w-12 shrink-0 place-items-center rounded-xl " +
                      (c.tone === "secondary"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-gradient-primary text-primary-foreground")
                    }
                  >
                    <c.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-primary">{c.cat}</div>
                    <div className="truncate text-sm font-bold">{c.title}</div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {lang === "ar"
                        ? `${c.bids} عروض`
                        : lang === "nl"
                        ? `${c.bids} offertes`
                        : `${c.bids} offers`}
                    </div>
                  </div>
                  <div className={lang === "ar" ? "text-left" : "text-right"}>
                    <div className="text-base font-bold text-primary">€{c.price}</div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      {lang === "ar" ? "الأنسب" : lang === "nl" ? "Beste keuze" : "Best pick"}
                    </div>
                  </div>
                </div>
              ))}
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
        <div className="grid items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: FileText, title: t("how.s1.title"), desc: t("how.s1.desc") },
            { icon: MessageSquare, title: t("how.s2.title"), desc: t("how.s2.desc") },
            { icon: CheckCircle2, title: t("how.s3.title"), desc: t("how.s3.desc") },
            { icon: Wrench, title: t("how.s4.title"), desc: t("how.s4.desc") },
            { icon: Star, title: t("how.s5.title"), desc: t("how.s5.desc") },
          ].map((s, i) => (
            <div
              key={i}
              className="group flex h-full flex-col rounded-2xl border bg-card p-7 shadow-soft transition hover:shadow-elegant"
            >
              <div
                className={
                  "mb-5 grid h-16 w-16 place-items-center rounded-2xl shadow-glow transition group-hover:scale-110 " +
                  (i % 2 === 0
                    ? "bg-gradient-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground")
                }
              >
                <s.icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For pros */}
      <section className="border-y border-border/60 bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:gap-20">
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

          <div className="grid grid-cols-2 gap-5 sm:gap-6">
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
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border bg-card p-6 shadow-soft">
                <s.icon className="mb-3 h-7 w-7 text-primary" />
                <div className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">{t("cta.ready")}</h2>
        <p className="mt-3 text-muted-foreground">{t("cta.readyDesc")}</p>
        <Button asChild size="lg" variant="secondary" className="mt-6 gap-1 px-8 text-base shadow-elegant">
          <Link to="/auth">
            {t("cta.signup")}
            <Arrow className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-base text-muted-foreground md:flex-row md:justify-between">
          <div>
            © {new Date().getFullYear()} {t("brand.name")} · {t("brand.tagline")}
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-base font-medium">
            <Link to="/about" className="transition hover:text-foreground">
              {t("footer.about")}
            </Link>
            <Link to="/privacy" className="transition hover:text-foreground">
              {t("footer.privacy")}
            </Link>
            <Link to="/terms" className="transition hover:text-foreground">
              {t("footer.terms")}
            </Link>
            <Link to="/cookie-policy" className="transition hover:text-foreground">
              {t("footer.cookies")}
            </Link>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="transition hover:text-foreground"
            >
              {t("consent.manage")}
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
}
