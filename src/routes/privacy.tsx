import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, ArrowLeft, ArrowRight } from "lucide-react";
import { useLang, LanguageSwitch } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacybeleid — Wasla | سياسة الخصوصية" },
      {
        name: "description",
        content:
          "Privacybeleid van Wasla: hoe wij gegevens verzamelen, gebruiken en beschermen. AR / NL / EN.",
      },
      { property: "og:title", content: "Privacybeleid — Wasla" },
      {
        property: "og:description",
        content: "Privacybeleid van Wasla in het Arabisch, Nederlands en Engels.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t, lang } = useLang();
  const Arrow = lang === "ar" ? ArrowRight : ArrowLeft;
  const sections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

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
        <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">{t("privacy.title")}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{t("privacy.updated")}</p>
        <p className="mt-6 text-base leading-relaxed text-foreground/90">{t("privacy.intro")}</p>

        <div className="mt-8 space-y-8">
          {sections.map((n) => {
            const titleKey = `privacy.s${n}.title` as const;
            const bodyKey = `privacy.s${n}.body` as const;
            return (
              <section key={n}>
                <h2 className="text-xl font-bold">{t(titleKey)}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(bodyKey)}</p>
              </section>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {t("brand.name")} · {t("footer.rights")}
      </footer>
    </div>
  );
}
