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

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.role) {
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
      toast.success("تم إكمال ملفك الشخصي");
      navigate({ to: "/requests" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ");
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
      <h1 className="text-3xl font-bold">أكمل ملفك الشخصي</h1>
      <p className="mt-2 text-muted-foreground">اختر نوع حسابك لبدء استخدام المنصة</p>

      {!role ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setRole("client")}
            className="group rounded-2xl border-2 border-border bg-card p-6 text-right transition hover:border-primary hover:shadow-elegant"
          >
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">أنا زبون</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              أريد نشر طلبات خدمة واستقبال العروض
            </p>
          </button>
          <button
            onClick={() => setRole("professional")}
            className="group rounded-2xl border-2 border-border bg-card p-6 text-right transition hover:border-primary hover:shadow-elegant"
          >
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
              <HardHat className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">أنا صاحب مهنة</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              أقدم خدمات وأريد تقديم عروض على الطلبات
            </p>
          </button>
        </div>
      ) : (
        <Card className="mt-8 p-6 shadow-soft">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>الاسم الكامل</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>المدينة</Label>
              <Select value={city} onValueChange={setCity} required>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مدينتك" />
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
              <Label>رقم الجوال</Label>
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
                  <Label>المهنة الرئيسية</Label>
                  <Select value={profession} onValueChange={setProfession}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مهنتك" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>نبذة عنك (اختياري)</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="سنوات الخبرة، نطاق العمل..."
                    rows={3}
                  />
                </div>
              </>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setRole(null)}>
                رجوع
              </Button>
              <Button type="submit" disabled={loading || !city} className="flex-1">
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إكمال التسجيل
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
