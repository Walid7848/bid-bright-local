import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Servicevoorwaarden — Wasla | شروط الخدمة" },
      {
        name: "description",
        content:
          "Servicevoorwaarden van Wasla: gebruik van het platform, abonnementen en aansprakelijkheid. AR / NL / EN.",
      },
      { property: "og:title", content: "Servicevoorwaarden — Wasla" },
      {
        property: "og:description",
        content: "Servicevoorwaarden van Wasla in het Arabisch, Nederlands en Engels.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t, lang } = useLang();
  const Arrow = lang === "ar" ? ArrowRight : ArrowLeft;
  const sections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <Arrow className="h-4 w-4" /> {t("common.back")}
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">{t("terms.title")}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{t("terms.updated")}</p>
        <p className="mt-6 text-base leading-relaxed text-foreground/90">{t("terms.intro")}</p>

        <div className="mt-8 space-y-8">
          {sections.map((n) => {
            const titleKey = `terms.s${n}.title` as const;
            const bodyKey = `terms.s${n}.body` as const;
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
