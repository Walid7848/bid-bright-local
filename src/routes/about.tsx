import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, ArrowLeft, ArrowRight } from "lucide-react";
import { useLang, LanguageSwitch } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Over ons — Mihnati | من نحن" },
      {
        name: "description",
        content:
          "Leer Mihnati kennen: onze missie, visie, doelstellingen en waarden voor de Arabische gemeenschap in Nederland. AR / NL / EN.",
      },
      { property: "og:title", content: "Over ons — Mihnati" },
      {
        property: "og:description",
        content: "Mihnati: missie, visie en waarden voor de Arabische gemeenschap in Nederland.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://bid-bright-local.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t, lang } = useLang();
  const Arrow = lang === "ar" ? ArrowRight : ArrowLeft;
  const sections = [
    { title: "about.mission.title", body: "about.mission.body" },
    { title: "about.vision.title", body: "about.vision.body" },
    { title: "about.objectives.title", body: "about.objectives.body" },
    { title: "about.strategy.title", body: "about.strategy.body" },
    { title: "about.values.title", body: "about.values.body" },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">{t("brand.name")}</span>
          </Link>
          <LanguageSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <Arrow className="h-4 w-4" /> {t("common.back")}
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">{t("about.title")}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{t("about.updated")}</p>
        <p className="mt-6 text-base leading-relaxed text-foreground/90">{t("about.intro")}</p>

        <div className="mt-8 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-bold">{t(s.title)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {t(s.body)}
              </p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t("brand.name")} · {t("footer.rights")}
      </footer>
    </div>
  );
}
