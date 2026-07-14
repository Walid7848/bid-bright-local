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
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/requests/new")({
  component: NewRequest,
});

function NewRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!r) {
        navigate({ to: "/onboarding" });
        return;
      }
      if (r.role !== "client") {
        setAllowed(false);
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("city")
        .eq("id", user.id)
        .maybeSingle();
      if (p?.city) setCity(p.city);
      setAllowed(true);
    })();
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("requests")
        .insert({
          client_id: user.id,
          title,
          description,
          category,
          city,
          budget_min: budgetMin ? Number(budgetMin) : null,
          budget_max: budgetMax ? Number(budgetMax) : null,
          images,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("تم نشر طلبك");
      navigate({ to: "/requests/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ في النشر");
    } finally {
      setLoading(false);
    }
  }

  if (allowed === false) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold">هذه الميزة للزبائن فقط</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          حسابك مسجل كصاحب مهنة، ولا يمكنك نشر طلبات.
        </p>
      </div>
    );
  }
  if (allowed === null || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">طلب خدمة جديد</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        اكتب تفاصيل واضحة وأرفق صوراً لتصلك أفضل العروض
      </p>

      <Card className="mt-6 p-6 shadow-soft">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>عنوان الطلب</Label>
            <Input
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ترجمة عقد زواج معتمد"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>الفئة</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
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
              <Label>المدينة</Label>
              <Select value={city} onValueChange={setCity} required>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
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
          </div>
          <div className="space-y-1.5">
            <Label>الوصف التفصيلي</Label>
            <Textarea
              required
              rows={5}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="صف المشكلة أو المهمة بالتفصيل..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>الميزانية من (€) — اختياري</Label>
              <Input
                type="number"
                min={0}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>الميزانية إلى (€) — اختياري</Label>
              <Input
                type="number"
                min={0}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>الصور</Label>
            <ImageUpload userId={user.id} paths={images} onChange={setImages} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            نشر الطلب
          </Button>
        </form>
      </Card>
    </div>
  );
}
