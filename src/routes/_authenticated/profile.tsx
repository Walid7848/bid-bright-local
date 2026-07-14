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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: role } = useQuery({
    queryKey: ["my-role", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data?.role ?? null;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile-full", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
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
        {role && (
          <Badge variant="secondary">
            {role === "client" ? "زبون" : "صاحب مهنة"}
          </Badge>
        )}
      </div>
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
    </div>
  );
}
