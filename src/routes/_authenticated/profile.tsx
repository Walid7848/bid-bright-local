import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CITIES } from "@/lib/cities";
import { CATEGORIES } from "@/lib/categories";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Star } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { SignedImage } from "@/components/SignedImage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { useRoles, type AppRole } from "@/hooks/useRoles";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const { activeRole: role, roles, hasRole, switchRole } = useRoles();

  const { data: profile } = useQuery({
    queryKey: ["profile-full", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, city, profession, bio, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      const { data: ownPhone } = await supabase.rpc("get_my_phone");
      return data ? { ...data, phone: (ownPhone as string | null) ?? "" } : null;
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setCity(profile.city || "");
      setPhone(profile.phone || "");
      setProfession(profile.profession || "");
      setBio(profile.bio || "");
    }
  }, [profile]);


  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        city,
        phone,
        profession: role === "professional" ? profession : null,
        bio: role === "professional" ? bio : null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ التغييرات");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">ملفي الشخصي</h1>
        {role && <Badge variant="secondary">{t(`role.${role}` as never)}</Badge>}
      </div>
      <Card className="mb-6 p-5 shadow-soft">
        <div className="mb-1 text-sm font-semibold">{t("role.mode")}</div>
        <p className="mb-3 text-xs text-muted-foreground">{t("role.enableHint")}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["client", "professional"] as AppRole[]).map((r) => (
            <Button
              key={r}
              type="button"
              variant={role === r ? "default" : "outline"}
              onClick={async () => {
                if (role === r) return;
                try {
                  await switchRole(r);
                  toast.success(t("role.switched"));
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Error");
                }
              }}
            >
              {t(`role.${r}` as never)}
              {!hasRole(r) && <span className="ms-2 text-xs opacity-70">+</span>}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-6 shadow-soft">
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label>البريد الإلكتروني</Label>
            <Input value={user?.email ?? ""} disabled dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>الاسم الكامل</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>المدينة</Label>
            <Select value={city} onValueChange={setCity}>
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
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
          </div>
          {role === "professional" && (
            <>
              <div className="space-y-1.5">
                <Label>المهنة</Label>
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
                <Label>نبذة عنك</Label>
                <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
            </>
          )}
          <Button type="submit" disabled={saving} className="w-full">
            {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ التغييرات
          </Button>
        </form>
      </Card>

      {role === "professional" && user?.id && <MyReviews professionalId={user.id} />}
    </div>
  );
}

function MyReviews({ professionalId }: { professionalId: string }) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews-received", professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles!reviews_client_profile_fkey(full_name)")
        .eq("professional_id", professionalId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const avg =
    reviews && reviews.length > 0
      ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold">التقييمات المستلمة</h2>
        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold">{avg.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviews.length})</span>
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      ) : !reviews || reviews.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          لا توجد تقييمات بعد
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <Card key={r.id} className="p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {(r.profiles?.full_name || "؟").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">{r.profiles?.full_name || "زبون"}</div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </span>
                  </div>
                  <StarRating value={r.rating} readOnly size={16} />
                </div>
              </div>
              {r.comment && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{r.comment}</p>
              )}
              {r.images?.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-4">
                  {r.images.map((p: string) => (
                    <SignedImage
                      key={p}
                      path={p}
                      className="aspect-square w-full rounded object-cover"
                    />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
