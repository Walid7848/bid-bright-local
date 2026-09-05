import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CITIES } from "@/lib/cities";
import { CATEGORIES } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { HardHat, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { categoryLabel } from "@/lib/service-search";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [role, setRole] = useState<"client" | "professional" | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (data && data.length > 0) {
        navigate({ to: "/requests" });
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (p?.full_name) setName(p.full_name);
      setChecking(false);
    })();
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !role) return;
    setLoading(true);
    try {
      const { error: pe } = await supabase.from("profiles").update({
        full_name: name,
        city,
        phone,
        bio: role === "professional" ? bio : null,
        profession: role === "professional" ? profession : null,
      }).eq("id", user.id);
      if (pe) throw pe;
      const { error: re } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role,
      });
      if (re) throw re;
      toast.success(t("onb.done"));
      navigate({ to: "/requests" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">{t("onb.title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("onb.subtitle")}</p>

      {!role ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setRole("client")}
            className="group rounded-2xl border-2 border-border bg-card p-6 text-start transition hover:border-primary hover:shadow-elegant"
          >
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">{t("onb.clientTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("onb.clientDesc")}
            </p>
          </button>
          <button
            onClick={() => setRole("professional")}
            className="group rounded-2xl border-2 border-border bg-card p-6 text-start transition hover:border-primary hover:shadow-elegant"
          >
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
              <HardHat className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">{t("onb.proTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("onb.proDesc")}
            </p>
          </button>
        </div>
      ) : (
        <Card className="mt-8 p-6 shadow-soft">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("onb.fullName")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("onb.city")}</Label>
              <Select value={city} onValueChange={setCity} required>
                <SelectTrigger>
                  <SelectValue placeholder={t("onb.cityPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("onb.phone")}</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </div>
            {role === "professional" && (
              <>
                <div className="space-y-1.5">
                  <Label>{t("onb.profession")}</Label>
                  <Select value={profession} onValueChange={setProfession}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("onb.professionPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {categoryLabel(c.id, lang)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("onb.bio")}</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t("onb.bioPlaceholder")}
                    rows={3}
                  />
                </div>
              </>
            )}
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
              <Button type="button" variant="ghost" className="h-11" onClick={() => setRole(null)}>
                {t("onb.back")}
              </Button>
              <Button type="submit" disabled={loading || !city} className="h-11 flex-1">
                {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t("onb.finish")}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
