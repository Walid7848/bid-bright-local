import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useLang, LanguageSwitch } from "@/lib/i18n";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "وصلة — Wachtwoord vergeten | نسيت كلمة المرور" },
      { name: "description", content: "Herstel het wachtwoord van je وصلة-account. استعد كلمة مرور حسابك في وصلة." },
      { property: "og:title", content: "وصلة — Wachtwoord vergeten" },
      { property: "og:description", content: "Vraag een link aan om je wachtwoord opnieuw in te stellen." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError(t("auth.invalidEmail"));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(value, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // Rate limits / network issues get a generic message; never reveal account existence.
      if (error && (error.status === 429 || error.status === undefined || error.status >= 500)) {
        setError(t("auth.genericError"));
        return;
      }
      setSent(true);
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
        <h1 className="text-2xl font-bold">{t("auth.forgotTitle")}</h1>
        {sent ? (
          <div className="mt-6 space-y-6" role="status">
            <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              <p>{t("auth.forgotSent")}</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">{t("auth.backToLogin")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">{t("auth.forgotDesc")}</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                />
              </div>
              {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t("auth.forgotSend")}
              </Button>
              <div className="text-center">
                <Link to="/auth" className="text-sm text-primary hover:underline">
                  {t("auth.backToLogin")}
                </Link>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
