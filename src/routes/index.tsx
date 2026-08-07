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
      <section className="relative overflow-hidden bg-surface">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-0 md:pt-14">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_auto]">
            {/* Service icon grid */}
            <div className="order-2 grid grid-cols-5 gap-x-3 gap-y-5 lg:order-1">
              {SERVICE_ICONS.map((s) => (
                <div key={s.ar} className="flex flex-col items-center gap-1.5 text-center">
                  <s.icon className="h-6 w-6 text-primary" strokeWidth={1.6} />
                  <span className="text-[10px] font-medium leading-tight text-foreground/80">
                    {lang === "ar" ? s.ar : lang === "nl" ? s.nl : s.en}
                  </span>
                </div>
              ))}
              <div className="col-span-5 mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-3 py-2 text-[11px] font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                {lang === "ar"
                  ? "جميع مقدمي الخدمات موثوقون ومراجعون"
                  : lang === "nl"
                  ? "Alle vakmensen zijn geverifieerd en beoordeeld"
                  : "All professionals are verified and reviewed"}
              </div>
            </div>

            {/* Center: logo + claim */}
            <div className="order-1 text-center lg:order-2">
              <img
                src={waslaLogo.url}
                alt={t("brand.name")}
                className="mx-auto h-20 w-auto md:h-24"
              />
              <p className="mt-3 text-lg font-bold text-primary md:text-xl">
                {t("brand.tagline")}
              </p>
              <div className="mx-auto my-4 h-px w-40 bg-border" />
              <h1 className="text-xl font-extrabold leading-snug text-foreground md:text-2xl">
                {t("hero.title")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                {t("hero.subtitle")}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" variant="secondary" className="gap-1 text-base">
                  <Link to="/auth">
                    {t("hero.cta.post")}
                    <Arrow className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth">{t("hero.cta.pro")}</Link>
                </Button>
              </div>
            </div>

            {/* Trust list */}
            <div className="order-3 flex flex-row flex-wrap justify-center gap-4 lg:flex-col lg:gap-5">
              {[
                {
                  icon: ShieldCheck,
                  ar: "مقدمون موثوقون",
                  nl: "Betrouwbare vakmensen",
                  en: "Trusted professionals",
                },
                { icon: Star, ar: "تقييمات حقيقية", nl: "Echte reviews", en: "Real reviews" },
                {
                  icon: MessageSquare,
                  ar: "دعم بلغتك",
                  nl: "Support in jouw taal",
                  en: "Support in your language",
                },
                { icon: Lock, ar: "أمان وشفافية", nl: "Veilig en transparant", en: "Safe & transparent" },
              ].map((f) => (
                <div key={f.en} className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <f.icon className="h-4 w-4" />
                  </span>
                  {lang === "ar" ? f.ar : lang === "nl" ? f.nl : f.en}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Photo band */}
        <div className="relative mt-8">
          <img
            src={heroTeam}
            alt={
              lang === "ar"
                ? "مجموعة من أصحاب المهن والمختصين في هولندا"
                : lang === "nl"
                ? "Groep vakmensen en professionals in Nederland"
                : "A group of professionals and tradespeople in the Netherlands"
            }
            width={1920}
            height={1088}
            className="h-[280px] w-full object-cover object-top md:h-[420px]"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-surface to-transparent" />
        </div>

        {/* Trust bar */}
        <div className="bg-gradient-hero text-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                icon: ShieldCheck,
                ar: ["موثوقون", "جميع مقدمي الخدمات موثوقون ومراجعون"],
                nl: ["Betrouwbaar", "Alle vakmensen zijn geverifieerd"],
                en: ["Trusted", "All professionals are verified"],
              },
              {
                icon: Users,
                ar: ["مجتمع قوي", "نخدم كل المقيمين في هولندا"],
                nl: ["Sterke community", "Voor iedereen in Nederland"],
                en: ["Strong community", "For everyone in the Netherlands"],
              },
              {
                icon: Handshake,
                ar: ["سهولة وراحة", "اطلب الخدمة واستلم العروض بسهولة"],
                nl: ["Simpel en gemakkelijk", "Plaats je aanvraag, ontvang offertes"],
                en: ["Simple & easy", "Post a request, receive offers"],
              },
              {
                icon: Clock,
                ar: ["يوفر وقتك وجهدك", "نساعدك في العثور على المختص بسرعة"],
                nl: ["Bespaart tijd", "Snel de juiste vakman vinden"],
                en: ["Saves time", "Find the right pro fast"],
              },
              {
                icon: TrendingUp,
                ar: ["فرص عمل ونمو", "ندعم المهنيين لتطوير أعمالهم"],
                nl: ["Groeikansen", "Wij helpen vakmensen groeien"],
                en: ["Growth opportunities", "We help professionals grow"],
              },
            ].map((f) => {
              const [title, desc] = lang === "ar" ? f.ar : lang === "nl" ? f.nl : f.en;
              return (
                <div key={title} className="text-center">
                  <f.icon className="mx-auto h-7 w-7 text-secondary" strokeWidth={1.6} />
                  <div className="mt-2 text-sm font-bold">{title}</div>
                  <div className="mt-1 text-xs text-white/75">{desc}</div>
                </div>
              );
            })}
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
