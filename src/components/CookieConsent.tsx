import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import {
  CONSENT_OPEN_EVENT,
  readConsent,
  writeConsent,
  type ConsentRecord,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const { t, lang } = useLang();
  const [ready, setReady] = useState(false);
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    setRecord(existing);
    setAnalytics(!!existing?.analytics);
    setMarketing(!!existing?.marketing);
    setBannerOpen(!existing);
    setReady(true);

    const onOpen = () => {
      const current = readConsent();
      setAnalytics(!!current?.analytics);
      setMarketing(!!current?.marketing);
      setPrefsOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  function save(next: { analytics: boolean; marketing: boolean }) {
    const saved = writeConsent(next);
    setRecord(saved);
    setAnalytics(saved.analytics);
    setMarketing(saved.marketing);
    setBannerOpen(false);
    setPrefsOpen(false);
  }

  if (!ready) return null;

  return (
    <>
      {bannerOpen && (
        <div
          role="dialog"
          aria-label={t("consent.title")}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-surface/95 p-4 shadow-lg backdrop-blur-lg"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <div className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary shadow-glow sm:grid">
                <Cookie className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold">{t("consent.title")}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("consent.desc")}{" "}
                  <Link to="/cookie-policy" className="underline hover:text-foreground">
                    {t("footer.cookies")}
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setPrefsOpen(true)}>
                {t("consent.customize")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => save({ analytics: false, marketing: false })}
              >
                {t("consent.rejectAll")}
              </Button>
              <Button size="sm" onClick={() => save({ analytics: true, marketing: true })}>
                {t("consent.acceptAll")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent dir={lang === "ar" ? "rtl" : "ltr"} className="sm:max-w-lg">
          <DialogHeader className={lang === "ar" ? "text-right" : "text-left"}>
            <DialogTitle>{t("consent.prefsTitle")}</DialogTitle>
            <DialogDescription>{t("consent.prefsDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <CategoryRow
              title={t("consent.necessary")}
              desc={t("consent.necessary.desc")}
              checked
              disabled
            />
            <CategoryRow
              title={t("consent.analytics")}
              desc={t("consent.analytics.desc")}
              checked={analytics}
              onChange={setAnalytics}
            />
            <CategoryRow
              title={t("consent.marketing")}
              desc={t("consent.marketing.desc")}
              checked={marketing}
              onChange={setMarketing}
            />
          </div>

          {record && (
            <p className="text-xs text-muted-foreground">
              {t("consent.savedAt")}{" "}
              {new Date(record.updatedAt).toLocaleString(
                lang === "ar" ? "ar" : lang === "nl" ? "nl-NL" : "en-GB",
              )}
            </p>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => save({ analytics: false, marketing: false })}
            >
              {t("consent.rejectAll")}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => save({ analytics: true, marketing: true })}
              >
                {t("consent.acceptAll")}
              </Button>
              <Button size="sm" onClick={() => save({ analytics, marketing })}>
                {t("consent.save")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CategoryRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 p-3">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange?.(v)}
        aria-label={title}
      />
    </div>
  );
}
