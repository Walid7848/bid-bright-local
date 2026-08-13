import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useLang, LanguageSwitch } from "@/lib/i18n";
import waslaLogo from "@/assets/wasla-logo.png";

type NavItem = { key: "nav.home" | "nav.services" | "nav.providers" | "nav.how" | "nav.about"; hash?: string; to: string };

const NAV_ITEMS: NavItem[] = [
  { key: "nav.home", to: "/", hash: "top" },
  { key: "nav.services", to: "/", hash: "services" },
  { key: "nav.providers", to: "/", hash: "providers" },
  { key: "nav.how", to: "/", hash: "how-it-works" },
  { key: "nav.about", to: "/about" },
];

export function SiteHeader() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-surface/90 backdrop-blur transition-[border-color,box-shadow,background-color] duration-300 ${
        scrolled ? "border-border/70 shadow-soft" : "border-border/30"
      }`}
    >
      <div
        className={`mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 transition-[height] duration-300 ${
          scrolled ? "h-14 md:h-16" : "h-16 md:h-20"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center" aria-label={t("brand.name")}>
          <img
            src={waslaLogo}
            alt={t("brand.name")}
            className={`w-auto transition-[height] duration-300 ${scrolled ? "h-8 md:h-9" : "h-9 md:h-11"}`}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              hash={item.hash}
              className="relative rounded-lg px-3 py-2 text-sm font-medium text-foreground/75 transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-secondary after:transition-transform after:duration-200 hover:text-primary-dark hover:after:scale-x-100"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitch />
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">{t("nav.signIn")}</Link>
          </Button>
          <Button asChild variant="cta" size="sm" className="px-5">
            <Link to="/auth">{t("nav.start")}</Link>
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button asChild variant="cta" size="sm" className="h-10 px-4">
            <Link to="/auth">{t("nav.start")}</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={t("nav.menu")}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border/60 text-primary-dark transition hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="top" className="max-h-[92vh] overflow-y-auto p-0">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <img src={waslaLogo} alt={t("brand.name")} className="h-9 w-auto" />
                <SheetClose asChild>
                  <button
                    type="button"
                    aria-label={t("nav.close")}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-border/60 text-primary-dark transition hover:bg-accent"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>
              </div>

              <nav className="flex flex-col px-2 py-2">
                {NAV_ITEMS.map((item) => (
                  <SheetClose asChild key={item.key}>
                    <Link
                      to={item.to}
                      hash={item.hash}
                      className="rounded-xl px-4 py-3.5 text-base font-semibold text-foreground/85 transition hover:bg-accent hover:text-primary-dark"
                    >
                      {t(item.key)}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="flex flex-col gap-3 border-t border-border/50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{t("nav.language")}</span>
                  <LanguageSwitch className="h-10" />
                </div>
                <SheetClose asChild>
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link to="/auth">{t("nav.signIn")}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="cta" size="lg" className="w-full">
                    <Link to="/auth">{t("nav.start")}</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
