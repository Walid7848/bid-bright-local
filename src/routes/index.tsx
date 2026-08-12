import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLang, LanguageSwitch } from "@/lib/i18n";
import { openCookiePreferences } from "@/lib/cookie-consent";
import waslaLogo from "@/assets/wasla-logo.png.asset.json";
import waslaHeroBg from "@/assets/wasla-hero-bg.jpg";

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileText,
  Gavel,
  Languages,
  MapPin,
  MessageSquare,
  Paintbrush,
  Scale,
  ShieldCheck,
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
        <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:py-5">
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

      {/* Hero cover */}
      <section className="relative overflow-hidden bg-surface">
        <img
          src={waslaHeroBg}
          alt={
            lang === "ar"
              ? "وصلة — خدمات مهنية بلغة تفهمها، مجموعة من المهنيين في هولندا"
              : lang === "nl"
              ? "Wasla — professionele diensten in jouw taal, vakmensen in Nederland"
              : "Wasla — professional services in your language, skilled workers in the Netherlands"
          }
          width={1656}
          height={946}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/80 via-surface/45 to-surface/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-14 md:py-20 lg:py-24">
          <div className="grid items-stretch gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
            {/* Service badges */}
            <div className="order-2 hidden grid-cols-2 gap-3 lg:order-1 xl:col-span-3 xl:grid">
              {[
                { icon: Scale, label: t("hero.badges.legal") },
                { icon: Languages, label: t("hero.badges.translation") },
                { icon: Briefcase, label: t("hero.badges.accounting") },
                { icon: Wrench, label: t("hero.badges.home") },
                { icon: Truck, label: t("hero.badges.moving") },
                { icon: Paintbrush, label: lang === "ar" ? "تصميم وديكور" : lang === "nl" ? "Design & decor" : "Design & decor" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-xl border bg-card/80 p-4 text-center shadow-soft backdrop-blur"
                >
                  <s.icon className="h-6 w-6 text-primary" />
                  <span className="text-xs font-semibold">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Center content */}
            <div className="order-1 self-center lg:order-2 lg:col-span-7 xl:col-span-6">
              <div className="rounded-3xl border border-border/50 bg-card/85 p-6 text-center shadow-elegant backdrop-blur-md md:p-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  {t("hero.trust.professionals")}
                </div>
                <p className="mb-3 text-lg font-medium text-primary md:text-xl">
                  {t("brand.tagline")}
                </p>
                <h1 className="text-3xl font-extrabold leading-tight text-foreground md:text-5xl">
                  {t("hero.title")}
                </h1>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg" className="gap-2 px-6 shadow-elegant">
                    <Link to="/auth">
                      {t("hero.cta.post")}
                      <Arrow className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-primary/40 bg-card px-6 text-primary shadow-soft">
                    <Link to="/auth">{t("hero.cta.pro")}</Link>
                  </Button>
                </div>
                <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
                  {t("hero.subtitle")}
                </p>
              </div>
            </div>


            {/* Why Wasla */}
            <div className="order-3 flex h-full lg:col-span-5 xl:col-span-3">
              <div className="flex h-full w-full flex-col rounded-2xl border bg-card/90 p-5 shadow-elegant backdrop-blur md:p-6">
                <h3 className="mb-5 text-center text-lg font-bold text-balance md:text-xl">
                  {t("hero.why.title")}
                </h3>
                <ul className="flex flex-1 flex-col justify-center gap-5">
                  {[
                    { icon: Languages, text: t("hero.why.point1") },
                    { icon: Users, text: t("hero.why.point2") },
                    { icon: Star, text: t("hero.why.point3") },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium md:gap-4">
                      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary md:h-9 md:w-9">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="min-w-0 flex-1 leading-relaxed text-balance">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom trust bar */}
          <div className="relative mt-12 rounded-2xl bg-gradient-to-r from-primary to-primary/90 p-6 text-primary-foreground shadow-elegant md:mt-16">
            <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-5">
              {[
                { value: "+200", label: lang === "ar" ? "مقدم خدمة" : lang === "nl" ? "Professionals" : "Professionals" },
                { value: "25", label: lang === "ar" ? "مدينة هولندية" : lang === "nl" ? "Nederlandse steden" : "Dutch cities" },
                { value: "AR / NL / EN", label: lang === "ar" ? "لغة مدعومة" : lang === "nl" ? "Talen" : "Languages" },
                { value: "0%", label: lang === "ar" ? "عمولة على العروض" : lang === "nl" ? "Commissie op offertes" : "Commission on bids" },
                { value: "24/7", label: lang === "ar" ? "تواصل مباشر" : lang === "nl" ? "Direct contact" : "Direct contact" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-2xl font-extrabold md:text-3xl">{s.value}</div>
                  <div className="mt-1 text-sm opacity-90">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>




      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20">
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
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:gap-20">
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
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 text-base text-muted-foreground md:flex-row md:justify-between">
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
