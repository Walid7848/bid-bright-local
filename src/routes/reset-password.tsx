import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useLang, LanguageSwitch } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "وصلة — Nieuw wachtwoord | كلمة مرور جديدة" },
      { name: "description", content: "Stel een nieuw wachtwoord in voor je وصلة-account." },
      { property: "og:title", content: "وصلة — Nieuw wachtwoord instellen" },
      { property: "og:description", content: "Stel een nieuw wachtwoord in via je herstellink." },
      { name: "robots", content: "noindex" },
    ],
  }),
  ssr: false,
  component: ResetPasswordPage,
});

type Status = "checking" | "ready" | "invalid" | "done";

function ResetPasswordPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Capture recovery markers before the auth client consumes/strips them from the URL.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const hasError = hash.has("error") || query.has("error") || hash.has("error_code");
    const isRecoveryLink = hash.get("type") === "recovery" || query.has("code");

    const cleanUrl = () => {
      if (window.location.hash || window.location.search) {
        // Go through the router: a raw history.replaceState is overwritten by the
        // router's own location sync, which re-applied the old hash.
        navigate({ to: "/reset-password", hash: "", search: {}, replace: true });
      }
    };

    if (hasError || !isRecoveryLink) {
      cleanUrl();
      setStatus("invalid");
      return;
    }

    let settled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        settled = true;
        setStatus("ready");
      }
    });

    (async () => {
      const code = query.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          settled = true;
          setStatus("invalid");
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        settled = true;
        setStatus("ready");
      }
    })().catch(() => {
      settled = true;
      setStatus("invalid");
    });

    const cleaner = window.setInterval(() => {
      if (settled) {
        cleanUrl();
        window.clearInterval(cleaner);
      }
    }, 200);

    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanUrl();
        setStatus("invalid");
      }
    }, 6000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(cleaner);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError(t("auth.pwTooShort"));
    if (password !== confirm) return setError(t("auth.pwMismatch"));
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        if (error.status === 401 || error.status === 403) setStatus("invalid");
        else setError(t("auth.genericError"));
        return;
      }
      // End the recovery session; the user signs in again with the new password.
      await supabase.auth.signOut();
      setPassword("");
      setConfirm("");
      setStatus("done");
    } catch {
      setError(t("auth.genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-8 shadow-elegant">
        <div className="mb-4 flex justify-end">
          <LanguageSwitch />
        </div>
        <h1 className="text-2xl font-bold">{t("auth.resetTitle")}</h1>

        {status === "checking" && (
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("auth.resetChecking")}
          </p>
        )}

        {status === "invalid" && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-destructive" role="alert">{t("auth.resetInvalid")}</p>
            <Button asChild className="w-full">
              <Link to="/forgot-password">{t("auth.resetRequestNew")}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">{t("auth.backToLogin")}</Link>
            </Button>
          </div>
        )}

        {status === "done" && (
          <div className="mt-6 space-y-6" role="status">
            <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              <p>{t("auth.resetDone")}</p>
            </div>
            <Button asChild className="w-full">
              <Link to="/auth" replace>{t("auth.backToLogin")}</Link>
            </Button>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">{t("auth.newPassword")}</Label>
              <Input id="new-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} dir="ltr" />
            </div>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t("auth.resetSave")}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
